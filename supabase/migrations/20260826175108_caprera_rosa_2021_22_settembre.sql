-- «Malynowski» e' Malinovskyi (2078): nell'archivio lo Sporting ce l'ha in rosa
-- proprio nel 2021-22. L'aggancio automatico falliva per il ruolo — il foglio
-- d'asta lo mette fra gli attaccanti, l'anagrafe fra i centrocampisti — non per
-- il nome. E' la stessa cosa gia' vista con Tchaouna, Orsolini e Lauriente.
update lavoro.settembre_2021_22 set calciatore = 2078, come_in_archivio = 'Malinovskyi'
 where societa='sporting-mangiapreti' and nome='Malynowski';

-- ---------------------------------------------------------------------------
-- SETTEMBRE 2021 in archivio.
-- I ventiquattro di movimento vengono dal foglio della Presidenza; i sei portieri
-- si portano da maggio, perche' nel 2021-22 **nessun portiere cambio' maglia** —
-- ne' a novembre ne' a febbraio, ne' fra gli usciti ne' fra gli entrati.
-- La Presidenza ha deciso: si tengono due momenti, settembre e maggio. La
-- fotografia di novembre resta fuori dall'archivio; i movimenti di quella
-- finestra si leggono dal foglio e dal campo.
-- ---------------------------------------------------------------------------
insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, costo, momento)
select '2021-22', s.societa, s.calciatore, coalesce(s.come_in_archivio, s.nome), s.ruolo, s.costo, 'partenza'
from lavoro.settembre_2021_22 s;

insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, club, costo, momento)
select '2021-22', r.societa, r.calciatore, r.nome, r.ruolo, r.club, r.costo, 'partenza'
from caprera.rose r
where r.stagione='2021-22' and r.momento='fine' and r.ruolo='P';
