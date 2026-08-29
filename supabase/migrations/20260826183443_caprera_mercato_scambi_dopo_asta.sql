-- Avevo tenuto fuori queste voci dicendo che era una colonna scivolata nella mia lettura.
-- Sbagliato. Il contratto depositato il 13.09.2024 fra Prosecco e Armata Rossa dice che
-- Lukaku e Vlahovic si sono scambiati DOPO l'asta, senza compensazioni. Quindi il foglio
-- ha ragione: chi paga all'asta e chi ha il giocatore a maggio possono essere due squadre
-- diverse. La firma la conferma la rosa di partenza, dove tutti e due hanno costo 1 -
-- il segno di chi e' arrivato per scambio e non per chiamata.
--
-- La societa' sul foglio e' quella che ha mosso i crediti. E' quella che vale per il registro.
update lavoro.registro_mercato m set calciatore = v.id
  from (values
    ('2021-22','prosecco','Zapata',483),
    ('2021-22','smit','Immobile',1084),
    ('2022-23','prosecco','Kean',1386),
    ('2022-23','prosecco','Zalewski',2382),
    ('2022-23','real-monghi','Vlasic',2827),
    ('2022-23','roburro','Muriel',341),
    ('2022-23','smit','Mkhitaryan',2124),
    ('2024-25','armata-rossa','Raspadori',1947),
    ('2024-25','armata-rossa','Vlahovic',1816),
    ('2024-25','prosecco','Lukaku',2099),
    ('2025-26','roburro','Pinamonti',1306)
  ) as v(stagione,societa,nome,id)
 where m.calciatore is null
   and m.stagione=v.stagione and m.societa=v.societa and m.nome=v.nome;

insert into caprera.movimenti (stagione, societa, categoria, voce, crediti, fonte, calciatore, finestra)
select m.stagione, m.societa, 'mercato', m.nome, m.crediti, 'foglio rose', m.calciatore, m.finestra
  from lavoro.registro_mercato m
 where m.calciatore is not null
   and m.crediti <> 0
   and not exists (
     select 1 from caprera.movimenti x
      where x.stagione=m.stagione and x.societa=m.societa
        and x.categoria='mercato' and x.voce=m.nome and x.crediti=m.crediti);
