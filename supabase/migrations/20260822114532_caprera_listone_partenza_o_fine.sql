-- Una quotazione senza la data e' mezza informazione.
--
-- Fantapazz muove le quotazioni durante l'anno: chi si fa male scende, chi
-- segna sale. Il numero che conta per l'asta e' quello **prima della prima
-- giornata**, perche' e' quello che i mister avevano davanti quando hanno
-- rilanciato. Nel 2025-26 si vede a occhio: Yildiz e' quotato 27 sul listone
-- di partenza e 46 su quello scaricato dopo, ma alla Disperata e' costato 1.
--
-- In archivio oggi c'e' una stagione fotografata prima (2025-26, dal file
-- `Listone_Fantapazz.csv`) e nove fotografate dopo (dalla cartella `Listoni/`,
-- che si riconoscono: centinaia di righe a quotazione zero, piu' di venti
-- squadre nominate, tetti piu' alti). Erano indistinguibili. Adesso no.
--
-- Quando arrivano i dati di Guido, gli inizi delle stagioni vecchie si
-- caricano accanto a queste righe senza cancellarle: la chiave lo permette.

alter table caprera.listone
  add column momento text not null default 'fine'
    check (momento in ('partenza', 'fine'));

update caprera.listone set momento = 'partenza' where stagione = '2025-26';

-- Il default serviva solo a riempire le righe che c'erano gia'. Da qui in
-- avanti chi carica deve dire di che momento parla.
alter table caprera.listone alter column momento drop default;

drop index if exists caprera.listone_stagione_nome_ruolo_club_idx;
drop index if exists caprera.listone_chiave_idx;

create unique index listone_chiave_idx on caprera.listone
  (stagione, momento, nome, ruolo, coalesce(club, ''));

comment on column caprera.listone.momento is
  'partenza = listone prima della prima giornata, il prezzo che i mister '
  'avevano davanti all''asta. fine = quotazione scaricata a stagione in corso '
  'o finita: dice quanto vale il giocatore adesso, non quanto valeva allora.';

-- La vista pubblica va rifatta, non modificata: si aggiunge una colonna in
-- mezzo e Postgres non rinomina le colonne di una vista.
drop view if exists public.listone;

create view public.listone
  with (security_invoker = on) as
  select stagione, momento, nome, ruolo, club, prezzo from caprera.listone;

grant select on public.listone to anon, authenticated;
