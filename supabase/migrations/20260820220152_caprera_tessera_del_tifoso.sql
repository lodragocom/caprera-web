-- ==================================================================
--  La Tessera del Tifoso
--
--  Il problema da risolvere: la Presidenza vuole decidere chi vede quale
--  societa', ma un utente non esiste finche' non si registra. Non si puo'
--  quindi scrivere "questa persona e' il mister del Prosecco" prima che la
--  persona ci sia.
--
--  La tessera scioglie il nodo. E' intestata a un **indirizzo email**, non a
--  un utente: la Presidenza la emette quando vuole, anche a societa' vuota di
--  persone. Quando poi qualcuno si registra con quell'email, la tessera si
--  attiva da sola e diventa una riga in `misteri`.
--
--  Chi entra con un'email senza tessera ha un account e nessuna societa':
--  vede la porta chiusa e un messaggio che glielo dice. Non un errore.
-- ==================================================================
create table caprera.tessere (
  email    text primary key,
  societa  text not null references caprera.societa on delete cascade,
  nome     text,
  ruolo    text not null default 'mister' check (ruolo in ('mister','presidenza')),
  emessa   timestamptz not null default now(),
  usata_il timestamptz,
  note     text
);

comment on table caprera.tessere is
  'Chi ha diritto a entrare e per quale societa''. Si emette prima della registrazione.';

create index on caprera.tessere (societa);

-- L'email si confronta senza badare a maiuscole e spazi: chi scrive
-- " Mario@Fantapazz.it " deve entrare come chi scrive "mario@fantapazz.it".
create or replace function caprera.normalizza_email() returns trigger
  language plpgsql as $$
begin
  new.email := lower(btrim(new.email));
  return new;
end $$;

create trigger tessere_normalizza before insert or update on caprera.tessere
  for each row execute function caprera.normalizza_email();


-- ---------------------------------------------------- attivazione
-- Due strade portano allo stesso risultato, perche' l'ordine non e'
-- prevedibile: a volte la tessera esiste gia' e arriva la persona, a volte
-- la persona c'e' gia' e la tessera arriva dopo.

/** Collega un utente alla sua societa', se ha una tessera. */
create or replace function caprera.attiva_tessera(p_utente uuid, p_email text)
  returns void
  language plpgsql security definer set search_path = caprera, public, auth as $$
declare t caprera.tessere%rowtype;
begin
  select * into t from caprera.tessere where email = lower(btrim(p_email));
  if not found then return; end if;

  insert into caprera.misteri (utente, societa, nome, ruolo)
       values (p_utente, t.societa, t.nome, t.ruolo)
  on conflict (utente) do update
     set societa = excluded.societa, nome = excluded.nome, ruolo = excluded.ruolo;

  update caprera.tessere set usata_il = coalesce(usata_il, now())
   where email = t.email;
end $$;

/** Quando nasce un utente: se ha la tessera, entra subito. */
create or replace function caprera.utente_nuovo() returns trigger
  language plpgsql security definer set search_path = caprera, public, auth as $$
begin
  perform caprera.attiva_tessera(new.id, new.email);
  return new;
end $$;

create trigger caprera_utente_nuovo after insert on auth.users
  for each row execute function caprera.utente_nuovo();

/** Quando nasce una tessera: se la persona esiste gia', si collega subito. */
create or replace function caprera.tessera_nuova() returns trigger
  language plpgsql security definer set search_path = caprera, public, auth as $$
declare u uuid;
begin
  select id into u from auth.users where lower(email) = new.email limit 1;
  if u is not null then perform caprera.attiva_tessera(u, new.email); end if;
  return new;
end $$;

create trigger caprera_tessera_nuova after insert or update on caprera.tessere
  for each row execute function caprera.tessera_nuova();


-- ---------------------------------------------------- chi vede cosa
alter table caprera.tessere enable row level security;

-- Le tessere le vede solo la Presidenza: sono indirizzi email di persone.
create policy tessere_presidenza on caprera.tessere
  for select using (caprera.sono_presidenza());

-- La propria societa', per il sito: una riga sola, la tua.
create or replace view public.la_mia_tessera
with (security_invoker = on) as
  select societa, nome, ruolo from caprera.misteri where utente = auth.uid();

grant select on public.la_mia_tessera to authenticated;

-- Contratti e crediti tornano leggibili, ma solo dai loro. La vista eredita
-- le regole di riga della tabella sotto, che mostrano a ciascuno i propri.
create or replace view public.contratti_miei
with (security_invoker = on) as
  select societa, nome, ruolo, under, dalla, alla, anni, clausola, ingaggio
    from caprera.contratti;

create or replace view public.finanze_mie
with (security_invoker = on) as
  select stagione, societa, iniziali, spesi, scambi, residui, riportati, bonus, ffp
    from caprera.finanze;

-- `authenticated` e basta: a un visitatore anonimo queste non si concedono.
grant select on public.contratti_miei to authenticated;
grant select on public.finanze_mie   to authenticated;
