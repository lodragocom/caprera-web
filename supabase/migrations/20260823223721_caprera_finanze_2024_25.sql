-- =====================================================================
--  Le finanze del 2024-25, dal foglio d'asta di Guido
--
--  `finanze` aveva una stagione sola, il 2025-26. Adesso ne ha due.
--
--  Due conti, dieci societa' ciascuno, e tornano tutti e venti:
--
--    250 + riportati + FFP     = crediti iniziali
--    iniziali - spesi + scambi = crediti residui
--
--  Una differenza col 2025-26: nel foglio del 2024-25 **non c'e' la riga
--  «Vincite/Penalty»**. I crediti che una societa' si porta dietro stanno
--  tutti in una riga sola, «Crediti da 2023», e il premio FFP e' a parte.
--  Percio' `bonus` resta a zero: non e' che i premi non ci fossero, e' che
--  quel foglio non li separa. Scriverli lo stesso vorrebbe dire spaccare in
--  due un numero che nessuno ha spaccato.
--
--  `scambi` e' negativo per due societa', ed e' la prima volta: nel 2025-26
--  erano crediti **incassati** (Pinamonti +15, Lautaro +66), qui sono
--  crediti **spesi**. Prosecco -35 e Armata Rossa -52 sono le righe di
--  scambio del foglio — Lukaku, Vlahovic, Raspadori — e senza di loro il
--  bilancio di quelle due non chiuderebbe.
-- =====================================================================
delete from caprera.finanze where stagione = '2024-25';
insert into caprera.finanze (stagione, societa, iniziali, spesi, scambi, residui, riportati, bonus, ffp) values
('2024-25','armata-rossa',253,193,-52,8,1,0,2),
('2024-25','aston-ville',262,259,0,3,10,0,2),
('2024-25','disperata',283,268,0,15,31,0,2),
('2024-25','prosecco',256,217,-35,4,4,0,2),
('2024-25','real-monghi',264,252,0,12,12,0,2),
('2024-25','roburro',250,247,0,3,-2,0,2),
('2024-25','sanguemisto',261,242,0,19,11,0,0),
('2024-25','smit',259,253,0,6,9,0,0),
('2024-25','sporting-mangiapreti',266,253,0,13,14,0,2),
('2024-25','subbuteo',266,262,0,4,16,0,0);
