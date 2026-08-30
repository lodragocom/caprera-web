-- Quattro righe di rosa si chiamano «Bastoni» senza iniziale, e per questo non
-- erano agganciate a nessuno: nell'anagrafe ci sono «Bastoni A.» e «Bastoni S.»,
-- e nessuno dei due si chiama cosi'.
--
-- Che siano Alessandro lo dice la colonna club, che sull'anagrafe non c'e' ma
-- in rosa si', e lo confermano le presenze una per una contro il suo foglio:
--   2018-19  prosecco     PAR  20 presenze  ->  foglio 1389 2018-19: 20   (l'anno in prestito al Parma)
--   2019-20  smit         INT  25 presenze  ->  foglio 1389 2019-20: 25
--   2020-21  prosecco     INT  33 presenze  ->  foglio 1389 2020-21: 33
--   2021-22  prosecco     INT  31 presenze  ->  foglio 1389 2021-22: 31
--
-- Dal 2022-23 in poi il nome in rosa diventa «Bastoni A.» e l'aggancio c'era
-- gia'. Queste quattro sono gli anni prima che qualcuno aggiungesse l'iniziale.
--
-- Simone («Bastoni S.», Spezia, id 2255) non viene toccato: le sue righe hanno
-- club SPE e presenze diverse, e restano sue.
update caprera.rose
   set calciatore = 1389
 where nome = 'Bastoni'
   and calciatore is null
   and stagione in ('2018-19','2019-20','2020-21','2021-22');
