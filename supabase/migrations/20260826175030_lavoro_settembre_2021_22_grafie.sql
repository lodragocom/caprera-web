-- Quindici nomi battuti a mano che l'aggancio automatico non riusciva a leggere.
-- Ognuno ha un solo destinatario possibile: quella societa', quel ruolo, e uno
-- schierato decine di volte con una grafia che si riconosce a occhio.
update lavoro.settembre_2021_22 s set calciatore = m.id, come_in_archivio = m.nome
from (values
 ('armata-rossa','Shomourodov',2354,'Shomurodov'),
 ('aston-ville','Kaio George',2539,'Kaio Jorge'),
 ('aston-ville','Maxime Lopez',2374,'Lopez'),
 ('disperata','Artur',2236,'Arthur'),
 ('disperata','Betancur',1518,'Bentancur'),
 ('prosecco','Carles Perez',2175,'Perez C.'),
 ('sanguemisto','Inerhatten',2583,'Ihattaren'),
 ('sanguemisto','Berejinski',1413,'Bereszynski'),
 ('smit','Delefeu',1437,'Deulofeu'),
 ('smit','Mhkytarian',2124,'Mkhitaryan'),
 ('smit','Saalemakers',2178,'Saelemaekers'),
 ('sporting-mangiapreti','Hiyckey',2324,'Hickey'),
 ('subbuteo','FABIANRUIZ',1779,'Ruiz'),
 ('subbuteo','Luis felipe',1628,'Luiz Felipe'),
 ('subbuteo','Mahele',2417,'Maehle')
) as m(societa, nome_file, id, nome)
where s.calciatore is null and s.societa = m.societa and s.nome = m.nome_file;
