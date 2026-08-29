-- La Presidenza ha confermato: i Milinkovic Savic sono due persone diverse.
-- Uno e' il portiere che gioca ancora oggi, l'altro il centrocampista.
--
--   760  Milinkovic S.  C  · Lazio  · foglio ininterrotto dal 2016-17 al 2022-23
--   1523 Milinkovic     P  · Torino, poi Napoli · dal 2020-21 a oggi
--
-- Tre righe di rosa restavano senza scheda perche' scritte per esteso —
-- «Milinkovic Savic» e «Milinkovic Savic V.» — mentre l'anagrafe li tiene corti.
-- Che siano loro lo dicono le presenze, una per una:
--   2016-17 disperata     C LAZ 34 presenze  ->  foglio 760 2016-17: 34
--   2017-18 casata-draghi C LAZ 35 presenze  ->  foglio 760 2017-18: 35
-- e per il portiere lo dice il club: TOR, quando il centrocampista era alla Lazio.
update caprera.rose set calciatore = 760
 where nome = 'Milinkovic Savic' and ruolo = 'C' and calciatore is null;

update caprera.rose set calciatore = 1523
 where nome = 'Milinkovic Savic V.' and ruolo = 'P' and calciatore is null;
