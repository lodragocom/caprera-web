-- 09 · Le quattro Supercoppe ricostruite — SCE e SCI del 2022-23 e del 2023-24
--
-- PRONTO DA APPLICARE, NON APPLICATO. Il Magazziniere non ha scritto niente in
-- produzione il 24/08/2026: il database e' vivo e ci lavorano altre sessioni.
-- Si applica con:  psql "$(cat ~/.caprera-dsn)" -f 09-supercoppe-ricostruite.sql
--
-- ⚠️ Queste righe NON sopravvivono a `carica.sh`: `edizioni`, `turni` e `partite`
-- stanno in TABELLE e vengono svuotate. Vale lo stesso trattamento di
-- `listoni-fine-stagione.sql`: si rilancia questo file dopo ogni caricamento,
-- finche' le quattro edizioni non entrano nella sorgente JSON (`cups.json`).
-- E' idempotente: si puo' rilanciare quante volte si vuole.
--
--
-- PERCHE' ESISTE
-- ---------------
-- Dal 2021-22 al 2023-24 l'archivio ha tre competizioni invece di sei: le
-- Supercoppe mancano. Non sono dati persi — non erano partite di Fantapazz, si
-- calcolavano dai fantapunti di squadre gia' note (L0, 24/08/2026). Lo scarto sui
-- diritti TV contro il registro di Guido e' esattamente 6 crediti per stagione:
-- SCE 4 + SCI 2. Vedi RAPPORTI/2026-08-24-segretario-diritti-tv-calcolabili.md.
--
-- COME SONO STATE RICOSTRUITE
-- ----------------------------
-- 1. PARTECIPANTI — dall'albo della stagione precedente:
--      SCE = vincente Champions  vs  vincente Europa League
--      SCI = vincente Lega Caprera (classifiche posizione 1)  vs  vincente Coppa Italia
--    Verificati 4 casi su 4 contro `caprera.movimenti` (categoria 'diritti-tv'):
--    le societa' che hanno incassato i diritti TV SCE/SCI sono esattamente queste.
--
-- 2. ESITO — dai fantapunti di campionato della 2a giornata CAPRERA (SCI) e della
--    3a (SCE). Regolamento §5.3: «La Supercoppa europea e la Supercoppa italiana si
--    giocano nella 3a e 2a giornata Caprera rispettivamente (al netto delle
--    giornate neutralizzate)».
--
--    ⚠️ TRAPPOLA: «giornata Caprera» NON e' «giornata di Serie A». Caprera comincia
--    dopo la chiusura del mercato e salta le prime giornate; in archivio una
--    giornata saltata e' una giornata in cui tutte e dieci le societa' hanno
--    esattamente 60,00 fantapunti. Verificato riga per riga sul database:
--
--      2022-23 → saltate le giornate 1, 2, 3   ⇒ 2a Caprera = 5a SA · 3a = 6a SA
--      2023-24 → saltata la giornata 1         ⇒ 2a Caprera = 3a SA · 3a = 4a SA
--
--    Calcolare sulla numerazione di Serie A avrebbe dato un 60-60 finto.
--
-- 3. IL +1 CASA — NON SI APPLICA. Deciso da L0 il 24/08/2026, e ha sciolto una
--    contraddizione dentro il regolamento che nessuno aveva notato: il §5.2 dice
--    «+1 in tutte le competizioni escluse le finali», il §5.3 dice «Vincitore CL
--    e Caprera gioca in casa (+1)» — ma la Supercoppa E' una finale. Vince il §5.2.
--
--    ⚠️ La decisione non e' nata dal testo ma DAI DATI: nella SCE 2024-25
--    sanguemisto (in casa) ha 77,00 contro 77,50 del Real Monghi, e col +1 avrebbe
--    vinto lei — mentre l'albo dice Real Monghi. Il registro aveva ragione e il
--    §5.3 no.
--
--    Conseguenza su queste quattro: cambia UN SOLO numero, i gol della SCE 2023-24
--    (sanguemisto 65,00 non raggiunge la soglia dei 66: da 1-2 a 0-2). Nessun
--    vincitore cambia.
--
-- 4. I GOL — `scala_gol` di `regole-caprera.json`, scala in vigore dal 2020-21:
--    soglie 66 · 72 · 77 · 82 · 86, un gol per ogni soglia raggiunta.
--    La soglia si intende RAGGIUNTA e non superata: verificato sul database, tutti
--    e 18 i casi da 66,00 esatti in queste stagioni valgono 1 gol.
--
--
-- I QUATTRO RISULTATI
-- --------------------
--   SCI 2022-23 (2a Caprera = 5a SA)  sanguemisto 79,50 — 69,00 armata-rossa   3-1  → SANGUEMISTO
--   SCE 2022-23 (3a Caprera = 6a SA)  disperata   79,50 — 74,00 sporting       3-2  → DISPERATA
--   SCI 2023-24 (2a Caprera = 3a SA)  roburro     66,00 — 72,50 subbuteo       1-2  → SUBBUTEO
--   SCE 2023-24 (3a Caprera = 4a SA)  sanguemisto 65,00 — 72,50 armata-rossa   0-2  → ARMATA ROSSA
--
--
-- ✅ DECISO da L0 il 24/08/2026: il +1 casa non si applica alle Supercoppe.
--    Il dubbio scritto qui sopra e' stato sciolto dalla Presidenza, ed e' stata la
--    SCE 2024-25 a farlo emergere: la' il +1 avrebbe ribaltato l'albo d'oro.
-- cambia nessun vincitore: al massimo cambia il 1-2 della SCE 2023-24 in 0-2.
--
-- Nota su `ai_fantapunti`: seguo la convenzione delle quattro Supercoppe gia' in
-- archivio — vale `true` solo quando i gol sono pari e a decidere sono i fantapunti.
-- Qui i gol non sono mai pari, quindi `false` su tutte e quattro.

begin;

-- Idempotenza: via le eventuali edizioni gia' presenti per queste due stagioni.
delete from caprera.partite p
 using caprera.turni t, caprera.edizioni e
 where p.turno = t.id and t.edizione = e.id
   and e.stagione in ('2022-23','2023-24')
   and e.competizione in ('supercoppa-italiana','supercoppa-europea');

delete from caprera.turni t
 using caprera.edizioni e
 where t.edizione = e.id
   and e.stagione in ('2022-23','2023-24')
   and e.competizione in ('supercoppa-italiana','supercoppa-europea');

delete from caprera.edizioni
 where stagione in ('2022-23','2023-24')
   and competizione in ('supercoppa-italiana','supercoppa-europea');

with nuove (competizione, stagione, vincitore, finalista,
            casa, fuori, gol_casa, gol_fuori, fp_casa, fp_fuori) as (
  values
    -- stagione 2022-23 — partecipanti dall'albo 2021-22
    ('supercoppa-italiana','2022-23','sanguemisto','armata-rossa',
     'sanguemisto','armata-rossa', 3, 1, 79.50, 69.00),
    ('supercoppa-europea','2022-23','disperata','sporting-mangiapreti',
     'disperata','sporting-mangiapreti', 3, 2, 79.50, 74.00),
    -- stagione 2023-24 — partecipanti dall'albo 2022-23
    ('supercoppa-italiana','2023-24','subbuteo','roburro',
     'roburro','subbuteo', 1, 2, 66.00, 72.50),
    ('supercoppa-europea','2023-24','armata-rossa','sanguemisto',
     'sanguemisto','armata-rossa', 0, 2, 65.00, 72.50)
), ed as (
  insert into caprera.edizioni (competizione, stagione, vincitore, finalista,
                                ai_fantapunti, in_parita)
  select competizione, stagione, vincitore, finalista, false, false from nuove
  returning id, competizione, stagione
), tu as (
  insert into caprera.turni (edizione, ordine, nome)
  select id, 0, 'Finali' from ed
  returning id, edizione
)
insert into caprera.partite (stagione, competizione, giornata, turno,
                             casa, fuori, gol_casa, gol_fuori,
                             fp_casa, fp_fuori, giocata)
select n.stagione, n.competizione, null, tu.id,
       n.casa, n.fuori, n.gol_casa, n.gol_fuori,
       n.fp_casa, n.fp_fuori, true
  from nuove n
  join ed on ed.competizione = n.competizione and ed.stagione = n.stagione
  join tu on tu.edizione = ed.id;

-- Verifica, da leggere prima di fare commit.
-- Attesa: 4 righe, e i finalisti coincidono con chi ha incassato i diritti TV
-- nel registro di Guido.
select e.stagione, e.competizione, e.vincitore, e.finalista,
       p.casa, p.gol_casa, p.gol_fuori, p.fuori, p.fp_casa, p.fp_fuori
  from caprera.edizioni e
  join caprera.turni t on t.edizione = e.id
  join caprera.partite p on p.turno = t.id
 where e.stagione in ('2022-23','2023-24')
   and e.competizione like 'supercoppa%'
 order by e.stagione, e.competizione;

-- Il collaudo vero: dopo questo file i diritti TV calcolati da `v_albo` devono
-- tornare al credito su tutte e cinque le stagioni del registro (oggi tre su
-- cinque, con uno scarto di 6 crediti esatti su 2022-23 e 2023-24).
select m.stagione, sum(m.crediti) registro
  from caprera.movimenti m
 where m.categoria = 'diritti-tv'
 group by 1 order by 1;

commit;
