-- Il foglio batte la ricostruzione, sempre. Butto via le 301 righe che avevo dedotto
-- dal campo per il 2020-21 e ci metto le 299 che stanno nel file, con i prezzi.
--
-- E il confronto fra le due, prima di cancellarle, e' la lezione piu' utile di oggi:
-- la ricostruzione aveva azzeccato 234 nomi su 299, il 78%. Sessantotto ne aveva
-- mancati e sessantasette ne aveva messi di troppo. La media della rosa veniva 30,1
-- contro i 30 di regolamento - il controllo che avevo usato per dire che il metodo
-- funzionava. Ma un totale che torna non vuol dire che tornino i nomi: gli errori si
-- compensavano. E' lo stesso errore di ragionamento di sempre, guardare l'aggregato
-- invece delle righe.
delete from caprera.rose
 where stagione='2020-21' and momento='partenza' and fonte='campo';

insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, club, costo, momento, fonte)
select f.stagione, f.societa,
       (select c.id from caprera.calciatori c
         where regexp_replace(lower(c.nome),'[^a-z]','','g') = regexp_replace(lower(f.nome),'[^a-z]','','g')
           and c.ruolo = f.ruolo
         limit 1),
       f.nome, f.ruolo, f.club, f.costo, 'partenza', 'foglio'
  from lavoro.rose_fantapazz f
 where f.stagione='2020-21';
