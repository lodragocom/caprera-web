-- Chi se n'e' andato, e come si sa.
--
-- Il registro dei crediti risponde alla domanda «quanto e' costato». Questa tabella
-- risponde a un'altra: «dov'e' finito». Sono due domande diverse e meritano due posti
-- diversi - e' per questo che i settantadue nomi a zero non stavano bene in movimenti.
--
-- La colonna che conta e' 'certezza', e vale piu' del resto:
--   documento -> c'e' un contratto firmato e depositato
--   foglio    -> lo scrive il foglio delle rose (svincoli, scambi, chi c'era a settembre
--                e non c'e' piu' a maggio)
--   campo     -> non lo scrive nessuno, lo dicono le formazioni: uno che e' sceso in campo
--                con quella maglia e a maggio non e' piu' in rosa.
-- L'ultima e' un indizio, non un fatto. Dal 2016-17 al 2019-20 la lega si teneva con carta
-- e penna e le rose si trascrivevano dopo: chi manca a maggio puo' essere uno che se n'e'
-- andato oppure uno che nella trascrizione e' caduto. Chi legge deve poterlo distinguere,
-- e con questa colonna puo'.
create table if not exists caprera.passaggi (
  id         bigint generated always as identity primary key,
  stagione   text not null references caprera.stagioni(id) on delete cascade,
  calciatore integer references caprera.calciatori(id),
  nome       text not null,
  da         text references caprera.societa(id),
  a          text references caprera.societa(id),
  tipo       text not null check (tipo in ('svincolo','scambio','uscita')),
  finestra   text,
  certezza   text not null check (certezza in ('documento','foglio','campo')),
  fonte      text not null,
  nota       text
);

comment on table caprera.passaggi is
  'Uscite e scambi. Una riga per giocatore che lascia una societa in una stagione.';
comment on column caprera.passaggi.certezza is
  'documento = contratto firmato; foglio = scritto nel foglio rose; campo = dedotto dalle formazioni (indizio, non fatto).';

create unique index if not exists passaggi_una_uscita
  on caprera.passaggi (stagione, calciatore, da) where calciatore is not null;
create index if not exists passaggi_stagione on caprera.passaggi (stagione, da);

alter table caprera.passaggi enable row level security;
create policy passaggi_lettura on caprera.passaggi for select using (true);
