-- Federazione Caprera — schema dell'archivio.
-- Tutto dentro uno schema suo: 'public' su Supabase e' affollato.
create schema if not exists caprera;
set search_path = caprera, public;

-- Una riga sola oggi, ma il progetto deve poter ospitare altre leghe:
-- il motore di calcolo legge le regole da qui e non ha numeri cuciti dentro.
create table caprera.lega (
  id          text primary key,
  nome        text not null,
  dal         int  not null,
  regole      jsonb not null default '{}'::jsonb,
  regole_versione text,
  aggiornato  timestamptz not null default now()
);

create table caprera.stagioni (
  id        text primary key,
  lega      text not null references caprera.lega on delete cascade,
  ordine    int  not null,
  giornate  int  not null default 36,
  conclusa  boolean not null default false,
  unique (lega, ordine)
);

create table caprera.societa (
  id      text primary key,
  lega    text not null references caprera.lega on delete cascade,
  nome    text not null,
  breve   text not null,
  sigla   text not null,
  logo    text,
  colore  text not null,
  attiva  boolean not null default true
);

-- I nomi di prima restano: un archivio che riscrive la storia non serve.
create table caprera.societa_nomi_storici (
  societa text not null references caprera.societa on delete cascade,
  nome    text not null,
  primary key (societa, nome)
);

create table caprera.partecipazioni (
  stagione text not null references caprera.stagioni on delete cascade,
  societa  text not null references caprera.societa  on delete cascade,
  primary key (stagione, societa)
);

create table caprera.competizioni (
  id        text primary key,
  lega      text not null references caprera.lega on delete cascade,
  nome      text not null,
  tipo      text not null check (tipo in ('campionato','eliminazione','gironi','classifica')),
  colore    text,
  ordine    int  not null default 0,
  dalla_stagione text references caprera.stagioni
);

create table caprera.edizioni (
  id            bigserial primary key,
  competizione  text not null references caprera.competizioni on delete cascade,
  stagione      text not null references caprera.stagioni     on delete cascade,
  vincitore     text references caprera.societa,
  finalista     text references caprera.societa,
  ai_fantapunti boolean not null default false,
  in_parita     boolean not null default false,
  unique (competizione, stagione)
);

-- I turni come li registra Fantapazz. La lettura del tabellone - accoppiare
-- andata e ritorno, riconoscere la finale - resta un calcolo, non un dato.
create table caprera.turni (
  id       bigserial primary key,
  edizione bigint not null references caprera.edizioni on delete cascade,
  ordine   int    not null,
  nome     text   not null,
  unique (edizione, ordine)
);

-- Una tabella sola per campionato e coppe. Tenerle separate e' esattamente
-- l'errore che ha rotto la pagina Coppe: il calendario diceva 'home/homeGoals',
-- le coppe 'casa/golCasa'. Qui la forma e' una e la fa rispettare il database.
create table caprera.partite (
  id           bigserial primary key,
  stagione     text not null references caprera.stagioni     on delete cascade,
  competizione text not null references caprera.competizioni on delete cascade,
  giornata     int,
  turno        bigint references caprera.turni on delete cascade,
  casa         text not null references caprera.societa,
  fuori        text not null references caprera.societa,
  gol_casa     int,
  gol_fuori    int,
  fp_casa      numeric(6,2),
  fp_fuori     numeric(6,2),
  giocata      boolean not null default false,
  constraint squadre_diverse check (casa <> fuori),
  constraint collocata check (num_nonnulls(giornata, turno) = 1),
  constraint risultato_coerente check (
    (giocata and gol_casa is not null and gol_fuori is not null)
    or (not giocata and gol_casa is null and gol_fuori is null)
  )
);

create index on caprera.partite (stagione, competizione);
create index on caprera.partite (competizione, stagione, giornata);
create index on caprera.partite (casa);
create index on caprera.partite (fuori);
create index on caprera.partite (turno);
create unique index partite_campionato_unica
  on caprera.partite (stagione, competizione, giornata, casa, fuori)
  where giornata is not null;

-- La classifica ufficiale come l'ha pubblicata Fantapazz. In vista c'e' la
-- stessa classifica ricalcolata dalle partite: devono coincidere.
create table caprera.classifiche (
  stagione    text not null references caprera.stagioni on delete cascade,
  societa     text not null references caprera.societa  on delete cascade,
  posizione   int  not null,
  giocate     int  not null,
  vinte       int  not null,
  pari        int  not null,
  perse       int  not null,
  gol_fatti   int  not null,
  gol_subiti  int  not null,
  punti       int  not null,
  fantapunti  numeric(8,2) not null,
  primary key (stagione, societa),
  unique (stagione, posizione)
);

-- L'id e' quello di Fantapazz: stabile fra stagioni. Per 35 calciatori su
-- 1.244 cambia solo il modo di scrivere il cognome ('Zapata' / 'Zapata D.').
create table caprera.calciatori (
  id     int primary key,
  nome   text not null,
  ruolo  char(1) check (ruolo in ('P','D','C','A')),
  club   text
);

create table caprera.calciatori_nomi (
  calciatore int  not null references caprera.calciatori on delete cascade,
  nome       text not null,
  primary key (calciatore, nome)
);

create index on caprera.calciatori using gin (to_tsvector('simple', nome));

create table caprera.rose (
  id         bigserial primary key,
  stagione   text not null references caprera.stagioni on delete cascade,
  societa    text not null references caprera.societa  on delete cascade,
  calciatore int  references caprera.calciatori,
  nome       text not null,
  ruolo      char(1) not null check (ruolo in ('P','D','C','A')),
  club       text,
  costo      int,
  presenze   int,
  mv         numeric(4,2),
  fm         numeric(4,2),
  unique (stagione, societa, nome)
);

create index on caprera.rose (stagione, societa);
create index on caprera.rose (calciatore);

create table caprera.listone (
  stagione text not null references caprera.stagioni on delete cascade,
  nome     text not null,
  ruolo    char(1) not null check (ruolo in ('P','D','C','A')),
  club     text,
  prezzo   int not null,
  primary key (stagione, nome)
);

create table caprera.formazioni (
  id       bigserial primary key,
  partita  bigint not null references caprera.partite on delete cascade,
  societa  text   not null references caprera.societa,
  mister   text,
  modulo   text,
  -- come la scrive Fantapazz: 'Sabato 6 Mag - 17:09', senza anno
  inviata  text,
  avviso   text,
  unique (partita, societa)
);

create index on caprera.formazioni (societa);

-- `ordine` non e' un vezzo: nella panchina e' l'ordine in cui il mister ha
-- messo le riserve ed e' cio' che decide chi entra al posto di chi. Non si tocca.
create table caprera.formazione_giocatori (
  id          bigserial primary key,
  formazione  bigint not null references caprera.formazioni on delete cascade,
  titolare    boolean not null,
  ordine      int     not null,
  calciatore  int     references caprera.calciatori,
  nome        text    not null,
  ruolo       char(1) not null check (ruolo in ('P','D','C','A')),
  sfida       text,
  voto        numeric(4,2),
  fascia      text check (fascia in ('C','VC')),
  entrato     boolean not null default false,
  unique (formazione, titolare, ordine)
);

create index on caprera.formazione_giocatori (calciatore);
create index on caprera.formazione_giocatori (formazione);

create table caprera.bonus_tipi (
  id    text primary key,
  nome  text not null,
  valore numeric(4,2)
);

create table caprera.formazione_bonus (
  giocatore bigint not null references caprera.formazione_giocatori on delete cascade,
  bonus     text   not null references caprera.bonus_tipi,
  quante    int    not null default 1 check (quante > 0),
  primary key (giocatore, bonus)
);

-- `valore` puo' essere vuoto: in 22 formazioni su 4.950 Fantapazz scrive la
-- riga "Modificatore difesa" senza il numero accanto. Non lo inventiamo.
create table caprera.formazione_modificatori (
  formazione bigint not null references caprera.formazioni on delete cascade,
  nome       text   not null,
  valore     numeric(5,2),
  primary key (formazione, nome)
);

create table caprera.contratti (
  id         bigserial primary key,
  societa    text not null references caprera.societa on delete cascade,
  calciatore int  references caprera.calciatori,
  nome       text not null,
  ruolo      char(1) not null check (ruolo in ('P','D','C','A')),
  under      boolean not null default false,
  dalla      text not null references caprera.stagioni,
  alla       text not null references caprera.stagioni,
  anni       int  not null check (anni between 1 and 5),
  clausola   int,
  ingaggio   int
);

create index on caprera.contratti (societa);

create table caprera.finanze (
  stagione   text not null references caprera.stagioni on delete cascade,
  societa    text not null references caprera.societa  on delete cascade,
  iniziali   int not null,
  spesi      int not null default 0,
  scambi     int not null default 0,
  residui    int not null default 0,
  riportati  int not null default 0,
  bonus      int not null default 0,
  ffp        int not null default 0,
  primary key (stagione, societa)
);

-- Il ponte fra l'utente autenticato e la sua societa': e' la tabella su cui
-- si regge tutta la separazione fra pubblico e privato.
create table caprera.misteri (
  utente  uuid primary key references auth.users on delete cascade,
  societa text not null references caprera.societa on delete cascade,
  nome    text,
  ruolo   text not null default 'mister' check (ruolo in ('mister','presidenza')),
  dal     timestamptz not null default now()
);

create index on caprera.misteri (societa);
