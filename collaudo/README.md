# Collaudo del sito

## Rose attuali e storico Shiny

`node collaudo/collaudo-rose-storico.mjs` usa la fonte privata e API simulate:
3.193 righe, filtri, dodici colonne, storico, dati mancanti, assenze, isolamento
dei dettagli contrattuali, errori RPC e mobile. Nessuna scrittura al database.
`node collaudo/rose-storico-permessi.mjs` verifica i permessi del database reale
in transazione di sola lettura sempre annullata, senza stampare identità.

## Consegna delle formazioni

- `node --test collaudo/consegna-regole.test.mjs`: validazione titolari, modulo e panchina.
- `node collaudo/consegna-database.mjs`: test SQL su cluster temporaneo dedicato
  (`/tmp`, porta 55439, utente `caprera`), senza credenziali di produzione.
- `node collaudo/collaudo-schiera.mjs`: browser contro il sito locale sulla
  porta 4180, con auth e RPC simulate. Verifica invio, ordine panchina,
  rilettura, conflitti, scadenza e vista telefono.

Attivazione: `../caprera-dati/PROTOCOLLI/PROTOCOLLO_Consegna_Formazioni.md`.

## Provare le pagine che leggono dal database

`finto-supabase.mjs` è un finto Supabase: parla il minimo dialetto di
PostgREST che il sito usa davvero, e davanti ha un Postgres locale con lo
stesso archivio. Serve a provare le pagine che leggono dal database senza
toccare quello vero — e senza doverlo raggiungere.

    node collaudo/finto-supabase.mjs &
    # in .env, temporaneamente:
    #   VITE_SUPABASE_URL=http://localhost:5410
    npm run build && npx vite preview --port 4180 &
    node collaudo/classifica-contro-i-file.mjs

`classifica-contro-i-file.mjs` apre la Classifica, gira tutte e dieci le
stagioni e confronta **ogni riga** con `src/data/standings.json`. Se un numero
cambia passando dai file al database, è un errore e non un miglioramento.

Due difetti trovati così, che a occhio non si sarebbero visti: la cache dello
strato dati si incartava su sé stessa e restituiva `undefined`, e i numeri
animati sotto la piega dello schermo restavano a **zero** finché non ci si
scorreva sopra.


Due script che aprono il sito con un browser vero e provano a romperlo.

Servono perche' un errore JavaScript non si vede a occhio: la pagina resta
li' mezza vuota e i link semplicemente non rispondono. E' cosi' che si era
rotta la pagina Coppe — le sfide dei gironi non hanno un punteggio
complessivo, il codice lo leggeva lo stesso e l'intera pagina moriva.

## Come si usano

    npm run build
    npx vite preview --port 4180 &
    node collaudo/collaudo-sito.mjs
    node collaudo/collaudo-area.mjs

## Cosa controllano

`collaudo-sito.mjs` — le pagine pubbliche e le schede di tutte le societa':
apre ogni rotta, preme ogni bottone di stagione e di giornata, sceglie ogni
voce di ogni menu a tendina, poi segue davvero sette link (albo d'oro,
tabellone, bacheca, percorso, partite) e controlla di essere arrivato da
qualche parte. Segnala errori JS, pagine quasi vuote e link che non navigano.

`collaudo-area.mjs` — l'area del mister. Qui si naviga cliccando la barra
laterale e non ricaricando la pagina: la sessione sta in memoria e un
caricamento da zero riporterebbe al login (scelta voluta, vedi `src/lib/auth.jsx`).

Alla fine stampano "nessun problema" oppure l'elenco di cosa non va.
# Analisi native e Panoramica

`node --test collaudo/analisi.test.mjs collaudo/stagioni.test.mjs` verifica
matematica del campionato, bonus casa, filtri, dati mancanti e foto delle rose.
`node collaudo/collaudo-analisi.mjs` usa Playwright con tutte le API intercettate:
Panoramica, analisi private/pubbliche, Fair Play, listone/svincolati,
medie attuali, Top 11, scontri, storico, desktop e telefono. Nessuna richiesta
o scrittura al database reale. Fonti normalizzate locali necessarie nel repo dati.

`node collaudo/collaudo-performance-formazioni.mjs` verifica l'HTML normalizzato
della giornata 2 e le Performance Shiny: scelta iniziale, sostituzioni/bonus,
assenza di formazioni, paginazione API oltre 1.000 righe, filtri, confronto,
Top 11, telefono e stagioni senza dati. Richiede il server Vite di sviluppo
sulla porta 4180 (include un controllo diretto della funzione di conteggio bonus).
Auth e PostgREST sono intercettati; fonti in `../caprera-dati/FONTI/2026-27/`.

## Calendari Fantapazz

`node collaudo/collaudo-calendari-fantapazz.mjs` verifica l'app locale e la
fonte sportiva reale in sola lettura: 9 calendari, graduatorie FP, filtri,
20 riposi, accoppiamenti da definire, tabellino Mondiale, G5 senza finti
risultati, stagione attiva e mobile. Non modifica formazioni o risultati.
