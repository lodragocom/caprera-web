-- ============================================================================
-- Il diario della Federazione.
--
-- Una lega non si governa solo con tabelle: si governa anche con le cose da
-- fare, le decisioni prese, i referendum da indire e le note che fra sei mesi
-- spiegano perche' si e' scelto cosi'. Finora quelle vivevano in WhatsApp e
-- nella testa di L0 — che e' lo stesso posto, e non e' un posto.
--
-- Quattro cose in una tabella sola, e non e' pigrizia: una nota diventa un
-- compito, un compito diventa un referendum, e tenerle separate vorrebbe dire
-- ricopiarle. Cambia il `tipo`, non la riga.
--
-- ⚠️ Gli **eventi** non li scrive nessuno: li scrive il sistema. Quando un
-- mister si registra, il diario se ne accorge da solo — cosi' la Presidenza
-- vede cosa e' successo anche senza che nessuno le abbia scritto.
-- ============================================================================

create table if not exists caprera.diario (
  id        bigint generated always as identity primary key,
  stagione  text references caprera.stagioni(id) on delete set null,
  tipo      text not null,
  titolo    text not null,
  testo     text,
  stato     text not null default 'aperto',
  scadenza  date,
  societa   text references caprera.societa(id) on delete set null,
  autore    uuid,
  creato    timestamptz not null default now(),
  chiuso    timestamptz,
  constraint diario_tipo_check  check (tipo  = any (array['task','nota','referendum','evento'])),
  constraint diario_stato_check check (stato = any (array['aperto','fatto','archiviato']))
);

comment on table caprera.diario is
  'Cose da fare, note, referendum ed eventi della Federazione. Gli eventi li '
  'scrive il sistema; il resto la Presidenza.';

create index if not exists diario_aperti_idx on caprera.diario (stato, creato desc);

alter table caprera.diario enable row level security;

-- Lo legge chi governa. Non i mister: qui dentro ci finiscono cose che
-- riguardano loro e che non e' detto siano gia' decise.
create policy diario_lo_legge_il_governo
  on caprera.diario for select to authenticated using (caprera.vede_tutto());
create policy diario_lo_scrive_il_governo
  on caprera.diario for all to authenticated
  using (caprera.vede_tutto()) with check (caprera.vede_tutto());


-- ---------------------------------------------------------------- leggerlo
create or replace function public.diario_lega(p_stato text default 'aperto')
returns table (
  id bigint, tipo text, titolo text, testo text, stato text,
  stagione text, societa text, nome_societa text,
  scadenza date, creato timestamptz, scaduto boolean, giorni int
)
language sql
security definer
set search_path = caprera, public, pg_temp
stable
as $$
  select d.id, d.tipo, d.titolo, d.testo, d.stato,
         d.stagione, d.societa, s.nome,
         d.scadenza, d.creato,
         (d.scadenza is not null and d.scadenza < current_date and d.stato = 'aperto'),
         case when d.scadenza is not null then (d.scadenza - current_date)::int end
    from caprera.diario d
    left join caprera.societa s on s.id = d.societa
   where caprera.vede_tutto()
     and (p_stato = 'tutti' or d.stato = p_stato)
   -- prima cio' che scade, poi il resto dal piu' recente: una scadenza passata
   -- in fondo alla pagina e' una scadenza che non si vede
   order by (d.scadenza is null), d.scadenza, d.creato desc;
$$;

revoke all on function public.diario_lega(text) from public, anon;
grant execute on function public.diario_lega(text) to authenticated;


-- --------------------------------------------------------------- scriverlo
create or replace function public.salva_voce_diario(
  p_id bigint, p_tipo text, p_titolo text, p_testo text default null,
  p_scadenza date default null, p_stagione text default null,
  p_societa text default null)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare t text;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' scrivere nel diario.';
  end if;
  t := btrim(coalesce(p_titolo, ''));
  if t = '' then
    raise exception 'Una voce senza titolo non si salva.';
  end if;
  -- Gli eventi li scrive il sistema: se li scrivesse anche una persona non si
  -- distinguerebbe piu' cio' che e' successo da cio' che qualcuno ricorda.
  if p_tipo = 'evento' then
    raise exception 'Gli eventi li registra il sistema, non si scrivono a mano.';
  end if;

  if p_id is null then
    insert into caprera.diario (tipo, titolo, testo, scadenza, stagione, societa, autore)
         values (p_tipo, t, nullif(btrim(coalesce(p_testo,'')),''),
                 p_scadenza, p_stagione, p_societa, auth.uid());
    return format('Aggiunto: %s.', t);
  end if;

  update caprera.diario
     set tipo = p_tipo, titolo = t, testo = nullif(btrim(coalesce(p_testo,'')),''),
         scadenza = p_scadenza, stagione = p_stagione, societa = p_societa
   where id = p_id and tipo <> 'evento';
  if not found then
    raise exception 'Nessuna voce con questo numero, o e'' un evento.';
  end if;
  return format('Aggiornato: %s.', t);
end;
$$;

revoke all on function public.salva_voce_diario(bigint, text, text, text, date, text, text)
  from public, anon;
grant execute on function public.salva_voce_diario(bigint, text, text, text, date, text, text)
  to authenticated;


create or replace function public.chiudi_voce_diario(p_id bigint, p_stato text)
returns text
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare d caprera.diario;
begin
  if not caprera.vede_tutto() then
    raise exception 'Solo chi ha un incarico di governo puo'' cambiare il diario.';
  end if;
  update caprera.diario
     set stato = p_stato, chiuso = case when p_stato = 'aperto' then null else now() end
   where id = p_id returning * into d;
  if d.id is null then
    raise exception 'Nessuna voce con questo numero.';
  end if;
  return format('%s: %s.',
    case p_stato when 'fatto' then 'Fatto' when 'archiviato' then 'Archiviato'
                 else 'Riaperto' end, d.titolo);
end;
$$;

revoke all on function public.chiudi_voce_diario(bigint, text) from public, anon;
grant execute on function public.chiudi_voce_diario(bigint, text) to authenticated;


-- ------------------------------------------------- il diario si scrive da solo
-- Quando un mister si registra, la Presidenza deve saperlo. Finora non lo
-- sapeva: il trigger attivava la tessera e tirava dritto.
create or replace function caprera.diario_utente_nuovo()
returns trigger
language plpgsql
security definer
set search_path = caprera, public, pg_temp
as $$
declare t caprera.tessere;
begin
  select * into t from caprera.tessere where email = lower(new.email);
  insert into caprera.diario (tipo, titolo, testo, societa, stagione)
       values ('evento',
               case when t.societa is not null
                    then format('%s si è registrato', coalesce(t.nome, new.email))
                    else format('%s si è registrato, senza tessera', new.email) end,
               case when t.societa is not null
                    then format('Tessera di %s, attivata all''accesso.', t.societa)
                    else 'Nessuna tessera intestata a questo indirizzo: ha un accesso e nessuna società.' end,
               t.societa,
               (select id from caprera.stagioni order by ordine desc limit 1));
  return new;
exception when others then
  -- Un diario che non si scrive non deve impedire a nessuno di entrare: vale
  -- la stessa regola dell'attivazione della tessera (ADR-003).
  raise warning 'diario non scritto per %: % %', new.email, SQLSTATE, SQLERRM;
  return new;
end;
$$;

drop trigger if exists caprera_diario_utente_nuovo on auth.users;
create trigger caprera_diario_utente_nuovo
  after insert on auth.users
  for each row execute function caprera.diario_utente_nuovo();
