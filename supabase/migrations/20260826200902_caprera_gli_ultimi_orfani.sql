-- Le risposte della Presidenza, verificate una per una contro le presenze.
--
-- Conti A. = Andrea Conti del Milan -> scheda 730. Quella scheda porta gia' altre
--   quattro righe di rosa con la stessa grafia, dal 2016-17 al 2020-21.
--
-- Donnarumma A. = Antonio, il portiere -> scheda 754 'Donnarumma Ant.'. Nel foglio di
--   Serie A non ha righe per il 2017-18 e il 2018-19, e in rosa ha presenze vuote:
--   combacia, era il terzo portiere della Casata Draghi che non giocava mai.
--
-- Traore H. = quello del Sassuolo, scheda 1831. Le presenze lo firmano tre volte:
--   2018-19 trenta, 2019-20 ventotto, 2021-22 ventisette, e la scheda dice trenta,
--   ventotto e ventisette. Non e' un'ipotesi, e' un'impronta.
--
-- Troost Ekong -> scheda 1873. Nel 2018-19 la rosa dice trentacinque presenze e la
--   scheda pure. Da non confondere con Ekong (2546), che e' un attaccante.
--
-- Di Gennaro R. e' l'unico dove non seguo la Presidenza, e lo dico chiaro. Raffaele
--   Di Gennaro, il portiere, esiste ed e' la scheda 1211 - ma in Serie A compare solo
--   dal 2023-24. La riga orfana e' del 2016-17, ruolo C, venti presenze, e la scheda
--   769 'Di Gennaro' centrocampista ha esattamente venti presenze nel 2016-17.
--   Quella 'R.' scritta sul foglio porta fuori strada: le presenze no.
update caprera.rose r set calciatore = v.id
  from (values
    ('2017-18','smit','Conti A.',730),
    ('2017-18','casata-draghi','Donnarumma A.',754),
    ('2018-19','casata-draghi','Donnarumma A.',754),
    ('2016-17','subbuteo','Di Gennaro R.',769),
    ('2018-19','prosecco','Troost Ekong',1873),
    ('2018-19','sanguemisto','Traore H.',1831),
    ('2019-20','sporting-mangiapreti','Traore H.',1831),
    ('2021-22','sporting-mangiapreti','Traore H.',1831)
  ) as v(stagione, societa, nome, id)
 where r.calciatore is null
   and r.stagione=v.stagione and r.societa=v.societa and r.nome=v.nome
   and not exists (select 1 from caprera.rose x
                    where x.stagione=r.stagione and x.societa=r.societa
                      and x.momento=r.momento and x.calciatore=v.id);
