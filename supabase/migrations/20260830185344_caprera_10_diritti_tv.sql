-- 10 · `caprera.v_diritti_tv` — i diritti TV ai finalisti, calcolati
--
-- PRONTO DA APPLICARE, NON APPLICATO (24/08/2026: nessuna scrittura in produzione).
--   psql "$(cat ~/.caprera-dsn)" -f 10-diritti-tv.sql
--
-- Chiude l'handoff del rapporto
-- RAPPORTI/2026-08-24-segretario-diritti-tv-calcolabili.md: «la vista dei diritti
-- TV va nella consegna `premi-crediti`, insieme al pari merito».
--
-- COSA FA
-- --------
-- Legge gli importi da `caprera.lega.regole → competizioni[].diritti_tv_finalista`
-- e li assegna a ENTRAMBI i finalisti di ogni edizione, prendendoli da
-- `caprera.v_albo`. Niente logica di tabellone: quella e' gia' in `v_albo`.
-- Gli importi NON sono nel codice — regola cambiata = si cambia il JSON, si
-- ricarica `lega.regole` e la vista cambia da sola. Oggi: CL 2 · SCE 2 ·
-- EL / ConfL / CI / SCI 1.
--
-- IL COLLAUDO E' DENTRO IL CALCOLO
-- ---------------------------------
-- Confrontata con `caprera.movimenti` (il registro di Guido, categoria
-- 'diritti-tv'). Verificato interrogando il database vivo il 24/08/2026:
--
--   2021-22   8 = 8   ✅      2024-25  16 = 16  ✅
--   2022-23   8 ≠ 14  ⚠️      2025-26  16 = 16  ✅
--   2023-24   8 ≠ 14  ⚠️
--
-- Le due che non tornano sbagliano di 6 crediti esatti, e i 6 sono SCE 4 + SCI 2:
-- e' l'archivio a mancare, non il calcolo. Si chiudono applicando
-- `09-supercoppe-ricostruite.sql`, e allora tornano tutte e cinque.
--
-- Prima del 2021-22 il registro di Guido non arriva: il calcolo produce comunque
-- un numero (6 o 8 a stagione) che nessuna fonte conferma. E' calcolato, non
-- verificato — chi lo mostra deve dirlo.
--
-- ⚠️ NON APRE NESSUNA FINESTRA IN `public`. Il sito legge da `public`, ma
-- aprire una finestra nuova e' una decisione e passa dal Direttore Sportivo
-- (CAPRERA.md, ADR-002). Quando sara' decisa, la riga va in `02-viste.sql`.

begin;

create or replace view caprera.v_diritti_tv
  with (security_invoker = true) as
with importi as (
  select c ->> 'id'                            as competizione,
         (c ->> 'diritti_tv_finalista')::numeric as importo
    from caprera.lega l,
         lateral jsonb_array_elements(l.regole -> 'competizioni') c
   where l.id = 'caprera'
     and c ? 'diritti_tv_finalista'
)
select a.stagione,
       f.societa,
       a.competizione,
       (a.vincitore = f.societa) as vincitore,
       i.importo                 as crediti
  from caprera.v_albo a
  join importi i on i.competizione = a.competizione,
  lateral (values (a.vincitore), (a.finalista)) f(societa)
 where f.societa is not null;

comment on view caprera.v_diritti_tv is
  'Diritti TV ai finalisti: v_albo per chi, lega.regole per quanto. '
  'Una riga per societa'' premiata. Confrontabile con caprera.movimenti '
  '(categoria ''diritti-tv''): torna al credito su 2021-22, 2024-25 e 2025-26; '
  'su 2022-23 e 2023-24 mancano 6 crediti finche'' le Supercoppe non sono in archivio.';

-- Verifica da leggere prima del commit: calcolato contro registro, per stagione.
with reg as (
  select stagione, sum(crediti) crediti
    from caprera.movimenti where categoria = 'diritti-tv' group by 1)
select coalesce(v.stagione, reg.stagione) as stagione,
       sum(v.crediti) as calcolato,
       max(reg.crediti) as registro
  from caprera.v_diritti_tv v
  full join reg on reg.stagione = v.stagione
 group by 1 order by 1;

commit;
