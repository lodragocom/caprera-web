-- Torno indietro. La Presidenza ha ritirato la risposta e mi ha detto di guardare le rose
-- finali, e aveva ragione lei a mandarmici: il Prosecco nel 2022-23 Kean non ce l'ha,
-- ma nel 2021-22 SI'. E vale per tutte e sei, senza eccezioni:
--
--   2021-22 foglio prosecco     Zapata      -> nel 2020-21 era del prosecco (78)
--   2021-22 foglio smit         Immobile    -> nel 2020-21 era dello smit (78)
--   2022-23 foglio prosecco     Kean        -> nel 2021-22 era del prosecco (1)
--   2022-23 foglio prosecco     Zalewski    -> nel 2021-22 era del prosecco (1)
--   2022-23 foglio roburro      Muriel      -> nel 2021-22 era del roburro (15)
--   2024-25 foglio armata-rossa Raspadori   -> nel 2023-24 era dell'armata-rossa (15)
--
-- Sei su sei. La societa' che il foglio scrive e' quella che il giocatore ce l'aveva
-- l'anno prima: non e' chi compra, e' chi lo perde. Il foglio non ha mai sbagliato,
-- ho sbagliato io a cercare il giocatore nella stagione sbagliata - e poi una seconda
-- volta a spostare i crediti su una societa' che non c'entrava.
update caprera.movimenti m set societa = v.foglio
  from (values
    ('2021-22','prosecco','Zapata','sanguemisto'),
    ('2021-22','smit','Immobile','sanguemisto'),
    ('2022-23','prosecco','Kean','sanguemisto'),
    ('2022-23','prosecco','Zalewski','sanguemisto'),
    ('2022-23','roburro','Muriel','sanguemisto'),
    ('2024-25','armata-rossa','Raspadori','roburro')
  ) as v(stagione, foglio, voce, sbagliata)
 where m.categoria='mercato' and m.fonte='foglio rose'
   and m.stagione=v.stagione and m.societa=v.sbagliata and m.voce=v.voce;
