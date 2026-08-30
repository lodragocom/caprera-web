-- ==================================================================
--  Gli incarichi della lega, e la scheda della Tessera del Tifoso.
--
--  Fino a ieri il ruolo era uno solo e scritto in una colonna: mister o
--  presidenza. Bastava finche' comandava una persona sola. Ma una lega ha
--  incarichi che si aprono e si chiudono - chi tiene i conti, chi arbitra le
--  contestazioni, chi apre e chiude il mercato - e possono stare in capo alla
--  stessa persona o a nessuno.
--
--  Quindi non un ruolo, ma un elenco di incarichi e un elenco di
--  assegnazioni. Aprirne uno nuovo domani e' una riga di dati, non una
--  modifica al codice.
-- ==================================================================

create table caprera.incarichi (
  id        text primary key,
  nome      text not null,
  descrizione text,
  -- chi ha questo incarico vede i dati di tutte le societa'
  vede_tutto  boolean not null default false,
  -- chi ha questo incarico puo' scrivere nell'archivio
  puo_scrivere boolean not null default false,
  ordine    int not null default 0
);

insert into caprera.incarichi (id, nome, descrizione, vede_tutto, puo_scrivere, ordine) values
  ('presidenza',  'Presidenza',       'Governo della Federazione: regolamento, delibere, ultima parola.', true,  true,  1),
  ('tesoriere',   'Tesoriere',        'Crediti, montepremi, quote di iscrizione, FFP.',                     true,  true,  2),
  ('mercato',     'Direttore Mercato','Asta, contratti, Jobs Act e Cura Caprera.',                          true,  true,  3),
  ('arbitro',     'Giudice Sportivo', 'Contestazioni su risultati e calcoli, casi non previsti.',           true,  false, 4),
  ('stampa',      'Addetto Stampa',   'Comunicazioni ai mister e cronache della lega.',                     false, false, 5),
  ('mister',      'Mister',           'Guida una societa'': formazioni, rosa, contratti suoi.',             false, false, 9);

create table caprera.assegnazioni (
  utente   uuid not null references auth.users on delete cascade,
  incarico text not null references caprera.incarichi on delete cascade,
  dal      timestamptz not null default now(),
  al       timestamptz,
  primary key (utente, incarico)
);

create index on caprera.assegnazioni (incarico);

-- Anche le tessere possono portare incarichi, cosi' la Presidenza li assegna
-- prima che la persona si registri, come per la societa'.
alter table caprera.tessere add column if not exists incarichi text[] not null default '{}';


-- --------------------------------------------------- la scheda personale
-- I dati che il mister governa da solo. Il telefono non e' come gli altri:
-- lo vedono lui e chi ha un incarico che vede tutto, nessun altro. Per questo
-- la scheda pubblica e la scheda privata sono due finestre diverse.
create table caprera.schede (
  utente     uuid primary key references auth.users on delete cascade,
  nome       text,
  cognome    text,
  soprannome text,
  telefono   text,
  videochiamata text,          -- il collegamento per l'asta
  aggiornata timestamptz not null default now()
);

create or replace function caprera.tocca_scheda() returns trigger
  language plpgsql as $$
begin new.aggiornata := now(); return new; end $$;

create trigger schede_tocca before update on caprera.schede
  for each row execute function caprera.tocca_scheda();


-- ------------------------------------------------------- chi puo' cosa
/** Gli incarichi di chi sta chiedendo, adesso. */
create or replace function caprera.miei_incarichi() returns text[]
  language sql stable security definer set search_path = caprera, public, auth as $$
  select coalesce(array_agg(incarico), '{}')
    from caprera.assegnazioni
   where utente = auth.uid() and (al is null or al > now())
$$;

/** Vero se chi chiede ha un incarico che vede i dati di tutte le societa'. */
create or replace function caprera.vede_tutto() returns boolean
  language sql stable security definer set search_path = caprera, public, auth as $$
  select exists (
    select 1 from caprera.assegnazioni a
      join caprera.incarichi i on i.id = a.incarico
     where a.utente = auth.uid() and (a.al is null or a.al > now()) and i.vede_tutto)
$$;

-- `sono_presidenza` resta, ma adesso vuol dire "ha un incarico che vede
-- tutto": cosi' le regole di riga scritte ieri continuano a valere e il
-- tesoriere non deve essere nominato presidente per fare il suo lavoro.
create or replace function caprera.sono_presidenza() returns boolean
  language sql stable security definer set search_path = caprera, public, auth as $$
  select caprera.vede_tutto()
$$;


-- ------------------------------------------------------- attivazione
-- Quando si attiva una tessera si assegnano anche i suoi incarichi.
create or replace function caprera.attiva_tessera(p_utente uuid, p_email text)
  returns void
  language plpgsql security definer set search_path = caprera, public, auth as $$
declare t caprera.tessere%rowtype; i text;
begin
  select * into t from caprera.tessere where email = lower(btrim(p_email));
  if not found then return; end if;

  insert into caprera.misteri (utente, societa, nome, ruolo)
       values (p_utente, t.societa, t.nome, t.ruolo)
  on conflict (utente) do update
     set societa = excluded.societa, nome = excluded.nome, ruolo = excluded.ruolo;

  -- l'incarico di mister ce l'ha chiunque guidi una societa'
  insert into caprera.assegnazioni (utente, incarico) values (p_utente, 'mister')
  on conflict do nothing;

  foreach i in array t.incarichi loop
    insert into caprera.assegnazioni (utente, incarico) values (p_utente, i)
    on conflict do nothing;
  end loop;

  -- la scheda nasce vuota, con il nome che la Presidenza aveva scritto
  insert into caprera.schede (utente, nome) values (p_utente, t.nome)
  on conflict (utente) do nothing;

  if t.usata_il is null then
    update caprera.tessere set usata_il = now() where email = t.email;
  end if;
end $$;

grant execute on function caprera.attiva_tessera(uuid, text) to supabase_auth_admin;
