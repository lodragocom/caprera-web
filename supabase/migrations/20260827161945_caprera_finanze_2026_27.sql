-- Il 2026-27 prima dell'asta.
--
-- La stagione entra con conclusa=false: e' la prima volta che l'archivio ne
-- contiene una non giocata, e le pagine Rose e Asta ora si aprono sull'ultima
-- conclusa invece che sull'ultima in elenco - se no il menu la offriva per
-- prima e chi arrivava trovava dieci rose vuote.
insert into caprera.stagioni (id, lega, ordine, giornate, conclusa)
select '2026-27', lega, 11, 36, false from caprera.stagioni where id='2025-26'
on conflict (id) do nothing;

-- I budget vengono dal foglio Pagamenti/Vincite/Crediti, blocco «Vincite
-- 2025-26»: 250 + carry-over + vincite - assicurazione obbligatoria.
-- Il carry-over e' ceil(non_spesi/2) sui «crediti non spesi» di Guido, e
-- torna dieci su dieci. `spesi`, `scambi` e `residui` restano vuoti: l'asta
-- non si e' ancora fatta, e un 0 li' dentro si leggerebbe come «non ha speso
-- niente» invece che «non lo sappiamo ancora».
insert into caprera.finanze (stagione, societa, iniziali, riportati, bonus, ffp, assicurazione)
values ('2026-27','armata-rossa',        258, 5,  5, 0, -2),
       ('2026-27','aston-ville',         257, 5,  4, 0, -2),
       ('2026-27','disperata',           255, 1,  6, 0, -2),
       ('2026-27','prosecco',            262, 1, 13, 0, -2),
       ('2026-27','real-monghi',         270, 3, 19, 0, -2),
       ('2026-27','roburro',             242, 0, -6, 0, -2),
       ('2026-27','sanguemisto',         255, 1,  6, 0, -2),
       ('2026-27','smit',                272, 1, 15, 0, -2),
       ('2026-27','sporting-mangiapreti',259, 4,  7, 0, -2),
       ('2026-27','subbuteo',            255, 1,  6, 0, -2)
on conflict (stagione, societa) do nothing;
