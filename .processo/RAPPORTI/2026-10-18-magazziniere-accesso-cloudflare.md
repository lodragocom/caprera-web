# 18 ottobre — Accesso Fantapazz dal server

Il login eseguito dall'utente in Cloudflare Live View è verificato: account
Febreeze, Campionato giornata 5 Caprera, giornata 7 Serie A. Il blocco di accesso
anonimo è risolto per quella sessione temporanea. Non prova la persistenza.

Preparato in `workers/fantapazz/` un connettore separato dal sito: adozione
esplicita di una sessione remota, cookie solo Fantapazz cifrati AES-GCM con
Workers Secret, massimo sette giorni, stato privato e prova in browser nuovo.
Nessuna password, nessun cookie Chrome locale, nessun accesso DB, cron o
scrittura su Fantapazz. Endpoint con token, errori senza dati sensibili e
massimo tre prove/giorno UTC. Non distribuito e nessuna sessione memorizzata.

14 test isolati e bundle Wrangler dry-run passati. Le sette segnalazioni npm
del downloader ZIP/FTP non sono risolte upstream; metafile verificato, nessuno
dei moduli interessati entra nel bundle Worker. Versioni fissate nel lockfile.
Non avviato alcun browser via CLI durante i collaudi.

Prima dell'attivazione serve autorizzare l'accesso persistente del servizio;
la scelta dell'account non viene interpretata come consenso a conservarne i
cookie. L'acquisizione completa e l'import server restano passi successivi.

**Pattern:** un login remoto riuscito prova la raggiungibilità, non l'accesso
riutilizzabile; quest'ultimo va collaudato avviando un browser nuovo.
