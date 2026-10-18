begin;
-- La preparazione e' disponibile anche prima della pubblicazione del calendario.
-- Una bozza non e' mai una consegna valida per una giornata.
create table caprera.bozze_formazione (
  stagione text not null references caprera.stagioni,
  societa text not null references caprera.societa,
  modulo text not null,
  titolari bigint[] not null,
  panchina bigint[] not null,
  revisione integer not null default 1,
  aggiornata timestamptz not null default clock_timestamp(),
  primary key (stagione, societa)
);
alter table caprera.bozze_formazione enable row level security;
revoke all on caprera.bozze_formazione from public, anon, authenticated;

create or replace function public.la_mia_consegna(p_turno bigint default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  s text := caprera.mia_societa();
  l text;
  anno text;
  v_momento text;
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
  if t.id is null then
    -- Un id esplicito non autorizzato non deve ricadere su un'altra stagione.
    if p_turno is not null then raise exception 'Turno non disponibile.'; end if;
    select st.id into anno from caprera.stagioni st
      join caprera.partecipazioni pa on pa.stagione = st.id and pa.societa = s
      where st.lega = l and not st.conclusa order by st.ordine desc limit 1;
    v_momento := 'corrente';
  else
    anno := t.stagione;
    v_momento := t.rosa_momento;
  end if;
  return jsonb_build_object('societa', s, 'stagione', anno,
    'turno', case when t.id is null then null else to_jsonb(t) end,
    'ora_server', clock_timestamp(),
    'regole', (select regole -> 'campo' from caprera.lega where id = l),
    'rosa', coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id, 'nome', r.nome, 'ruolo', r.ruolo, 'club', r.club) order by r.ruolo, r.nome)
      from caprera.rose r where r.stagione = anno and r.societa = s
        and r.momento = v_momento), '[]'::jsonb),
    'bozza', (select to_jsonb(b) - 'societa' - 'stagione'
      from caprera.bozze_formazione b where b.stagione = anno and b.societa = s),
    'consegna', (select jsonb_build_object('modulo', c.modulo, 'titolari', c.titolari,
      'panchina', c.panchina, 'revisione', c.revisione, 'inviata', c.inviata)
      from caprera.consegne_formazione c where c.turno = t.id and c.societa = s));
end $$;

create function public.salva_la_mia_bozza(
  p_stagione text, p_modulo text, p_titolari bigint[], p_panchina bigint[], p_revisione integer
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  s text := caprera.mia_societa();
  reg jsonb;
  tutti bigint[];
  n integer;
  ruoli integer[];
  b caprera.bozze_formazione%rowtype;
begin
  if auth.uid() is null or s is null then raise exception 'Serve una tessera attiva.'; end if;
  perform pg_advisory_xact_lock(hashtext(s), hashtext(p_stagione));
  select l.regole -> 'campo' into reg from caprera.stagioni st
    join caprera.lega l on l.id = st.lega
    join caprera.societa so on so.lega = st.lega and so.id = s
    join caprera.partecipazioni pa on pa.stagione = st.id and pa.societa = s
    where st.id = p_stagione and not st.conclusa;
  if not found then raise exception 'Società non iscritta a questa stagione aperta.'; end if;
  if reg is null or jsonb_typeof(reg -> 'moduli_ammessi') is distinct from 'array'
    or jsonb_typeof(reg -> 'panchinari') is distinct from 'number' then
    raise exception 'Regole di formazione non configurate.';
  end if;
  if p_modulo is null or not (reg -> 'moduli_ammessi' ? p_modulo) then
    raise exception 'Modulo non ammesso dal regolamento.';
  end if;
  if p_titolari is null or cardinality(p_titolari) <> 11 or p_panchina is null
    or cardinality(p_panchina) > (reg ->> 'panchinari')::integer then
    raise exception 'Servono 11 titolari e una panchina entro il limite previsto.';
  end if;
  tutti := p_titolari || p_panchina;
  select count(distinct x) into n from unnest(tutti) x;
  if n <> cardinality(tutti) then raise exception 'Un giocatore compare più volte o non è valido.'; end if;
  perform 1 from caprera.rose where id = any(tutti) for share;
  select count(*) into n from caprera.rose where id = any(tutti)
    and societa = s and stagione = p_stagione and momento = 'corrente';
  if n <> cardinality(tutti) then raise exception 'Puoi schierare solo giocatori della tua rosa corrente.'; end if;
  if exists (select 1 from caprera.rose where id = any(tutti) and calciatore is not null
    group by calciatore having count(*) > 1) then
    raise exception 'Lo stesso calciatore compare con due nomi nella rosa.';
  end if;
  select array[count(*) filter (where ruolo = 'P'), count(*) filter (where ruolo = 'D'),
    count(*) filter (where ruolo = 'C'), count(*) filter (where ruolo = 'A')]::integer[]
    into ruoli from caprera.rose where id = any(p_titolari);
  if ruoli <> array[1] || string_to_array(p_modulo, '-')::integer[] then
    raise exception 'I ruoli dei titolari non corrispondono al modulo.';
  end if;
  select * into b from caprera.bozze_formazione where stagione = p_stagione and societa = s;
  if p_revisione is null or p_revisione <> coalesce(b.revisione, 0) then
    raise exception 'La bozza è stata aggiornata da un altro dispositivo. Ricarica prima di salvare.';
  end if;
  insert into caprera.bozze_formazione as dest (stagione,societa,modulo,titolari,panchina)
    values (p_stagione,s,p_modulo,p_titolari,p_panchina)
    on conflict (stagione,societa) do update set modulo=excluded.modulo,
      titolari=excluded.titolari,panchina=excluded.panchina,
      revisione=dest.revisione+1,aggiornata=clock_timestamp()
    returning * into b;
  return to_jsonb(b) - 'societa' - 'stagione';
end $$;
revoke all on function public.la_mia_consegna(bigint) from public, anon;
revoke all on function public.salva_la_mia_bozza(text,text,bigint[],bigint[],integer) from public, anon;
grant execute on function public.la_mia_consegna(bigint) to authenticated;
grant execute on function public.salva_la_mia_bozza(text,text,bigint[],bigint[],integer) to authenticated;
notify pgrst, 'reload schema';
commit;
