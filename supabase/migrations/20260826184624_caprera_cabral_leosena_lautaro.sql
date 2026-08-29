-- Le tre voci senza scheda, chiuse dalla Presidenza e dal foglio di Serie A.
--
-- «L. Martinez» e' Lautaro: Martinez L. #1747, Inter, 30 presenze e 17 gol nel 2025-26.
-- La scheda c'era gia', mancava solo la grafia.
--
-- «Cabral lazio» non e' l'Arthur Cabral della Fiorentina (#2700, 12 presenze) ma
-- Jovane Cabral, alla Lazio in prestito dal gennaio 2022: nel foglio di Serie A e'
-- «Cabral J.», 3 presenze, 1 gol, e non aveva scheda. Il Presidente aveva ragione a
-- scrivere «lazio» accanto al cognome: e' l'unica cosa che distingue i due.
--
-- «Sena» e' l'unico Sena della Serie A di quegli anni: Leo Sena, Spezia, 14 presenze
-- nel 2020-21 e zero nel 2021-22. Combacia col ruolo C della rosa del Real Monghi e
-- col fatto che in Caprera non e' mai sceso in campo. E' una mia identificazione, non
-- una conferma: se sbaglio si stacca la scheda e si torna indietro.
insert into caprera.calciatori (id, nome, ruolo, club)
select v.id, v.nome, v.ruolo, null
  from (values (3938,'Cabral J.','A'), (3939,'Leo Sena','C')) as v(id,nome,ruolo)
 where not exists (select 1 from caprera.calciatori c where c.nome = v.nome);

update caprera.statistiche_serie_a set calciatore = 3938
 where nome = 'Cabral J.' and calciatore is null;
update caprera.statistiche_serie_a set calciatore = 3939
 where nome = 'Sena' and calciatore is null;
update caprera.rose set calciatore = 3939
 where calciatore is null and regexp_replace(lower(nome),'[^a-z]','','g') = 'leosena';

update lavoro.registro_mercato m set calciatore = v.id
  from (values
    ('2021-22','prosecco','Cabral lazio',3938),
    ('2021-22','real-monghi','LeoSena',3939),
    ('2025-26','disperata','L. Martinez',1747)
  ) as v(stagione,societa,nome,id)
 where m.calciatore is null
   and m.stagione=v.stagione and m.societa=v.societa and m.nome=v.nome;

insert into caprera.movimenti (stagione, societa, categoria, voce, crediti, fonte, calciatore, finestra)
select m.stagione, m.societa, 'mercato', m.nome, m.crediti, 'foglio rose', m.calciatore, m.finestra
  from lavoro.registro_mercato m
 where m.calciatore is not null and m.crediti <> 0
   and not exists (
     select 1 from caprera.movimenti x
      where x.stagione=m.stagione and x.societa=m.societa
        and x.categoria='mercato' and x.voce=m.nome and x.crediti=m.crediti);
