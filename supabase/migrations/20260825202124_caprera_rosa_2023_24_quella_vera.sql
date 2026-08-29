-- ============================================================================
--  Il 2023-24 riprende il suo posto
-- ============================================================================
-- Quello che c'era sotto l'etichetta 2023-24 non era il 2023-24: erano 310 righe
-- copiate dal listone di partenza del 2024-25. Si vedeva da tre cose insieme:
-- nessuna delle 310 aveva le presenze, 250 erano identiche al 2024-25 di
-- partenza, e dentro c'erano giocatori che quell'anno in Serie A non c'erano
-- (Camarda, Mctominay, De Gea, Dovbyk, Taremi, Paz).
--
-- Non le cancello: le metto da parte in lavoro.rose_2023_24_scartate, cosi' se
-- domani si scopre che servivano a qualcosa sono ancora leggibili.
create table if not exists lavoro.rose_2023_24_scartate as
  select * from caprera.rose where stagione = '2023-24';

delete from caprera.rose where stagione = '2023-24';

-- ---------------------------------------------------------------------------
-- MAGGIO — la rosa finale, dal file Fantapazz consegnato dalla Presidenza.
-- 310 righe, dieci squadre da 31, tutte 6-9-9-7. Concorda col campo: 299 su 310
-- combaciano societa'+nome+ruolo e nessuna riga sta in una societa' diversa da
-- quella che l'ha schierato.
-- ---------------------------------------------------------------------------
insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, club, costo, momento)
select '2023-24', r.societa, r.calciatore, c.nome, r.ruolo, r.club, r.costo, 'fine'
from lavoro.rosa_2023_24 r join caprera.calciatori c on c.id = r.calciatore;

-- ---------------------------------------------------------------------------
-- SETTEMBRE — la rosa d'asta.
-- La scheda della Presidenza a settembre ha 27 nomi per squadra invece di 31,
-- perche' nel blocco portieri erano stati scritti i club invece dei nomi. I
-- quattro portieri mancanti si recuperano senza indovinare: **a gennaio non si
-- mosse nessun portiere**, ne' fra i trentadue usciti ne' fra i trentadue
-- entrati, quindi i sei di maggio sono i sei di settembre.
-- Percio' settembre = maggio, meno i trentadue arrivati, piu' i trentadue usciti.
-- ---------------------------------------------------------------------------
insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, club, costo, momento)
select '2023-24', r.societa, r.calciatore, c.nome, r.ruolo, r.club, r.costo, 'partenza'
from lavoro.rosa_2023_24 r join caprera.calciatori c on c.id = r.calciatore
where (r.societa, r.nome) not in (
  ('prosecco','Bisseck'),('prosecco','Isaksen'),('prosecco','Lykogiannis'),
  ('smit','Angelino'),('smit','Bove'),('smit','Niang'),('smit','Swiderski'),('smit','Zappa'),
  ('real-monghi','Kumbulla'),('real-monghi','Martinez Quarta'),('real-monghi','Ostigard'),
  ('real-monghi','Oudin'),('real-monghi','Zurkowski'),
  ('sporting-mangiapreti','Brescianini'),('sporting-mangiapreti','Calafiori'),
  ('sporting-mangiapreti','Ebosele'),('sporting-mangiapreti','Viola'),
  ('sanguemisto','Brenner'),('sanguemisto','Cerri'),('sanguemisto','Florenzi'),
  ('sanguemisto','Mckennie'),('sanguemisto','Miranchuk'),('sanguemisto','Pereyra'),
  ('subbuteo','Suslov'),('subbuteo','Valeri'),('subbuteo','Vitinha'),
  ('roburro','Aebischer'),('roburro','Pongracic'),
  ('disperata','Alcaraz'),('disperata','Henry'),('disperata','Vasquez'),('disperata','Zortea'));

insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, costo, momento)
select '2023-24', u.societa, u.calciatore, c.nome, u.ruolo, u.costo, 'partenza'
from lavoro.usciti_gennaio_2023_24 u join caprera.calciatori c on c.id = u.calciatore;

-- ---------------------------------------------------------------------------
-- Le presenze di maggio, dal foglio della Serie A.
-- Solo le presenze: mv e fm restano vuote apposta. In archivio l'fm delle rose
-- e' quello calcolato con le regole di Caprera (i portieri hanno l'imbattuto),
-- non quello di Fantapazz, e scrivere il numero sbagliato sarebbe peggio che
-- lasciare la casella vuota. Lo calcolera' il motore dalle formazioni.
-- ---------------------------------------------------------------------------
update caprera.rose r set presenze = s.presenze
from caprera.statistiche_serie_a s
where r.stagione = '2023-24' and r.momento = 'fine'
  and s.stagione = '2023-24' and s.calciatore = r.calciatore
  and not s.altro_campionato;
