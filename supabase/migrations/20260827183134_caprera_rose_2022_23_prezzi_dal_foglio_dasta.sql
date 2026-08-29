-- Quattro prezzi presi dal foglio dell'asta invece che dall'export Fantapazz.
--
-- Confrontando le dieci rose di settembre del 2022-23 con Rose_Asta_Finale,
-- otto combaciano al credito. Due no, e la differenza sta tutta in quattro
-- giocatori che l'archivio aveva a **1**:
--
--   Sanguemisto   Muriel 1 -> 52,  Zalewski 1 -> 16,  Kean 1 -> 14   (+79)
--   Real Monghi   Winks  1 ->  3                                      (+2)
--
-- Il «1» non e' un prezzo: e' il segno che il giocatore e' arrivato **per
-- scambio** e non per chiamata all'asta. Lo avevo gia' notato caricando gli
-- scambi dopo l'asta - «tutti e due hanno costo 1 in rosa di partenza» - ma
-- avevo letto quel segnaposto come se fosse la cifra pagata.
--
-- Che il foglio abbia ragione lo dicono i suoi stessi conti, due volte:
--   Sanguemisto  263 iniziali - 205 di rosa = 58 = «Crediti Residui» del foglio
--   Real Monghi  258 iniziali - 241 di rosa = 17 = «Crediti Residui» del foglio
-- Con i numeri vecchi (126 e 239) uscivano 137 e 19, che non corrispondono a
-- niente in nessun documento.
update caprera.rose r set costo = v.costo
  from (values ('sanguemisto','Muriel',   52),
               ('sanguemisto','Zalewski', 16),
               ('sanguemisto','Kean',     14),
               ('real-monghi','Winks',     3)
       ) as v(societa, nome, costo)
 where r.stagione='2022-23' and r.momento='partenza'
   and r.societa=v.societa and r.nome=v.nome;

-- `spesi` e' la somma della rosa di settembre: si rifa dopo la correzione.
update caprera.finanze f
   set spesi = (select sum(x.costo) from caprera.rose x
                 where x.stagione=f.stagione and x.societa=f.societa and x.momento='partenza')
 where f.stagione='2022-23';
