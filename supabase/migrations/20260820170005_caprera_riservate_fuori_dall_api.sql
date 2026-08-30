-- Le regole di riga gia' impediscono a un visitatore di leggere contratti e
-- crediti: senza una riga in `misteri` non c'e' societa' con cui confrontarsi
-- e la politica non lascia passare niente.
--
-- Ma il permesso di SELECT c'era lo stesso, ereditato dalla concessione in
-- blocco su tutto lo schema, e questo bastava a farle comparire nell'API
-- generata da Supabase. Una porta chiusa a chiave in una stanza che non
-- dovrebbe nemmeno essere sulla mappa: meglio toglierla dalla mappa.
revoke select on caprera.contratti from anon;
revoke select on caprera.finanze   from anon;
revoke select on caprera.misteri   from anon;

-- Anche l'utente autenticato passa dalle politiche, quindi qui il permesso
-- resta: e' cosi' che il mister vede i propri contratti e nessun altro.
