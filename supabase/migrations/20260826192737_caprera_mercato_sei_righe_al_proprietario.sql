-- La Presidenza conferma: quei crediti li ha spesi il Sanguemisto, non chi risultava
-- dalla colonna del mio foglio. La verifica la danno le formazioni e la rosa finale,
-- ed e' netta: per tutte e sei le righe il giocatore e' della stessa societa' a settembre
-- e a maggio, e in campo ci va solo con quella maglia. Non si e' mosso niente, quindi
-- non poteva essere ne' uno scambio ne' un acquisto dagli svincolati: era una colonna
-- scivolata nella mia lettura, ed e' la seconda volta che quel foglio mi frega.
--
-- Sposto le undici righe sulla societa' che il campo indica. Le altre restano dove sono:
-- Lukaku e Vlahovic hanno il contratto, Lautaro e Pinamonti sono clausole e li' il credito
-- spetta davvero a chi il giocatore lo perde.
update caprera.movimenti m set societa = v.vera
  from (values
    ('2021-22','prosecco','Zapata','sanguemisto'),
    ('2021-22','smit','Immobile','sanguemisto'),
    ('2022-23','prosecco','Kean','sanguemisto'),
    ('2022-23','prosecco','Zalewski','sanguemisto'),
    ('2022-23','roburro','Muriel','sanguemisto'),
    ('2024-25','armata-rossa','Raspadori','roburro')
  ) as v(stagione, foglio, voce, vera)
 where m.categoria='mercato' and m.fonte='foglio rose'
   and m.stagione=v.stagione and m.societa=v.foglio and m.voce=v.voce;
