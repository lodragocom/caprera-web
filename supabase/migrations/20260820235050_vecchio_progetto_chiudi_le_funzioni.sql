-- Le tabelle del tentativo di settembre 2025 erano gia' state spostate in
-- `vecchio_progetto`. Le sue FUNZIONI erano rimaste in `public`, e `public` e'
-- lo schema che l'API di Supabase pubblica.
--
-- Fra queste c'era:
--
--   public.execute_sql(query text) SECURITY DEFINER, execute concesso a anon
--     RETURN QUERY EXECUTE 'SELECT to_json(t) FROM (' || query || ') t';
--
-- cioe' l'esecuzione di SQL arbitrario con i permessi di `postgres`,
-- raggiungibile da chiunque avesse la chiave anon - che sta in chiaro dentro
-- il JavaScript del sito, per progetto. Chiunque avesse aperto il sito e
-- guardato la pagina poteva leggere qualunque tabella, o cancellarle tutte.
--
-- Nessuna di queste funzioni e' chiamata dal sito. Vengono spostate e non
-- cancellate, come si era fatto con le tabelle: se una servisse davvero si
-- ritrova, ma intanto esce dall'API.
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as firma
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
       and p.proname not in ('attiva_la_mia_tessera', 'salva_la_mia_scheda',
                             'set_current_timestamp_updated_at')
  loop
    execute format('alter function %s set schema vecchio_progetto', f.firma);
  end loop;
end $$;

revoke all on all functions in schema vecchio_progetto from anon, authenticated, public;
revoke usage on schema vecchio_progetto from anon, authenticated, public;
