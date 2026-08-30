-- Pinamonti: come Lautaro, un incasso senza un addebito corrispondente, su un giocatore
-- che e' di un'altra societa' da settembre a maggio. Il Roburro incassa 15, meta' tonda
-- del cartellino da 30 che porta lo Smit.
insert into caprera.passaggi (stagione, calciatore, nome, da, a, tipo, certezza, fonte, nota)
values ('2025-26', 1306, 'Pinamonti', 'roburro', 'smit', 'scambio', 'foglio', 'foglio rose',
        'incassati 15 crediti, meta esatta del cartellino da 30 che il giocatore ha allo Smit')
on conflict do nothing;

-- 4. Gli svincoli. Il foglio scrive il nome e non scrive nessun prezzo, perche' uno
--    svincolo non costa niente. Sessantasei di questi settantadue nomi stanno nella rosa
--    di settembre e non ci sono piu' a maggio: e' quello che li rende svincoli e non
--    acquisti a costo zero.
insert into caprera.passaggi (stagione, calciatore, nome, da, tipo, finestra, certezza, fonte)
select z.stagione, z.calciatore, z.nome, z.societa, 'svincolo', z.finestra, 'foglio', 'foglio rose'
  from lavoro.registro_mercato z
 where z.calciatore is not null and z.crediti = 0
   and exists (select 1 from caprera.rose p
                where p.stagione=z.stagione and p.societa=z.societa
                  and p.calciatore=z.calciatore and p.momento='partenza')
   and not exists (select 1 from caprera.rose f
                where f.stagione=z.stagione and f.societa=z.societa
                  and f.calciatore=z.calciatore and f.momento='fine')
on conflict do nothing;

-- 5. Le altre uscite che il foglio registra da solo: c'era a settembre, non c'e' a maggio,
--    e nessuno ha scritto perche'.
insert into caprera.passaggi (stagione, calciatore, nome, da, tipo, certezza, fonte)
select p.stagione, p.calciatore, p.nome, p.societa, 'uscita', 'foglio', 'rose partenza/fine'
  from caprera.rose p
 where p.momento='partenza' and p.calciatore is not null
   and not exists (select 1 from caprera.rose f
                where f.stagione=p.stagione and f.societa=p.societa
                  and f.calciatore=p.calciatore and f.momento='fine')
on conflict do nothing;

-- 6. Le uscite che nessun foglio scrive e che si vedono solo nelle formazioni. Sono le
--    stagioni della carta e penna: e' un indizio forte ma resta un indizio, e la colonna
--    certezza lo dice a chi legge.
insert into caprera.passaggi (stagione, calciatore, nome, da, tipo, certezza, fonte, nota)
select c.stagione, c.calciatore, cal.nome, c.societa, 'uscita', 'campo', 'formazioni',
       'schierato dalla giornata ' || c.prima || ' alla ' || c.ultima || ', ' || c.volte ||
       ' impieghi, e assente dalla rosa di maggio'
  from (select p.stagione, f.societa, g.calciatore,
               min(p.giornata) prima, max(p.giornata) ultima, count(*) volte
          from caprera.formazione_giocatori g
          join caprera.formazioni f on f.id=g.formazione
          join caprera.partite p on p.id=f.partita
         group by 1,2,3) c
  join caprera.calciatori cal on cal.id=c.calciatore
 where not exists (select 1 from caprera.rose r
                    where r.stagione=c.stagione and r.societa=c.societa
                      and r.calciatore=c.calciatore and r.momento='fine')
on conflict do nothing;
