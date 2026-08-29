-- =====================================================================
--  Gli omonimi del 2024-25, come quelli del 2025-26
--
--  Stessa causa: `rose.calciatore` ricavato dal nome, e dove due giocatori
--  portano lo stesso cognome la riga si e' agganciata al piu' vecchio.
--  Stessa conseguenza: `v_carriera` unisce le formazioni alla rosa per id,
--  quindi con l'id sbagliato il giocatore risulta «mai schierato» pur avendo
--  giocato, e il link sul suo nome porta alla scheda di un altro.
--
--  Chi ha ragione sono le formazioni: li' l'id viene dal dato di partita.
-- =====================================================================
update caprera.rose r
   set calciatore = v.calciatore
  from caprera.v_carriera v
 where v.societa = r.societa
   and v.stagione = r.stagione
   and v.nome = r.nome
   and r.stagione = '2024-25'
   and v.calciatore is distinct from r.calciatore;
