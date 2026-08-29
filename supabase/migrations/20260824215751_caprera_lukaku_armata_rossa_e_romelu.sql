-- In archivio ci sono due Lukaku, e vanno tenuti separati:
--   1282  Lukaku  D  -> Jordan, terzino della Lazio, foglio 2016-17 (15) e 2017-18 (29)
--   2099  Lukaku  A  -> Romelu, foglio dal 2019-20 in poi
-- La Presidenza ha confermato: il Lukaku dell'Armata Rossa e' Romelu.
--
-- Due righe di rosa puntavano a Jordan mentre descrivevano Romelu. Si vede
-- dalla riga stessa, senza bisogno di crederci sulla parola: il ruolo scritto
-- in rosa e' A, non D, e le presenze combaciano col foglio di Romelu
--   2022-23  armata-rossa  A  23 presenze  ->  foglio 2099 2022-23: 23
--   2023-24  armata-rossa  A  32 presenze  ->  foglio 2099 2023-24: 32
-- La riga del 2017-18 (sanguemisto, ruolo D, 29 presenze) resta a Jordan:
-- quella e' davvero sua.
update caprera.rose
   set calciatore = 2099
 where calciatore = 1282
   and stagione in ('2022-23','2023-24')
   and ruolo = 'A';
