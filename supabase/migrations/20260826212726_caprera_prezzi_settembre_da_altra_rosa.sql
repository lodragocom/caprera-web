-- «Se hai fatto le rose finali di maggio e le riporti a settembre, con gli scambi
-- possiamo risalire.» - La Presidenza, e aveva ragione due volte.
--
-- La prima: il prezzo di settembre in gran parte c'era gia' e io avevo detto di no.
-- Chi c'e' a settembre e a maggio porta con se' il suo costo, perche' il costo non
-- cambia durante la stagione: 920 righe su 1.172 nelle quattro stagioni vecchie
-- hanno il prezzo, ed e' il 78%. Quello che manca e' il prezzo di chi se n'e' andato,
-- che a maggio in quella rosa non c'e' piu'.
--
-- La seconda: per una parte di quelli si risale lo stesso, se il giocatore ricompare
-- nella rosa di maggio di un'ALTRA societa' della stessa stagione. Sono 74 righe.
--
-- Quanto vale il trasferimento del prezzo l'ho misurato dove ho tutte e due le rose
-- vere: su 39 casi di giocatori passati da una societa' all'altra dentro la stagione,
-- 31 mantengono lo stesso identico costo e 8 cambiano - il 79%. Non e' certezza, e
-- infatti queste righe restano marcate fonte='campo' come tutte le altre ricostruite:
-- chi legge sa gia' che non vengono da un documento.
update caprera.rose p set costo = (
    select f.costo from caprera.rose f
     where f.stagione=p.stagione and f.momento='fine'
       and f.calciatore=p.calciatore and f.societa <> p.societa and f.costo is not null
     limit 1)
 where p.momento='partenza' and p.fonte='campo' and p.costo is null
   and exists (select 1 from caprera.rose f
                where f.stagione=p.stagione and f.momento='fine'
                  and f.calciatore=p.calciatore and f.societa <> p.societa and f.costo is not null);
