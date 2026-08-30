-- La carriera di un calciatore in Caprera, stagione per stagione.
--
-- Tutto quello che segue esce da `formazione_giocatori` (112.888 righe, dieci
-- stagioni, tutte agganciate a un calciatore) e da `formazione_bonus`. Non
-- aggiunge un dato: mette insieme quelli che c'erano gia' sparsi.
--
-- Due cose che NON ci sono e che questa vista non finge di avere:
--   * i minuti giocati. Il fantacalcio non li registra: c'e' titolare,
--     subentrato, panchina, e basta.
--   * gli infortuni. Non esistono in nessuna tabella. `convocato - con_voto`
--     dice quante volte non e' sceso in campo, ma comprende squalifiche e
--     scelte del mister: non e' un conteggio di infortuni e non va letto cosi'.
--
-- I gol sono `gol` + `rigore`, come gia' fa `v_marcatori`: le due voci sono
-- separate in archivio e si sommano. `rigori` e' il di cui.
create or replace view caprera.v_carriera as
with imp as (
  select fg.id as gid, fg.calciatore, f.societa, p.stagione,
         fg.titolare, fg.entrato, fg.voto
  from caprera.formazione_giocatori fg
  join caprera.formazioni f on f.id = fg.formazione
  join caprera.partite p on p.id = f.partita
),
pres as (
  select calciatore, societa, stagione,
         count(*)                              as convocato,
         count(*) filter (where titolare)      as titolare,
         count(*) filter (where entrato)       as subentrato,
         count(voto)                           as con_voto,
         round(avg(voto), 2)                   as mv
  from imp
  group by 1, 2, 3
),
bon as (
  select i.calciatore, i.societa, i.stagione,
         sum(b.quante) filter (where b.bonus in ('gol', 'rigore')) as gol,
         sum(b.quante) filter (where b.bonus = 'rigore')           as rigori,
         sum(b.quante) filter (where b.bonus = 'rigore-sbagliato') as rigori_sbagliati,
         sum(b.quante) filter (where b.bonus = 'rigore-parato')    as rigori_parati,
         sum(b.quante) filter (where b.bonus = 'assist')           as assist,
         sum(b.quante) filter (where b.bonus = 'giallo')           as gialli,
         sum(b.quante) filter (where b.bonus = 'rosso')            as rossi,
         sum(b.quante) filter (where b.bonus = 'autogol')          as autogol,
         sum(b.quante) filter (where b.bonus = 'imbattuto')        as imbattuto,
         sum(b.quante) filter (where b.bonus = 'gol-subito')       as gol_subiti,
         sum(b.quante) filter (where b.bonus = 'gol-vittoria')     as gol_vittoria
  from imp i
  join caprera.formazione_bonus b on b.giocatore = i.gid
  group by 1, 2, 3
)
select p.calciatore,
       c.nome,
       c.ruolo,
       p.stagione,
       p.societa,
       r.club,
       r.costo,
       r.fm,
       p.convocato, p.titolare, p.subentrato, p.con_voto, p.mv,
       coalesce(b.gol, 0)              as gol,
       coalesce(b.rigori, 0)           as rigori,
       coalesce(b.rigori_sbagliati, 0) as rigori_sbagliati,
       coalesce(b.rigori_parati, 0)    as rigori_parati,
       coalesce(b.assist, 0)           as assist,
       coalesce(b.gialli, 0)           as gialli,
       coalesce(b.rossi, 0)            as rossi,
       coalesce(b.autogol, 0)          as autogol,
       coalesce(b.imbattuto, 0)        as imbattuto,
       coalesce(b.gol_subiti, 0)       as gol_subiti,
       coalesce(b.gol_vittoria, 0)     as gol_vittoria
from pres p
join caprera.calciatori c on c.id = p.calciatore
left join bon b
  on b.calciatore = p.calciatore and b.societa = p.societa and b.stagione = p.stagione
left join caprera.rose r
  on r.calciatore = p.calciatore and r.societa = p.societa and r.stagione = p.stagione;

-- La finestra sottile su `public`, che e' l'unico schema servito dall'API.
create or replace view public.v_carriera
  with (security_invoker = on) as
  select * from caprera.v_carriera;

revoke all on public.v_carriera from anon, authenticated;
grant select on public.v_carriera to anon, authenticated;
