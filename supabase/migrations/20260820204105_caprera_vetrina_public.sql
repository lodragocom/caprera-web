-- La vetrina in `public`.
--
-- L'API di Supabase serve solo gli schemi elencati nelle impostazioni del
-- progetto, e `public` e' l'unico acceso di serie. Invece di dipendere da una
-- spunta nel cruscotto - che si perde, si dimentica e non sta in nessun file -
-- l'archivio si affaccia in `public` con delle viste sottili.
--
-- Sono finestre, non copie: `security_invoker` fa applicare le regole di riga
-- delle tabelle sotto, quindi la separazione fra pubblico e privato resta
-- esattamente dov'era. Contratti, finanze e misteri NON hanno finestra: chi
-- non deve vederli non li trova nemmeno sulla mappa.
do $$
declare o text;
begin
  foreach o in array array[
    'lega','stagioni','societa','societa_nomi_storici','partecipazioni',
    'competizioni','edizioni','turni','partite','classifiche',
    'calciatori','calciatori_nomi','rose','listone',
    'formazioni','formazione_giocatori','bonus_tipi','formazione_bonus',
    'formazione_modificatori',
    'v_albo','v_bacheca','v_classifica_calcolata','v_classifica_fantapunti',
    'v_classifica_marcatori','v_forma','v_gare','v_impieghi','v_marcatori',
    'v_premi_crediti']
  loop
    execute format(
      'create or replace view public.%I with (security_invoker = on)'
      ' as select * from caprera.%I', o, o);
    execute format('grant select on public.%I to anon, authenticated', o);
  end loop;
end $$;
