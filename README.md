# Federazione Caprera — sito web

Sito e area riservata della Lega Caprera: dieci stagioni di campionato, coppe,
rose, contratti e crediti. **React 19 + Vite 8**, JavaScript.

I dati stanno su **Supabase** (Postgres). Il sito non ha un backend proprio:
parla direttamente col database, e chi vede cosa lo decidono le regole di riga
del database, non queste pagine. Lo schema e il caricamento stanno nell'altro
repository, `caprera-dati`.

## Avvio

```bash
npm install
cp .env.esempio .env     # e riempi le due righe
npm run dev              # http://localhost:5173
npm run build            # output in dist/
npm run preview
```

`.env` vuole due valori, presi da Supabase → Project Settings → API:

```
VITE_SUPABASE_URL=https://<progetto>.supabase.co
VITE_SUPABASE_ANON_KEY=<la chiave pubblicabile>
```

La chiave `anon` è fatta per stare dentro una pagina web e da sola non apre
niente: senza tessera si leggono partite, classifiche e formazioni, mentre
contratti e crediti restano chiusi. `.env` è comunque in `.gitignore`.

## Com'è fatto

```
src/
  lib/supabase.js     il collegamento; legge lo schema `public`
  lib/archivio.js     TUTTE le letture dal database, piu' la cache di visita
  lib/auth.jsx        la Tessera del Tifoso: chi sei, per quale societa', con quali incarichi
  lib/coppe.js        logica pura dei tabelloni (chi passa il turno, e perche')
  lib/formazioni.js   formazioni e bonus
  lib/core.js         anagrafica societa' e stemmi — l'unica cosa ancora su file
  components/moto.jsx il vocabolario del movimento (vedi sotto)
  pages/              il sito pubblico
  pages/area/         la dashboard del mister
  styles/theme.css    navy e oro, dallo stemma della lega
public/logos/         stemmi in WebP
collaudo/             il banco di prova (vedi collaudo/README.md)
scripts/              conversione dei file storici -> JSON -> database (roba di una volta sola)
data-src/             i file originali della Federazione
```

### L'archivio

Le pagine non sanno che esiste Supabase: chiedono "la classifica del 2025-26" e
ricevono righe. `archivio.js` si impone tre regole, scritte in cima al file:
si chiede solo quello che serve, si chiede una volta sola per visita, e non si
mente mai sul non sapere — se il database non risponde la pagina lo dice, non
finge un archivio vuoto.

Lo schema vero è `caprera`; il sito legge da `public`, dove ogni tabella si
affaccia con una vista sottile in `security_invoker`. Il motivo è pratico:
l'API di Supabase serve solo gli schemi elencati in un'impostazione del
cruscotto, e una spunta in un pannello non si versiona. Le viste sì.

### La Tessera del Tifoso

Il mister entra con l'email di Fantapazz e una password che sceglie lui. La
società non la sceglie: gliela ha già assegnata la Presidenza, emettendo una
tessera intestata a quell'email.

Gli **incarichi** (Presidenza, Tesoriere, Direttore Mercato, Giudice Sportivo,
Addetto Stampa, Mister) sono righe di tabella, non `if` nel codice: due colonne,
`vede_tutto` e `puo_scrivere`, e sono le stesse su cui il database ha scritto le
regole di riga. Il sito le legge per decidere cosa mostrare, mai cosa permettere.

`/area/tessera` è la sola pagina dove il mister scrive: nome, cognome,
soprannome, telefono, link della videochiamata dell'asta, password. Società e
incarichi si vedono ma non si toccano — e non è una gentilezza di quella pagina,
è che il database non glielo lascia fare.

### Il movimento

`components/moto.jsx` è il vocabolario, e ha tre regole: il movimento spiega,
non decora; niente dura più di 400 ms; `prefers-reduced-motion` è sempre
rispettato. Le pagine usano `Pagina`, `Cascata`, `Voce`, `Riga`, `Numero`,
`Scheletro`, `Sezione` invece di inventarsi animazioni per conto proprio.

## Prima di spedire

Non spedire una pagina che non hai visto girare. La pagina Coppe è morta una
volta per una riga che leggeva un punteggio complessivo dove non c'era, e a
occhio sembrava solo che i link non rispondessero.

```bash
npm run build
npx vite preview --port 4180 &
node collaudo/collaudo-sito.mjs     # tutto il sito pubblico
node collaudo/collaudo-area.mjs     # accesso, dashboard, tessera
```

I collaudi girano contro un **finto Supabase** (`collaudo/finto-supabase.mjs`),
che parla il minimo dialetto di PostgREST usato davvero e ha davanti un Postgres
locale con lo stesso archivio. `collaudo/README.md` spiega come si accende.

## Deploy

Build statica: `dist/` va su Vercel, Netlify o GitHub Pages. Serve un rewrite di
tutte le richieste su `index.html` per il routing client-side. Se il sito non sta
in root, imposta `base` in `vite.config.js`: il codice usa
`import.meta.env.BASE_URL` per stemmi e router, quindi si adatta da solo.

Le variabili `VITE_*` vanno impostate anche sull'host: finiscono dentro il
bundle al momento della build, non vengono lette a runtime.

## Cose ancora aperte

- I contratti veri di Guido (358 righe con clausole e ingaggi) non sono ancora
  caricati.
- 111 righe di rosa su 2.999 non sono agganciate a un calciatore del listone.
- La tabella dei punti Ranking Caprera non è nel regolamento in PDF.
- Le email di conferma partono dal mittente di Supabase: manca l'SMTP della
  Federazione.
- La pagina Statistiche incorpora `caprera.shinyapps.io` in un iframe. Sul piano
  gratuito l'app va in stand-by e il primo caricamento è lento.
