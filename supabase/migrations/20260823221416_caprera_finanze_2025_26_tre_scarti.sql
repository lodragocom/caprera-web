-- =====================================================================
--  Tre societa' avevano i crediti spesi sbagliati nel 2025-26
--
--    Roburro      270 -> 273   (residui 6 -> 3)
--    Sanguemisto  241 -> 242   (residui 32 -> 31)
--    Subbuteo     266 -> 272   (residui 7 -> 1)
--
--  Le altre sette erano gia' giuste.
--
--  Come si sa da che parte sta l'errore: **tre riscontri indipendenti**, e
--  dicono tutti la stessa cosa.
--
--  1. La somma dei costi della rosa d'asta in archivio fa 273, 242, 272.
--  2. Le righe «Totale POR / DIF / CEN / ATT» del foglio d'asta di Guido —
--     numeri che Excel calcola da solo dalle celle — fanno gli stessi 273,
--     242, 272.
--  3. Il foglio dichiara anche i «Crediti Residui»: 3, 31, 1. Rifacendo il
--     conto con la spesa corretta — iniziali - spesi + scambi — vengono
--     esattamente 3, 31 e 1.
--
--  Tre strade diverse che arrivano allo stesso numero. `finanze.spesi`
--  arrivava da un foglio a parte ed e' l'unico a dire altro.
--
--  Il bilancio resta chiuso: iniziali - spesi + scambi = residui, prima e
--  dopo. Cambia di quanto, non se torna — ed e' il motivo per cui l'errore
--  non si vedeva: un conto sbagliato che quadra con se' stesso non fa
--  rumore.
-- =====================================================================
update caprera.finanze set spesi = 273, residui = 3
  where stagione = '2025-26' and societa = 'roburro';
update caprera.finanze set spesi = 242, residui = 31
  where stagione = '2025-26' and societa = 'sanguemisto';
update caprera.finanze set spesi = 272, residui = 1
  where stagione = '2025-26' and societa = 'subbuteo';
