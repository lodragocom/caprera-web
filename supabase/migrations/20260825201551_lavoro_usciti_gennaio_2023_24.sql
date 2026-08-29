-- I trentadue svincolati di gennaio 2023-24, presi dalla scheda d'asta della
-- Presidenza: stanno in «Rose_Asta_Finale» e non stanno piu' in «Rose Mercato Feb».
-- Il costo e' quello pagato all'asta di settembre.
--
-- Attenzione a un tranello che ha quasi fatto danno: nella scheda scritta a mano
-- «Sanches» compare due volte. Il Sanguemisto aveva Renato Sanches (centrocampista,
-- 8 crediti) e l'ha svincolato; il Subbuteo aveva Alexis Sanchez (attaccante, 1
-- credito) e l'ha tenuto. Due persone diverse, due grafie quasi identiche nello
-- stesso foglio. Si distinguono solo guardando squadra per squadra chi c'e' ancora
-- a febbraio, non cercando il cognome nell'intero foglio.
--
-- Nessuno dei trentadue e' un portiere. Nemmeno dei trentadue arrivati. Per questo
-- i sei portieri di ogni squadra a settembre sono gli stessi di maggio.
drop table if exists lavoro.usciti_gennaio_2023_24;
create table lavoro.usciti_gennaio_2023_24 (
  societa text not null, ruolo char not null, nome text not null,
  costo int not null, calciatore int
);
insert into lavoro.usciti_gennaio_2023_24 (societa, ruolo, nome, costo) values
('prosecco','D','Casale',1),
('prosecco','D','Ndicka',1),
('prosecco','C','Klaassen',1),
('smit','D','Zalewski',2),
('smit','D','Pedersen',1),
('smit','C','Pafundi',1),
('smit','A','Bonazzoli',1),
('smit','A','Kean',1),
('real-monghi','D','Schuurs',19),
('real-monghi','D','Izzo',1),
('real-monghi','D','Marchizza',1),
('real-monghi','C','Kamada',9),
('real-monghi','C','Rafia',1),
('sporting-mangiapreti','D','Bijol',9),
('sporting-mangiapreti','D','Carboni F.',1),
('sporting-mangiapreti','C','Radonjic',1),
('sporting-mangiapreti','C','Krunic',1),
('sanguemisto','D','Soppy',1),
('sanguemisto','C','Elmas',1),
('sanguemisto','C','Nandez',3),
('sanguemisto','C','Sanches',8),
('sanguemisto','A','Muriel',1),
('sanguemisto','A','Success',1),
('subbuteo','D','Hien',1),
('subbuteo','C','Strefezza',23),
('subbuteo','A','Van Hooijdonk',1),
('roburro','D','Kalulu',1),
('roburro','C','Marin',1),
('disperata','D','Hysaj',1),
('disperata','D','Dragusin',11),
('disperata','C','Mandragora',3),
('disperata','A','Gyasi',1);

-- L'aggancio si fa dal campo: la societa' che l'ha schierato nella prima meta'
-- di stagione e' la stessa che l'aveva in rosa a settembre.
with campo as (
  select f.societa, c.nome, c.id
  from caprera.formazione_giocatori g
  join caprera.formazioni f on f.id = g.formazione
  join caprera.partite p on p.id = f.partita
  join caprera.calciatori c on c.id = g.calciatore
  where p.stagione = '2023-24' and g.calciatore is not null
  group by 1,2,3)
update lavoro.usciti_gennaio_2023_24 u set calciatore = k.id
  from campo k where k.societa = u.societa and k.nome = u.nome;
