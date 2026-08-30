-- Nel foglio di Fantapazz i voti esistono solo per la Serie A.
-- Le righe senza nessuno degli otto voti ma con le presenze sono i giocatori
-- che quella stagione hanno giocato ALTROVE (serie B, estero): il file le porta
-- perche' servono a giudicare chi arriva. Presenze fino a 45: non e' un campionato
-- da 38 giornate. Vanno tenute, ma non vanno confuse con la Serie A.
alter table caprera.statistiche_serie_a
  add column if not exists altro_campionato boolean not null default false;

comment on column caprera.statistiche_serie_a.altro_campionato is
  'true = la riga non e'' Serie A: sono le presenze del giocatore in un altro campionato quella stagione. Riconosciute dall''assenza di tutti e otto i voti a fronte di presenze registrate.';

update caprera.statistiche_serie_a
   set altro_campionato = true
 where presenze is not null
   and fm is null and mv is null
   and fm_gazzetta is null and mv_gazzetta is null
   and fm_corriere is null and mv_corriere is null
   and fm_statistico is null and mv_statistico is null;
