# Collegamento privato Fantapazz su Cloudflare

Preparato per la lega 342460. **Non ancora distribuito o collegato.**
Il sito `caprera-web` e la sua configurazione Cloudflare restano separati.
Questo servizio prova la riutilizzabilità dell'accesso; non importa dati, non
contiene credenziali Supabase, non consegna/calcola formazioni e non ha cron.

## Flusso da attivare dopo autorizzazione

1. Configurare nel nuovo Worker due segreti casuali indipendenti di 32 byte,
   espressi come 64 cifre esadecimali: `CONTROL_TOKEN` e `SESSION_KEY`.
   Non inserire valori in Git, URL, query string, log o frontend React.
2. Distribuire questa directory con Wrangler autenticato sull'account della
   Federazione. Il manifest crea soltanto questo Worker, il binding Browser
   Run e un Durable Object privato. Nessun binding a DB o sito pubblico.
3. Aprire una sessione Cloudflare Live View senza registrazione e accedere a
   Fantapazz. Aprire la pagina G5 già verificata (`PROBE_URL` nel codice).
4. Dopo autorizzazione alla conservazione, inviare `POST /connect` con
   `Content-Type: application/json`, `Authorization: Bearer CONTROL_TOKEN`
   e corpo `{ "sessionId": "ID_SESSIONE_CLOUDFLARE" }`.
   Il servizio controlla i contenuti sportivi, conserva solo cookie del dominio
   Fantapazz cifrati AES-GCM, con scadenza dopo 30 giorni senza accessi riusciti.
   Ogni prova riuscita rinnova il termine; revoca/logout Fantapazz prevalgono.
   Non conserva password e non estrae cookie dal Chrome locale. Non restituisce mai cookie o token.
5. `POST /probe` deve riuscire: avvia un browser nuovo, ripristina l'accesso,
   verifica 5 incontri/10 formazioni e chiude il browser. Solo questo prova il
   riuso indipendente dalla sessione manuale. Max 3 prove/giorno UTC; nessuna
   esecuzione automatica. Anche altri browser manuali consumano la quota Free.
6. `GET /status` espone soltanto esito/scadenza/conteggi, sempre autenticato.
   `POST /disconnect` rimuove l'accesso memorizzato. La scadenza per inattività lo elimina
   tramite alarm; un logout lato Fantapazz può invalidarlo prima.

Le risposte di errore non riportano testo delle pagine o errori Puppeteer.
La chiave di cifratura vive nei Workers Secrets, il contenuto cifrato nello
storage privato del Durable Object. La cifratura non limita ciò che può fare
un operatore Cloudflare autorizzato ad accedere a codice e segreti.

## Verifiche locali

`npm ci`, `npm test`, `npm run check`. Il check produce soltanto un bundle
locale con `wrangler deploy --dry-run`; non è un deploy né una prova del login.
I test usano un browser simulato, non avviano un browser locale o remoto.

Verifica del 18/10: 15 test passati; bundle Wrangler riuscito (136,93 KiB gzip).
Versioni fissate: Puppeteer Cloudflare 1.4.0 e Wrangler 4.151.1. `npm audit`
segnala 7 avvisi high nella catena del downloader Node (`extract-zip`, FTP e
proxy). Il metafile della build conferma che quei moduli non entrano nel Worker;
non vengono usati per scaricare o eseguire browser locali. Gli avvisi a livello
di dipendenze rimangono aperti: non è stato eseguito il downgrade proposto da
`npm audit fix --force`. Non riutilizzare il pacchetto per download ZIP/FTP.

Prima di pianificare servono ancora acquisizione completa (calendari, gironi,
classifiche e nuove giornate), conservazione delle fonti e integrazione con
l'import incrementale transazionale. Un login valido non certifica l'intera
pipeline. Non riutilizzare la connessione amministrativa locale al DB come
segreto del Worker: il percorso di import server richiede privilegi limitati.

Frequenza richiesta: martedì. Orario proposto: 09:00 Europe/Rome, inclusa ora
legale. Nessun cron è attivo: il futuro job dovrà eseguire acquisizione e import
completi, non soltanto `/probe`. La proposta iniziale di scadenza fissa a sette
giorni è stata sostituita per evitare un nuovo login a ogni aggiornamento
settimanale; il consenso alla conservazione è ancora da acquisire.

Riferimenti: [Puppeteer Cloudflare](https://developers.cloudflare.com/browser-run/puppeteer/),
[riuso sessioni](https://developers.cloudflare.com/browser-run/features/reuse-sessions/).
