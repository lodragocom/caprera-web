-- =====================================================================
--  Undici omonimi agganciati al calciatore sbagliato (2025-26)
--
--  `rose.calciatore` era stato ricavato dal **nome**. Dove in dieci anni di
--  Serie A due giocatori portano lo stesso cognome, il nome non basta e la
--  riga si e' agganciata al piu' vecchio dei due:
--
--    Fofana, Colombo, Di Gennaro, Furlanetto, Gabriel, Pavlovic,
--    Lukaku, Pedro, Castro, Joao Mario
--
--  Non e' un dettaglio anagrafico. `v_carriera` unisce le formazioni alla
--  riga di rosa **per id**: con l'id sbagliato il collegamento salta, e in
--  «la mia rosa» quel giocatore risulta «mai schierato» con tutte le caselle
--  vuote — pur avendo giocato quarantasei partite, come Pavlovic. E il link
--  sul nome portava alla scheda di un altro.
--
--  Chi ha ragione: le **formazioni**. La' l'id viene dal dato di partita, non
--  da una ricerca per nome. Verificato che tutti e dieci gli id vecchi
--  appartengono a giocatori che nel 2025-26 non sono mai scesi in campo.
--
--  Qui si sistema **solo il 2025-26**, la stagione che stiamo chiudendo.
--  Ne restano 19 nelle altre nove: 2024-25 (8), 2020-21 (3), 2021-22 (3),
--  2022-23 (3), 2019-20 (1), 2023-24 (1). Si fanno stagione per stagione,
--  come le rose.
-- =====================================================================
update caprera.rose r
   set calciatore = v.calciatore
  from caprera.v_carriera v
 where v.societa = r.societa
   and v.stagione = r.stagione
   and v.nome = r.nome
   and r.stagione = '2025-26'
   and v.calciatore is distinct from r.calciatore;
