-- Giro di viti dopo il controllo di sicurezza di Supabase.
--
-- 1. `caprera.attiva_tessera(p_utente uuid, p_email text)` era eseguibile da
--    anon e da authenticated. E' SECURITY DEFINER e prende l'utente e l'email
--    come ARGOMENTI: chi riusciva a chiamarla poteva chiedere di essere
--    abbinato alla societa' - e agli incarichi - intestati all'email di un
--    altro. Non e' un buco che si e' aperto oggi, ma e' un buco.
--
--    Nessuno la chiama da fuori: la chiamano il trigger di registrazione e
--    `public.attiva_la_mia_tessera()`, che passa `auth.uid()` e legge l'email
--    da `auth.users` invece di credere a chi chiede. Sono entrambe DEFINER,
--    quindi continuano a funzionare senza questo permesso.
revoke execute on function caprera.attiva_tessera(uuid, text) from anon, authenticated, public;
revoke execute on function caprera.utente_nuovo() from anon, authenticated, public;
revoke execute on function caprera.tessera_nuova() from anon, authenticated, public;

-- 2. Le due funzioni che scrivono per conto del mister controllano gia'
--    `auth.uid()` e senza sessione non fanno niente. Ma chi non e' entrato non
--    ha motivo di poterle nemmeno chiamare.
revoke execute on function public.salva_la_mia_scheda(text, text, text, text, text) from anon;
revoke execute on function public.attiva_la_mia_tessera() from anon;

-- 3. Tessere, schede e assegnazioni sono dati di persone. Al pubblico
--    rispondevano "zero righe" - le regole di riga facevano il loro mestiere -
--    ma comparivano lo stesso nell'elenco di cosa esiste. Ora non compaiono.
revoke select on caprera.tessere, caprera.schede, caprera.assegnazioni from anon;

-- 4. Due funzioni di trigger senza `search_path` fisso: con uno schema
--    ostile davanti si puo' dirottare a quale tabella si riferisce un nome.
alter function caprera.tocca_scheda() set search_path = caprera, public;
alter function caprera.normalizza_email() set search_path = caprera, public;

-- 5. `public.contratti_pubblici` e' l'unica vista volutamente NON invoker, e
--    il controllo automatico la segnala come errore ogni volta. Resta com'e':
--    e' la finestra che mostra a tutti chi e' sotto contratto e fino a quando,
--    e l'unico modo di farlo e' leggere con i permessi del database, perche'
--    `caprera.contratti` al pubblico e' chiusa. Le colonne sono elencate a
--    mano e `ingaggio` e `clausola` non ci sono: i soldi veri restano
--    nell'area riservata. Chi la "sistema" mettendo security_invoker spegne
--    la pagina Contratti; chi ci aggiunge una colonna pubblica gli stipendi.
comment on view public.contratti_pubblici is
  'DELIBERATAMENTE security_invoker=off: mostra al pubblico durata e scadenza '
  'dei contratti leggendo caprera.contratti, che al pubblico e'' chiusa. '
  'NON aggiungere ingaggio o clausola: i soldi veri stanno solo nell''area '
  'riservata. Vedi migrazione caprera_stringi_i_permessi.';
