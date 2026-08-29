-- Colley: un solo candidato nell'anagrafe con quel cognome e quel ruolo.
update lavoro.usciti_2022_23 set calciatore = 1745 where nome='Colley' and calciatore is null;
-- Ferrari e Carboni restano senza scheda: nell'anagrafe ce ne sono due per ciascuno
-- (Ferrari A. / Ferrari G., Carboni A. / Carboni F.), tutti con una riga sul foglio
-- 2022-23, e nessuno dei due fu mai schierato da quella societa'. Sceglierne uno
-- sarebbe indovinare.

-- ---------------------------------------------------------------------------
-- SETTEMBRE 2022 = maggio, meno i trentasei arrivati a febbraio, piu' i trentasei
-- usciti. Il file della Presidenza dice chi sono da entrambe le parti, e i conti
-- tornano squadra per squadra **anche per ruolo**: dove sono usciti tre difensori
-- ne sono entrati tre, e cosi' per tutte e dieci.
-- ---------------------------------------------------------------------------
insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, club, costo, momento)
select '2022-23', r.societa, r.calciatore, r.nome, r.ruolo, r.club, r.costo, 'partenza'
from caprera.rose r
where r.stagione='2022-23' and r.momento='fine'
  and (r.societa, r.nome) not in (
   ('armata-rossa','Lukaku'),('aston-ville','Nuytinck'),
   ('disperata','De Roon'),('disperata','Ciurria'),('disperata','Thauvin'),
   ('prosecco','Bellanova'),('prosecco','Solbakken'),('prosecco','Vlahovic'),('prosecco','Ceesay'),
   ('real-monghi','Perez N.'),('real-monghi','Posch'),('real-monghi','Braaf'),
   ('roburro','Lemmens'),
   ('sanguemisto','Alex Sandro'),('sanguemisto','Luperto'),('sanguemisto','Depaoli'),
   ('sanguemisto','Miranchuk'),('sanguemisto','Ikone'),('sanguemisto','Zaniolo'),
   ('sanguemisto','Orsolini'),('sanguemisto','Rabiot'),('sanguemisto','Lammers'),('sanguemisto','Djuric'),
   ('smit','Mari'),('smit','Holm'),('smit','Elmas'),('smit','Correa'),
   ('sporting-mangiapreti','Sernicola'),('sporting-mangiapreti','Casale'),('sporting-mangiapreti','Bijol'),
   ('sporting-mangiapreti','Mario Rui'),('sporting-mangiapreti','Zanotti'),('sporting-mangiapreti','Brekalo'),
   ('sporting-mangiapreti','Boga'),('sporting-mangiapreti','Shomurodov'),
   ('subbuteo','Ferguson'));

insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, costo, momento)
select '2022-23', u.societa, u.calciatore, coalesce(c.nome, u.nome), u.ruolo, u.costo, 'partenza'
from lavoro.usciti_2022_23 u left join caprera.calciatori c on c.id = u.calciatore;

-- I portieri: il file non li vede, il campo si'. Gollini e Sirigu si sono
-- incrociati fra Sporting e Roburro alla diciottesima giornata, quindi a
-- settembre stavano dove il file non poteva dirlo.
update caprera.rose set societa='sporting-mangiapreti'
 where stagione='2022-23' and momento='partenza' and nome='Gollini';
update caprera.rose set societa='roburro'
 where stagione='2022-23' and momento='partenza' and nome='Sirigu';
