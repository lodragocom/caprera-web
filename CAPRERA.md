# Caprera — istruzioni per gli agenti

Sito della Federazione Caprera: **React 19 + Vite 8 + React Router 7**, CSS a mano
(`src/styles/theme.css`, navy e oro dallo stemma), animazioni con `motion`
(vocabolario in `src/components/moto.jsx`). I dati arrivano da **Supabase**
(Postgres 17), letti a runtime: `src/data/*.json` non è più la fonte del sito.
Comandi in [COMANDI.md](COMANDI.md), struttura in [README.md](README.md).

## Dove sta l'archivio

Progetto Supabase **`caprera`** (`ziggietzdtdtpsfmpthm`), eu-central-2. Schema **`caprera`**:
26 tabelle, 10 viste, 10 funzioni, 28 regole di riga.

⚠️ **Attenzione:** `01/02/03.sql` sono **lo schema iniziale del 20/08**, non lo stato di adesso.
Lo schema vero e' in **38 migrazioni** che stanno nella cronologia di Supabase e **non nel
repository** (`supabase/migrations/` non esiste). Chi clona non ricrea il database. Non dare mai
per scontato che un `.sql` del repo descriva la produzione: **verifica**. Esportarle e' il punto
#1 dello STATO.

Il sito **non legge lo schema `caprera`**: legge **`public`**, dove ci sono **39 finestre sottili**
(`security_invoker`, quindi le regole di riga restano quelle di sotto). È una scelta messa a
verbale — `../caprera-dati/ADR/ADR-002-Vetrina-Public-Viste-Sottili.md`: l'alternativa era
esporre lo schema `caprera` con una **spunta nel cruscotto Supabase**, e una spunta non si
versiona.

- Materiale del database: `../caprera-dati/SUPABASE/` (`01-schema.sql`, `02-viste.sql`,
  `03-sicurezza.sql`, `carica.py`, `carica.sh`). Ragionamento in
  `../caprera-dati/SPIEGAZIONI/SPIEGAZIONE_Schema_Supabase.md`.
- Ricaricare i dati: `sh ../caprera-dati/SUPABASE/carica.sh`. La stringa di connessione sta in
  `~/.caprera-dsn` (**Session pooler** — la connessione diretta è solo IPv6).
- Lo schema **`vecchio_progetto`** (tentativo di settembre 2025) è stato **cancellato il 21/08**,
  dopo che ci si erano trovate dentro due falle di sicurezza. Le quattro tabelle compilate a mano
  — i 48 alias di nomi inclusi — sono salvate in
  `../caprera-dati/FONTI/vecchio-progetto-cose-fatte-a-mano.json`. Restano 6 utenti di prova in `auth`.

## Cosa non deve mai affacciarsi in `public`

**Contratti, finanze e mister non hanno finestra.** Nessuna vista pubblica su clausole,
ingaggi, crediti, bilanci o anagrafiche dei mister. L'unica eccezione è
**`public.contratti_pubblici`**: i contratti **senza** clausola e **senza** ingaggio.

Aprire una finestra nuova in `public` è una decisione, non un'aggiunta: passa dal
Direttore Sportivo e si scrive in `02-viste.sql`, mai a mano dal cruscotto.

## Regole del progetto

- Le regole della lega stanno in `../caprera-dati/REGOLE/regole-caprera.json`, **non nel
  codice** — inclusi gli importi dei premi in crediti, che una vista legge da `lega.regole`.
- Niente Tailwind, niente librerie UI, niente librerie di grafici: CSS a mano e hook nativi.
  Una dipendenza nuova è una decisione (Direttore Sportivo). Oggi ce ne sono due oltre a React
  e al router: `@supabase/supabase-js` e `motion`.
- Le interrogazioni al database stanno **tutte** in `src/lib/archivio.js` (con l'hook
  `useArchivio`); il client in `src/lib/supabase.js`. Le pagine non parlano con Supabase da sole.
- Configurazione in `.env`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Modello in
  `.env.esempio`. La chiave `service_role` **non entra mai** in questo repo.
- **La riservatezza non la fanno le pagine: la fanno le regole di riga.** Il sito chiede, il
  database risponde solo ciò che quel mister ha diritto di leggere. Una pagina scritta male può
  al massimo **non mostrare** qualcosa — non può mostrare i contratti di un altro. Non
  reintrodurre filtri "di sicurezza" lato React: sarebbero finti.
- **L'accesso è la Tessera del Tifoso** (`src/lib/auth.jsx`, ADR-003): email di Fantapazz +
  password. **La società non si sceglie** — la assegna la Presidenza intestando una tessera a
  quell'email, anche prima che la persona esista. Chi entra senza tessera ha un account e nessuna
  società: **non è un errore e la pagina non deve farlo sembrare tale**.
- **L'attivazione della tessera non può mai far fallire una registrazione.** È la regola nata da
  tre guasti reali (ADR-003). La rete di sicurezza è `attiva_la_mia_tessera`, che ritenta il
  collegamento dopo l'accesso: se tocchi quel percorso, non toglierla.
- `src/data/*.json` resta sul disco come **sorgente del caricamento** (`carica.py`) e riferimento
  di collaudo, non come fonte del sito. Continua a non editarsi a mano.
- **Codice morto**: `src/lib/data.js` è stato cancellato il 21/08. Restano `src/pages/AreaMister.jsx`
  e il suo `.css`, non più importati da nessuna rotta: **non riusarli**.
- Prima di dire che qualcosa funziona: `npm run lint`, `npm run build` e i **tre** collaudi
  browser in `collaudo/`.

## I collaudi

In [collaudo/](collaudo/), tre script che aprono il sito con un browser vero:

- `collaudo-sito.mjs` — pagine pubbliche, bottoni stagione/giornata, menu, link seguiti davvero.
- `collaudo-area.mjs` — area mister, navigazione dalla sidebar.
- `finto-supabase.mjs` — un finto PostgREST davanti a un Postgres locale: prova le pagine che
  leggono dal database **senza rete verso Supabase**.

Servono perché un errore JS lascia la pagina mezza vuota senza segnalare nulla — è già capitato
con Coppe.

Accanto c'è **`classifica-contro-i-file.mjs`**, che non è un collaudo ma la verifica del
passaggio: apre la Classifica, gira tutte e dieci le stagioni e confronta **ogni riga** con
`src/data/standings.json`. Il principio, da tenere per qualunque migrazione futura: **se un
numero cambia passando dai file al database è un errore, non un miglioramento.**

## Lo staff

Otto membri in [.claude/agents/](.claude/agents/) più un ruolo speciale fuori quadro. Ognuno ha
tre dimensioni: il **ruolo** con cui lo chiami, l'**archetipo mitologico** (le linee guida) e un
**volto italiano** del calcio (il carattere operativo). Si invocano col ruolo:

`direttore-sportivo` (Dedalo / Marotta) · `curatore` (Atena / Baggio) ·
`magazziniere` (Efesto / Gattuso) · `analista` (Talos / Pirlo) ·
`preparatore` (Apollo / Cannavaro) · `segretario` (Mnemosine / Zoff) ·
`addetto-stampa` (Calliope / Quagliarella) · `team-manager` (Ermes / Totti) ·
`tutela-lega` (Urano / Mazzarri — crisi e proteste, fuori quadro)

Chi fa cosa e gli handoff: [.processo/AGENTI.md](.processo/AGENTI.md).
Come funziona **Il Processo di Caprera** e la regola di fine sessione (la moviola):
[.processo/FRAMEWORK.md](.processo/FRAMEWORK.md).

La verità del progetto sta in `../caprera-dati/STATO_PROGETTO_Caprera.md` — **leggilo prima di proporre**.
