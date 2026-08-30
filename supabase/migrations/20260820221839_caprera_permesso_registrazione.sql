-- «Database error saving new user».
--
-- La registrazione non la esegue il sito: la esegue il servizio di
-- autenticazione di Supabase, con un ruolo suo, `supabase_auth_admin`. Quel
-- ruolo scrive in `auth.users` e fa scattare il nostro trigger — ma per
-- arrivare al trigger deve poter **entrare nello schema `caprera`**, e quel
-- permesso non gliel'avevo dato. Risultato: la scrittura falliva, e GoTrue
-- riportava l'unica cosa che sapeva, «errore del database».
--
-- La funzione e' SECURITY DEFINER e appartiene a postgres, quindi una volta
-- entrato fa il resto con i suoi permessi: non gli si sta aprendo l'archivio,
-- gli si sta solo lasciando suonare il campanello.
grant usage on schema caprera to supabase_auth_admin;
grant execute on function caprera.utente_nuovo() to supabase_auth_admin;
grant execute on function caprera.attiva_tessera(uuid, text) to supabase_auth_admin;
