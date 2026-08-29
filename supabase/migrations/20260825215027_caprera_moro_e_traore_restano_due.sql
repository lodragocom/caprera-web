-- Riparo un errore mio, fatto nella migrazione precedente.
--
-- La regola diceva: aggancia dove il cognome col suo ruolo e' uno solo
-- nell'anagrafe. Controllavo l'unicita' da una parte sola. Ma nel foglio del
-- 2022-23 ci sono **due** righe «Moro» centrocampista, e in quello del 2023-24
-- **due** righe «Traore» centrocampista: due persone diverse ciascuna. Tutte e
-- quattro si sono agganciate allo stesso calciatore, creando due doppioni dove
-- prima non ce n'erano.
--
-- Il guard che avevo messo — «non esiste gia' una riga di quella stagione con
-- quel calciatore» — non poteva funzionare: dentro una sola UPDATE la condizione
-- si valuta sulla fotografia di prima, quindi le due righe non si vedevano fra
-- loro.
--
-- Le riporto tutte e quattro a vuoto. Non scelgo quale delle due sia quella
-- «giusta»: sono due persone e l'archivio, da solo, non sa dire chi e' chi.
-- Meglio due nomi senza scheda che due nomi con la scheda sbagliata.
update caprera.statistiche_serie_a
   set calciatore = null
 where (stagione, nome, ruolo) in (('2022-23','Moro','C'), ('2023-24','Traore','C'))
   and calciatore is not null;
