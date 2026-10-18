-- Consegne nuove, separate dalle formazioni storiche importate da Fantapazz.
-- Nessun turno e nessuna scadenza vengono inventati o aperti dalla migrazione.
begin;
-- L'export odierno e' una rosa corrente, non la fotografia dell'asta o di maggio.
-- Si ammette un terzo momento senza riclassificare alcuna riga esistente.
alter table caprera.rose drop constraint rose_momento_check;
alter table caprera.rose add constraint rose_momento_check
  check (momento in ('partenza', 'fine', 'corrente'));
create table caprera.turni_consegna (
  id bigint generated always as identity primary key,
  stagione text not null references caprera.stagioni,
  giornata integer not null check (giornata > 0),
  scadenza timestamptz not null,
  rosa_momento text not null default 'corrente' check (rosa_momento in ('partenza', 'fine', 'corrente')),
  aperto boolean not null default false,
  unique (stagione, giornata)
);
create table caprera.consegne_formazione (
  turno bigint not null references caprera.turni_consegna,
  societa text not null references caprera.societa,
  modulo text not null,
  titolari bigint[] not null,
  panchina bigint[] not null,
  revisione integer not null default 1,
  inviata timestamptz not null default clock_timestamp(),
  autore uuid not null references auth.users,
  primary key (turno, societa),
  check (cardinality(titolari) = 11)
);
alter table caprera.turni_consegna enable row level security;
alter table caprera.consegne_formazione enable row level security;
-- Nessun accesso diretto: le RPC verificano identita', lega e scadenza.
revoke all on caprera.turni_consegna, caprera.consegne_formazione from anon, authenticated;
revoke all on sequence caprera.turni_consegna_id_seq from public, anon, authenticated;

create function public.la_mia_consegna(p_turno bigint default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s text := caprera.mia_societa();
  l text;
  t caprera.turni_consegna%rowtype;
begin
  if auth.uid() is null or s is null then raise exception 'Serve una tessera attiva.'; end if;
  select lega into l from caprera.societa where id = s;
  select tc.* into t from caprera.turni_consegna tc
    join caprera.stagioni st on st.id = tc.stagione
    join caprera.partecipazioni pa on pa.stagione = st.id and pa.societa = s
    where st.lega = l and not st.conclusa
      and (p_turno is null or tc.id = p_turno)
      and (p_turno is not null or (tc.aperto and tc.scadenza > clock_timestamp()))
    order by tc.scadenza, tc.id limit 1;
  if not found then return jsonb_build_object('societa', s, 'turno', null); end if;
  return jsonb_build_object(
    'societa', s, 'turno', to_jsonb(t), 'ora_server', clock_timestamp(),
    'regole', (select regole -> 'campo' from caprera.lega where id = l),
    'rosa', coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id, 'nome', r.nome, 'ruolo', r.ruolo, 'club', r.club) order by r.ruolo, r.nome)
      from caprera.rose r where r.stagione = t.stagione and r.societa = s
        and r.momento = t.rosa_momento), '[]'::jsonb),
    'consegna', (select jsonb_build_object('modulo', c.modulo, 'titolari', c.titolari,
      'panchina', c.panchina, 'revisione', c.revisione, 'inviata', c.inviata)
      from caprera.consegne_formazione c where c.turno = t.id and c.societa = s));
end $$;

create function public.invia_la_mia_formazione(
  p_turno bigint, p_modulo text, p_titolari bigint[], p_panchina bigint[], p_revisione integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  s text := caprera.mia_societa();
  t caprera.turni_consegna%rowtype;
  reg jsonb;
  tutti bigint[];
  n integer;
  ruoli integer[];
  attesa integer[];
  c caprera.consegne_formazione%rowtype;
begin
  if auth.uid() is null or s is null then raise exception 'Serve una tessera attiva.'; end if;
  -- Serializza anche due primi invii simultanei; il secondo deve rileggere.
  select * into t from caprera.turni_consegna where id = p_turno for update;
  if not found then raise exception 'Turno non disponibile.'; end if;
  select l.regole -> 'campo' into reg from caprera.stagioni st
    join caprera.lega l on l.id = st.lega
    join caprera.societa so on so.lega = st.lega and so.id = s
    join caprera.partecipazioni pa on pa.stagione = st.id and pa.societa = s
    where st.id = t.stagione and not st.conclusa;
  if not found then raise exception 'Società non iscritta a questa stagione aperta.'; end if;
  if not t.aperto or clock_timestamp() >= t.scadenza then
    raise exception 'Consegna chiusa: la formazione non è stata modificata.';
  end if;
  if reg is null or jsonb_typeof(reg -> 'moduli_ammessi') is distinct from 'array'
    or jsonb_typeof(reg -> 'panchinari') is distinct from 'number' then
    raise exception 'Regole di formazione non configurate.';
  end if;
  if p_modulo is null or not (reg -> 'moduli_ammessi' ? p_modulo) then
    raise exception 'Modulo non ammesso dal regolamento.';
  end if;
  if p_titolari is null or cardinality(p_titolari) <> 11 or p_panchina is null
    or reg ->> 'panchinari' is null
    or cardinality(p_panchina) > (reg ->> 'panchinari')::integer then
    raise exception 'Servono 11 titolari e una panchina entro il limite previsto.';
  end if;
  tutti := p_titolari || p_panchina;
  select count(distinct x) into n from unnest(tutti) x;
  if n <> cardinality(tutti) then raise exception 'Un giocatore compare più volte o non è valido.'; end if;
  -- Blocca la rosa mentre si controlla e registra la consegna.
  perform 1 from caprera.rose where id = any(tutti) for share;
  select count(*) into n from caprera.rose
    where id = any(tutti) and societa = s and stagione = t.stagione and momento = t.rosa_momento;
  if n <> cardinality(tutti) then raise exception 'Puoi schierare solo giocatori della tua rosa di questa stagione.'; end if;
  if exists (select 1 from caprera.rose where id = any(tutti) and calciatore is not null
    group by calciatore having count(*) > 1) then
    raise exception 'Lo stesso calciatore compare con due nomi nella rosa.';
  end if;
  select array[count(*) filter (where ruolo = 'P'), count(*) filter (where ruolo = 'D'),
    count(*) filter (where ruolo = 'C'), count(*) filter (where ruolo = 'A')]::integer[]
    into ruoli from caprera.rose where id = any(p_titolari);
  attesa := array[1] || string_to_array(p_modulo, '-')::integer[];
  if ruoli <> attesa then raise exception 'I ruoli dei titolari non corrispondono al modulo.'; end if;
  select * into c from caprera.consegne_formazione where turno = t.id and societa = s;
  if p_revisione is null or p_revisione <> coalesce(c.revisione, 0) then
    raise exception 'La formazione è stata aggiornata da un altro dispositivo. Ricarica prima di inviare.';
  end if;
  -- Ricontrolla dopo i lock: il tempo trascorso in attesa conta.
  if clock_timestamp() >= t.scadenza then raise exception 'Consegna chiusa.'; end if;
  insert into caprera.consegne_formazione as dest
    (turno, societa, modulo, titolari, panchina, autore)
    values (t.id, s, p_modulo, p_titolari, p_panchina, auth.uid())
    on conflict (turno, societa) do update set modulo = excluded.modulo,
      titolari = excluded.titolari, panchina = excluded.panchina,
      autore = excluded.autore, revisione = dest.revisione + 1, inviata = clock_timestamp()
    returning * into c;
  return jsonb_build_object('modulo', c.modulo, 'titolari', c.titolari,
    'panchina', c.panchina, 'revisione', c.revisione, 'inviata', c.inviata);
end $$;
revoke all on function public.la_mia_consegna(bigint) from public, anon;
revoke all on function public.invia_la_mia_formazione(bigint,text,bigint[],bigint[],integer) from public, anon;
grant execute on function public.la_mia_consegna(bigint) to authenticated;
grant execute on function public.invia_la_mia_formazione(bigint,text,bigint[],bigint[],integer) to authenticated;
commit;
