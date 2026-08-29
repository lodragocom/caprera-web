alter table caprera.movimenti add column if not exists verso text;
alter table caprera.movimenti drop constraint if exists movimenti_verso_check;
alter table caprera.movimenti add constraint movimenti_verso_check
  check (verso is null or verso in ('entrata','uscita'));

comment on column caprera.movimenti.verso is
 'Solo per categoria=mercato. Ricavato dall''appartenenza alle rose della stessa societa e stagione: entrata = assente a settembre e presente a maggio; uscita = presente a settembre e assente a maggio. Resta null dove le rose non ancorano la riga (16) e dove il giocatore c''e in tutte e due le fotografie (3, i +1 contro speculazioni). Il segno non e il discriminante: fra le negative ci sono 16 entrate a prezzo pieno e 37 uscite a prezzo pieno.';

update caprera.movimenti m set verso='entrata'
 where m.categoria='mercato' and m.calciatore is not null
   and not exists (select 1 from caprera.rose r where r.stagione=m.stagione and r.societa=m.societa
                     and r.momento='partenza' and r.calciatore=m.calciatore)
   and     exists (select 1 from caprera.rose r where r.stagione=m.stagione and r.societa=m.societa
                     and r.momento='fine'     and r.calciatore=m.calciatore);

update caprera.movimenti m set verso='uscita'
 where m.categoria='mercato' and m.calciatore is not null
   and     exists (select 1 from caprera.rose r where r.stagione=m.stagione and r.societa=m.societa
                     and r.momento='partenza' and r.calciatore=m.calciatore)
   and not exists (select 1 from caprera.rose r where r.stagione=m.stagione and r.societa=m.societa
                     and r.momento='fine'     and r.calciatore=m.calciatore);
