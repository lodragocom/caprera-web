-- Fonte: dashboard Shiny Caprera aggiornata al 18/10/2026.
-- Trascrizione dei risultati visibili delle giornate 1-4 e della classifica.
-- I fantapunti della classifica sono quelli della fonte, non ricalcolati.
insert into caprera.partite(stagione,competizione,giornata,casa,fuori,gol_casa,gol_fuori,fp_casa,fp_fuori,giocata) values
('2026-27','campionato',1,'smit','prosecco',0,0,60,60,true),
('2026-27','campionato',1,'sporting-mangiapreti','armata-rossa',0,0,60,60,true),
('2026-27','campionato',1,'subbuteo','real-monghi',0,0,60,60,true),
('2026-27','campionato',1,'disperata','sanguemisto',0,0,60,60,true),
('2026-27','campionato',1,'aston-ville','roburro',0,0,60,60,true),
('2026-27','campionato',2,'armata-rossa','smit',2,2,76,75.5,true),
('2026-27','campionato',2,'sanguemisto','aston-ville',1,2,71.5,75.5,true),
('2026-27','campionato',2,'real-monghi','disperata',0,2,65.5,73.5,true),
('2026-27','campionato',2,'prosecco','subbuteo',5,0,88.5,66.5,true),
('2026-27','campionato',2,'roburro','sporting-mangiapreti',1,1,72.5,72.5,true),
('2026-27','campionato',3,'smit','roburro',0,2,67.5,75.5,true),
('2026-27','campionato',3,'sporting-mangiapreti','sanguemisto',0,5,65,87.5,true),
('2026-27','campionato',3,'subbuteo','armata-rossa',2,0,77,55,true),
('2026-27','campionato',3,'prosecco','real-monghi',1,4,72.5,83,true),
('2026-27','campionato',3,'aston-ville','disperata',2,0,75.5,67,true),
('2026-27','campionato',4,'armata-rossa','prosecco',1,2,69.5,75.5,true),
('2026-27','campionato',4,'disperata','sporting-mangiapreti',2,2,73,75,true),
('2026-27','campionato',4,'sanguemisto','smit',2,0,75.5,65.5,true),
('2026-27','campionato',4,'real-monghi','aston-ville',1,2,71,75,true),
('2026-27','campionato',4,'roburro','subbuteo',4,2,83,74.5,true);

insert into caprera.classifiche(stagione,societa,posizione,giocate,vinte,pari,perse,gol_fatti,gol_subiti,punti,fantapunti) values
('2026-27','aston-ville',1,4,3,1,0,6,2,10,284),
('2026-27','roburro',2,4,2,2,0,7,3,8,289),
('2026-27','prosecco',3,4,2,1,1,8,5,7,294.5),
('2026-27','sanguemisto',4,4,2,1,1,8,2,7,292.5),
('2026-27','disperata',5,4,1,2,1,4,4,5,271.5),
('2026-27','real-monghi',6,4,1,1,2,5,5,4,277.5),
('2026-27','subbuteo',7,4,1,1,2,4,9,4,276),
('2026-27','sporting-mangiapreti',8,4,0,3,1,3,8,3,270.5),
('2026-27','smit',9,4,0,2,2,2,6,2,266.5),
('2026-27','armata-rossa',10,4,0,2,2,3,6,2,258.5);
