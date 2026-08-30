-- ============================================================================
-- Il Mondiale per Club entra fra le competizioni.
--
-- DPCM Mondiale Per Club 11.25, confermato dal Referendum Separazione Carriere
-- (L0, 30/08/2026): **la competizione si fa**. L'aumento di capitale a 145 —
-- i 5 euro a societa' all'anno che il DPCM chiedeva — **non passa**.
--
-- ⚠️ Dura DUE anni e non uno, ed e' la cosa che la rende diversa da tutte le
-- altre in archivio:
--   1o anno  qualificazione — 18 partite andata e ritorno, dalla 2a giornata
--            Caprera, ogni giornata pari fino alla 36a. Passano le migliori 4.
--            +1 credito a chi si qualifica.
--   2o anno  finali — girone a 4 andata e ritorno (6 partite) dalla 4a ogni due
--            giornate, poi semifinali e finale in gara unica (16a e 18a).
--            +1 partecipazione, +1 semifinale, +1 finale.
--
-- Le voci dei crediti entrano nel catalogo con l'importo del 2026-27: sono
-- premi che si registrano quando succedono, non calcoli automatici — il
-- tabellone non esiste ancora.
-- ============================================================================

insert into caprera.competizioni (id, lega, nome, tipo, colore, ordine, dalla_stagione)
values ('mondiale-per-club', 'caprera', 'Mondiale per Club', 'eliminazione',
        '#6f8fd6', 90, '2026-27')
on conflict (id) do update
   set nome = excluded.nome, dalla_stagione = excluded.dalla_stagione;

insert into caprera.voci_atto (categoria, nome, descrizione, attiva) values
  ('premi-caprera', 'Mondiale per Club — qualificazione',
   'Alle migliori 4 del primo anno (18 partite, giornate pari dalla 2a alla 36a). DPCM 11.25.', true),
  ('premi-caprera', 'Mondiale per Club — finali',
   'A chi partecipa al girone finale del secondo anno. DPCM 11.25.', true),
  ('premi-caprera', 'Mondiale per Club — semifinale',
   'A chi raggiunge la semifinale (16a giornata). DPCM 11.25.', true),
  ('premi-caprera', 'Mondiale per Club — finale',
   'A chi raggiunge la finale (18a giornata). DPCM 11.25.', true)
on conflict (categoria, nome) do nothing;

insert into caprera.voci_atto_importo (voce, stagione, importo)
select v.id, '2026-27', 1
  from caprera.voci_atto v
 where v.categoria = 'premi-caprera' and v.nome like 'Mondiale per Club%'
on conflict (voce, stagione) do nothing;
