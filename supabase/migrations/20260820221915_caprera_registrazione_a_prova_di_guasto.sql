-- Il collegamento alla societa' e' una comodita', non un requisito.
--
-- Se qualcosa in questa logica va storto, la registrazione **non deve
-- fallire**: chi sta creando la tessera si troverebbe davanti «errore del
-- database» senza aver sbagliato niente, e per lui la Federazione sarebbe
-- semplicemente rotta. Meglio un account senza societa', che si collega dopo,
-- che una porta che non si apre.
create or replace function caprera.utente_nuovo() returns trigger
  language plpgsql security definer set search_path = caprera, public, auth as $$
begin
  begin
    perform caprera.attiva_tessera(new.id, new.email);
  exception when others then
    -- si annota e si tira dritto: l'account nasce comunque
    raise warning 'tessera non attivata per % : % %', new.email, SQLSTATE, SQLERRM;
  end;
  return new;
end $$;

grant execute on function caprera.utente_nuovo() to supabase_auth_admin;

-- La rete di sicurezza: il sito puo' chiedere lui il collegamento dopo
-- l'accesso. Serve se il trigger non e' scattato - per un permesso mancante,
-- per un guasto, o perche' l'utente si era registrato prima che esistesse
-- tutto questo. Agisce solo su chi la chiama: non si puo' usare per collegare
-- qualcun altro.
create or replace function public.attiva_la_mia_tessera()
  returns table (societa text, nome text, ruolo text)
  language plpgsql security definer set search_path = caprera, public, auth as $$
declare e text;
begin
  if auth.uid() is null then return; end if;
  select u.email into e from auth.users u where u.id = auth.uid();
  perform caprera.attiva_tessera(auth.uid(), e);
  return query
    select m.societa, m.nome, m.ruolo from caprera.misteri m where m.utente = auth.uid();
end $$;

grant execute on function public.attiva_la_mia_tessera() to authenticated;

select has_schema_privilege('supabase_auth_admin', 'caprera', 'USAGE') as ora_puo_entrare;
