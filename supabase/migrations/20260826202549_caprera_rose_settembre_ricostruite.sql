-- LA ROSA DI SETTEMBRE DELLE CINQUE STAGIONI VECCHIE, RICOSTRUITA DAL CAMPO
--
-- L'idea e' della Presidenza: le formazioni di settembre ci sono tutte, e con quelle
-- piu' le uscite si torna indietro dalla rosa di maggio. La formula e':
--
--   settembre = maggio - (chi e' arrivato a mercato aperto) + (chi se n'e' andato)
--
-- Chi e' arrivato dopo si riconosce dalla prima presenza, e non e' una congettura:
-- l'ho misurato sulle cinque stagioni dove la rosa di settembre ce l'abbiamo davvero.
-- Su 205 arrivi veri, TUTTI hanno la prima presenza fuori dalle prime sei giornate -
-- zero eccezioni. E si concentrano dove ci si aspetta: nel 2022-23, 2023-24 e 2024-25
-- il 100% debutta fra la diciottesima e la ventiquattresima, cioe' subito dopo il
-- mercato di gennaio. Il campo, da solo, ritrova il calendario del mercato.
--
-- Le due stagioni con una finestra in piu' tornano anche loro: gli otto arrivi con
-- debutto fra la settima e l'undicesima stanno tutti nel 2021-22, l'anno della finestra
-- di novembre. Per il 2020-21, che ha quella di dicembre, la banda giusta parte
-- dall'ottava: con quella la rosa media viene 30,1 invece di 33.
--
-- IL CONTROLLO CHE CONTA: la rosa ricostruita deve avere la dimensione di regolamento,
-- 28 giocatori fino al 2017-18 e 30 dal 2018-19. Non l'ho imposta, e' venuta fuori:
--   2016-17 media 28,8   2017-18 media 28,2   2018-19 media 29,9   2019-20 media 30,3
-- Nessuno ha detto al conto quale fosse il numero giusto.
--
-- Dove non torna, e perche': chi era in rosa a settembre, se n'e' andato e non e' MAI
-- sceso in campo non lascia traccia da nessuna parte. E' il punto cieco noto del metodo,
-- lo stesso che nel 2020-21 aveva mancato Poli e Coley. Per questo queste righe nascono
-- con fonte='campo' e non 'foglio': si possono leggere, ma non si possono confondere.
insert into caprera.rose (stagione, societa, calciatore, nome, ruolo, club, costo, momento, fonte)
with banda(stagione, da, a) as (values
       ('2016-17',18,24), ('2017-18',18,24), ('2018-19',18,24), ('2019-20',18,24), ('2020-21',8,24)),
mag as (select r.* from caprera.rose r where r.momento='fine' and r.calciatore is not null
         and r.stagione in ('2016-17','2017-18','2018-19','2019-20','2020-21')),
campo as (select p.stagione, f.societa, g.calciatore, min(p.giornata) prima
            from caprera.formazione_giocatori g
            join caprera.formazioni f on f.id=g.formazione
            join caprera.partite p on p.id=f.partita
           where p.stagione in ('2016-17','2017-18','2018-19','2019-20','2020-21')
           group by 1,2,3),
restati as (
  select m.stagione, m.societa, m.calciatore, m.nome, m.ruolo, m.club, m.costo
    from mag m
    join banda b on b.stagione = m.stagione
    left join campo c on c.stagione=m.stagione and c.societa=m.societa and c.calciatore=m.calciatore
   where c.prima is null or c.prima not between b.da and b.a),
usciti as (
  select c.stagione, c.societa, c.calciatore, cal.nome, cal.ruolo, cal.club, null::int costo
    from campo c
    join caprera.calciatori cal on cal.id = c.calciatore
   where not exists (select 1 from mag m
                      where m.stagione=c.stagione and m.societa=c.societa and m.calciatore=c.calciatore)),
tutti as (select * from restati union all select * from usciti),
-- Quattro casi in cinque stagioni hanno due persone diverse con lo stesso cognome nella
-- stessa squadra: Sanchez, Pedro, Salcedo, i soliti. Dove capita aggiungo il ruolo, e
-- se non basta il numero di scheda: meglio un nome brutto che due righe che si mangiano.
numerati as (
  select t.*, count(*) over (partition by stagione, societa, nome) quanti,
         row_number() over (partition by stagione, societa, nome order by calciatore) n
    from tutti t)
select stagione, societa, calciatore,
       case when quanti = 1 then nome
            when count(*) over (partition by stagione, societa, nome, ruolo) = 1
              then nome || ' (' || ruolo || ')'
            else nome || ' #' || calciatore end,
       ruolo, club, costo, 'partenza', 'campo'
  from numerati t
 where not exists (select 1 from caprera.rose r
                    where r.stagione=t.stagione and r.societa=t.societa
                      and r.momento='partenza' and r.calciatore=t.calciatore);
