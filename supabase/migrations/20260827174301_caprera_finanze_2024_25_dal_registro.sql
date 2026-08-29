-- Il 2024-25 era l'unico anello che non teneva: ceil(residui/2) del 2023-24
-- non dava il `riportati` del 2024-25, una societa' su dieci.
--
-- Il motivo: le righe del 2024-25 avevano **tutto dentro `riportati`** e
-- `bonus` a zero per tutte e dieci. Il registro invece li tiene separati -
-- «carry-over (50%)» e «Vincite» sono due colonne. Il totale tornava lo
-- stesso, ed e' per questo che nessuno se n'era accorto: un totale giusto
-- fatto di due addendi sbagliati.
--
-- Si riprende la coppia dal registro. L'`ffp` a 2 che c'era non sta nella
-- scheda «Vincite 2023-24» - quel blocco ha solo carry e vincite, e con
-- quelli il conto chiude esatto su tutte e dieci - quindi va a zero.
--
-- E l'Armata Rossa aveva anche gli `iniziali` sbagliati: 253 contro i 255
-- del registro. E' l'unica delle dieci, e si vedeva solo guardando la catena.
update caprera.finanze f
   set riportati = v.carry, bonus = v.vincite, ffp = 0, iniziali = v.iniziali
  from (values ('armata-rossa',         255,  2,  3),
               ('aston-ville',          262,  1, 11),
               ('disperata',            283, 27,  6),
               ('prosecco',             256,  4,  2),
               ('real-monghi',          264,  5,  9),
               ('roburro',              250,  0,  0),
               ('sanguemisto',          261,  6,  5),
               ('smit',                 259,  0,  9),
               ('sporting-mangiapreti', 266, 12,  4),
               ('subbuteo',             266,  7,  9)
       ) as v(societa, iniziali, carry, vincite)
 where f.stagione='2024-25' and f.societa=v.societa;
