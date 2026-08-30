-- Il cane che si morde la coda.
--
-- `attiva_tessera` finisce segnando sulla tessera la data d'uso. Ma il
-- trigger sulle tessere era su INSERT **e su ogni UPDATE**: quella scrittura
-- lo risvegliava, lui richiamava `attiva_tessera`, che riscriveva la data...
-- «stack depth limit exceeded». La registrazione riusciva - avevo messo
-- l'antincendio giusto - ma il collegamento non avveniva mai, e chi entrava
-- si vedeva dire che non risultava tesserato.
--
-- Rimedio in due strati. Il trigger si sveglia solo quando cambiano le
-- colonne che contano davvero (`update of societa, nome, ruolo`): la data
-- d'uso non lo riguarda. E in piu' `pg_trigger_depth()` impedisce comunque
-- il secondo giro, perche' una protezione che dipende da come e' scritta la
-- UPDATE di domani non e' una protezione.
drop trigger if exists caprera_tessera_nuova on caprera.tessere;

create trigger caprera_tessera_nuova
  after insert or update of societa, nome, ruolo on caprera.tessere
  for each row when (pg_trigger_depth() < 2)
  execute function caprera.tessera_nuova();

-- La data d'uso si scrive solo se non c'e' gia': una scrittura in meno e'
-- un risveglio in meno.
create or replace function caprera.attiva_tessera(p_utente uuid, p_email text)
  returns void
  language plpgsql security definer set search_path = caprera, public, auth as $$
declare t caprera.tessere%rowtype;
begin
  select * into t from caprera.tessere where email = lower(btrim(p_email));
  if not found then return; end if;

  insert into caprera.misteri (utente, societa, nome, ruolo)
       values (p_utente, t.societa, t.nome, t.ruolo)
  on conflict (utente) do update
     set societa = excluded.societa, nome = excluded.nome, ruolo = excluded.ruolo;

  if t.usata_il is null then
    update caprera.tessere set usata_il = now() where email = t.email;
  end if;
end $$;

grant execute on function caprera.attiva_tessera(uuid, text) to supabase_auth_admin;
