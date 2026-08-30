-- I trentasei che l'asta di settembre 2022 aveva assegnato e a febbraio non
-- c'erano piu'. Presi dal file della Presidenza: stanno in «Rose_Asta_Finale» e
-- non in «Rose Mercato Feb». Il costo e' quello pagato all'asta.
--
-- Il file si ferma a 27 giocatori per squadra perche' nel blocco portieri sono
-- scritti i club invece dei nomi: i portieri, li', sono invisibili. Per questo lo
-- scambio Gollini-Sirigu fra Sporting e Roburro non compare qui — lo aggiunge il
-- campo, che li ha visti cambiare maglia alla diciottesima.
drop table if exists lavoro.usciti_2022_23;
create table lavoro.usciti_2022_23 (societa text, ruolo char, nome text, costo int, calciatore int);
insert into lavoro.usciti_2022_23 (societa, ruolo, nome, costo) values
('prosecco','D','Alex Sandro',1),('prosecco','C','Zanimacchia',1),('prosecco','A','Lukaku',118),('prosecco','A','Correa',61),
('smit','D','Ferrari',1),('smit','D','Rogerio',1),('smit','C','Zaniolo',17),('smit','A','Botheim',1),
('real-monghi','D','De Silvestri',1),('real-monghi','D','Marlon',1),('real-monghi','A','Ekong',1),
('sporting-mangiapreti','D','Okoli',4),('sporting-mangiapreti','D','De Winter',1),('sporting-mangiapreti','D','Kasius',1),
('sporting-mangiapreti','D','Gyomber',1),('sporting-mangiapreti','D','Ndiaye',1),('sporting-mangiapreti','C','Malinovskyi',17),
('sporting-mangiapreti','C','Traore',1),('sporting-mangiapreti','A','Lasagna',1),
('sanguemisto','D','Dest',1),('sanguemisto','D','Reca',1),('sanguemisto','D','Cambiaso',1),('sanguemisto','C','Cristante',1),
('sanguemisto','C','De Roon',1),('sanguemisto','C','Elmas',1),('sanguemisto','C','Lovric',1),('sanguemisto','C','Seck',1),
('sanguemisto','A','Pussetto',1),('sanguemisto','A','Ceesay',20),
('armata-rossa','A','Vlahovic',39),
('subbuteo','C','Lukic',1),
('aston-ville','D','Colley',1),
('roburro','D','Carboni',1),
('disperata','C','Mckennie',1),('disperata','A','Henry',27),('disperata','A','Pjaca',1);

-- Aggancio dal campo: chi quella societa' ha schierato nel 2022-23 con quel cognome.
with campo as (
  select f.societa, c.nome, c.id
  from caprera.formazione_giocatori g
  join caprera.formazioni f on f.id = g.formazione
  join caprera.partite p on p.id = f.partita
  join caprera.calciatori c on c.id = g.calciatore
  where p.stagione = '2022-23' and g.calciatore is not null
  group by 1,2,3)
update lavoro.usciti_2022_23 u set calciatore = k.id
  from campo k where k.societa = u.societa and k.nome = u.nome;
