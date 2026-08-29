-- «La societa' incassa la meta'. Lo svincolo rende la meta'.» - La Presidenza.
-- E il regolamento la scrive cinque volte, una per stagione: «i Calciatori svincolati
-- rendono il 50% del prezzo di acquisto estivo».
--
-- Cinquanta righe avevano quel numero col segno sbagliato. Non tutte e ottantasette
-- come avevo detto un momento fa: il foglio distingue due cose che io avevo messo
-- insieme, e la distinzione si vede nel numero stesso.
--
--   Dove l'addebito e' il prezzo PIENO del cartellino, e' l'acquisto all'asta e il
--   meno ci va: 2022-23, trentacinque righe, ognuna appaiata al suo accredito - il
--   Ceesay del Sanguemisto entra a -20 ed esce a +10, che e' la meta' tonda. Dove
--   l'accredito e' +1 invece della meta' c'e' un'altra regola del DPCM: «i Calciatori
--   scambiati possono anche essere svincolati ma si riceve un credito solo», ed e'
--   il caso di Lukaku, comprato 118 e reso per un credito perche' arrivato in scambio.
--
--   Dove invece l'addebito e' gia' la META' del cartellino, quello non e' un acquisto:
--   e' il rimborso dello svincolo, e va col piu'. Sono le stagioni dal 2023-24, dove
--   nel foglio e' rimasta solo questa colonna: nove righe nel 2023-24, quattordici nel
--   2024-25, ventisette nel 2025-26.
--
-- Gosens: pagato 30 all'asta, svincolato a gennaio, rende 15. Non -15.
update caprera.movimenti m set crediti = -crediti
 where m.categoria='mercato' and m.crediti < 0
   and exists (select 1 from caprera.rose p
                where p.stagione=m.stagione and p.societa=m.societa
                  and p.calciatore=m.calciatore and p.momento='partenza'
                  and -m.crediti = p.costo / 2 and p.costo >= 2)
   and not exists (select 1 from caprera.rose f
                    where f.stagione=m.stagione and f.societa=m.societa
                      and f.calciatore=m.calciatore and f.momento='fine');
