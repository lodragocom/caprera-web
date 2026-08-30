-- Il prezzo di chi e' uscito, preso da chi e' entrato al suo posto.
--
-- Nelle quattro stagioni ricostruite ci sono 178 righe di settembre senza
-- prezzo: chi c'era ad agosto e a maggio non c'e' piu'. La Presidenza indica
-- la strada giusta - il posto in rosa non resta vuoto, qualcuno lo prende, e
-- quel qualcuno un prezzo ce l'ha.
--
-- Ma vale solo dove la risposta non dipende da chi scegli. Misurato sui 178:
--    91 righe  i candidati (stessa societa', stesso ruolo) hanno TUTTI lo
--              stesso prezzo - 39 perche' il candidato e' uno solo, 52 perche'
--              sono piu' d'uno ma costano uguale. Qui il numero e' determinato:
--              qualunque accoppiamento tu faccia, esce quello.
--    81 righe  i candidati hanno prezzi diversi fra loro. Sceglierne uno
--              sarebbe tirare a sorte e scriverlo come se fosse un dato.
--     6 righe  nessun candidato: quel ruolo, in quella societa', non lo ha
--              ripreso nessuno.
--
-- Si scrivono le 91. Le altre 87 restano vuote, che e' l'unica cosa vera che
-- si puo' dire di loro.
--
-- E si scrivono marcate. Un prezzo dedotto dal sostituto non e' il prezzo
-- trascritto da un foglio: e' una stima, e chi legge una somma deve poter
-- sapere quanta parte e' stimata. Senza il flag, fra sei mesi questi 91
-- numeri sono indistinguibili dai 994 veri.
alter table caprera.rose add column if not exists costo_stimato boolean not null default false;

comment on column caprera.rose.costo_stimato is
 'true quando `costo` non e trascritto ma dedotto: il prezzo di chi ha preso quel posto in rosa (stessa societa, stesso ruolo) nelle stagioni con la rosa di settembre ricostruita. Scritto solo dove tutti i candidati costavano uguale, cioe dove il numero non dipende da quale si sceglie. Una somma che include queste righe non e una somma di prezzi pagati.';

with p as (
  select stagione, societa, calciatore from caprera.rose where momento='partenza'
), entrati as (
  select fi.stagione, fi.societa, fi.ruolo, fi.costo
    from caprera.rose fi
   where fi.momento='fine' and fi.costo is not null
     and not exists (select 1 from p
                      where p.stagione=fi.stagione and p.societa=fi.societa
                        and p.calciatore=fi.calciatore)
), determinate as (
  select r.id,
         (select min(e.costo) from entrati e
           where e.stagione=r.stagione and e.societa=r.societa and e.ruolo=r.ruolo) prezzo
    from caprera.rose r
   where r.momento='partenza' and r.costo is null
     and not exists (select 1 from caprera.rose f
                      where f.stagione=r.stagione and f.societa=r.societa
                        and f.momento='fine' and f.calciatore=r.calciatore)
     and (select count(distinct e.costo) from entrati e
           where e.stagione=r.stagione and e.societa=r.societa and e.ruolo=r.ruolo) = 1
)
update caprera.rose r
   set costo = d.prezzo, costo_stimato = true
  from determinate d
 where r.id = d.id;
