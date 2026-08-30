-- ============================================================================
-- Da applicare PRIMA di aprire il sito al pubblico.
--
-- Non l'ho eseguito io: vale ancora la regola di un solo scrittore per volta
-- sul database. Applicalo tu (o il Magazziniere quando ha finito), poi
-- riesegui  python3 scripts/esporta-migrazioni.py  per portarlo nel repo.
-- ============================================================================


-- 1. LA TESSERA NON SI APRE ---------------------------------------------------
-- `la_mia_scheda` va a prendersi l'email da `auth.users`, ma e'
-- security_invoker: quella sottoquery gira con i diritti di chi legge, e
-- `authenticated` su `auth.users` non ne ha nessuno. Misurato:
--   select nome  from la_mia_scheda  -> passa
--   select email from la_mia_scheda  -> permission denied for table users
--
-- La riga e' gia' filtrata su auth.uid(), quindi l'email del JWT E' quella
-- giusta e non serve leggere `auth.users`. Il cast a varchar serve perche'
-- CREATE OR REPLACE VIEW pretende gli stessi tipi di prima — e li pretende
-- esatti: `character varying` non basta, la colonna e' `varying(255)` e senza
-- la lunghezza Postgres rifiuta con «cannot change data type of view column».
create or replace view public.la_mia_scheda as
select utente, nome, cognome, soprannome, telefono, videochiamata, aggiornata,
       (auth.jwt() ->> 'email')::character varying(255) as email
  from caprera.schede
 where utente = auth.uid();


-- 2. L'UNICA TABELLA SENZA REGOLE DI RIGA -------------------------------------
-- `caprera.finestre` (le finestre di mercato) e' l'unica tabella di caprera
-- con RLS spenta, e `anon` la legge. Con il sito su un dominio pubblico
-- conviene che il permesso sia scritto invece che sottinteso: il calendario
-- del mercato lo puo' vedere chiunque, ma lo diciamo noi, non il caso.
alter table caprera.finestre enable row level security;

create policy finestre_le_vede_chiunque
  on caprera.finestre for select
  using (true);


-- ----------------------------------------------------------------------------
-- NON in questo file, di proposito:
--
-- `public.schede_complete` ha lo stesso difetto della n.1 ed e' rotta allo
-- stesso modo. Li' pero' auth.jwt() non basta, perche' quella vista deve
-- leggere le email DEGLI ALTRI, e la via d'uscita cambia le regole di chi
-- vede cosa. Oggi non la usa nessuna pagina. Si decide a parte.
-- ----------------------------------------------------------------------------
