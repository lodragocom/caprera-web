# Federazione Caprera — sito web

Frontend in **React + Vite** (JavaScript) per la Lega Caprera: classifiche,
risultati, schede società, rose storiche e la dashboard statistica R Shiny.

I dati sono **JSON statici** generati dai file Excel/CSV della Federazione:
nessun backend da avviare, il sito è deployabile come pure static.

## Avvio

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # output in dist/
npm run preview  # anteprima della build
```

## Struttura

```
scripts/build-data.py   conversione Excel/CSV -> JSON (da rilanciare a ogni aggiornamento dati)
public/logos/           stemmi in WebP (512px, ottimizzati da ~16 MB a ~530 KB)
src/
  data/*.json           dati generati — NON editare a mano
  lib/core.js           anagrafica squadre, classifiche, riepilogo (bundle iniziale)
  lib/data.js           calendario e rose (~560 KB, solo rotte lazy)
  components/           Layout, TeamBadge
  pages/                Home, Classifica, Risultati, Squadre, SquadraDetail, Rose, Statistiche
  styles/theme.css      design system (navy + oro, dallo stemma della lega)
```

## Aggiornare i dati

I sorgenti stanno in `06_caprera_project/`. Lo script legge:

| File | Cosa contiene |
|---|---|
| `calendario.xls` | calendario e risultati, 2016-17 → 2025-26 (è un CSV incapsulato in una colonna Excel) |
| `tabella_rose_per_stagione(1).csv` | rose storiche con costo, presenze, MV e fantamedia |
| `Listone_Fantapazz.csv` | quotazioni Fantapazz correnti |

Poi:

```bash
python3 scripts/build-data.py
npm run build
```

Se il percorso dei sorgenti cambia, aggiorna la costante `SRC` in cima allo script.

### Nomi delle società

Le società cambiano nome quasi ogni anno (Smit ne cambia uno a stagione), quindi
`build-data.py` normalizza 28 varianti storiche su 10 id canonici tramite la
tabella `TEAMS`. Per aggiungere un nome nuovo basta inserirlo negli `aliases`
della squadra corrispondente.

**Da verificare:** la catena storica di due società è stata dedotta dagli slot
per stagione, non da una fonte esplicita:

- `TARGARYEN` → `La Casata dei Draghi` → `Hokuto` → `Real Militum` → **Roburro**
- `FCZ` → `Smit TrasCapitano` → … → **Smit Gaspacho**

Se una delle due è sbagliata, correggi gli `aliases` e rilancia lo script.

## Dati mancanti

- Le **rose 2025-26** non sono ancora nei sorgenti (`tabella_rose_per_stagione`
  si ferma al 2024-25). Il calendario 2025-26 c'è ma senza risultati.
- **Contratti, clausole rescissorie e slot** del Jobs Act non esistono in forma
  strutturata: servirebbe un file dedicato per mostrarli nel sito.
- Coppa Italia, CL/EL/Conference e Supercoppe non sono nel calendario:
  le classifiche riguardano il solo campionato.

## Deploy

Build statica: `dist/` va bene su Vercel, Netlify, GitHub Pages o dentro il
WordPress attuale. Per il routing client-side serve un rewrite di tutte le
richieste su `index.html` (`vercel.json`, `_redirects` o `.htaccess`).

Se il sito non sta in root, imposta `base` in `vite.config.js`: il codice usa
`import.meta.env.BASE_URL` per logo e router, quindi si adatta da solo.

## Note

- I font (Bebas Neue, Inter, Roboto Mono) arrivano da Google Fonts. Per un
  deploy senza dipendenze esterne, scaricali in `public/fonts` e sostituisci
  l'`@import` in `src/styles/theme.css`.
- La pagina Statistiche incorpora `caprera.shinyapps.io` in un iframe. Su piano
  gratuito shinyapps mette l'app in stand-by: il primo caricamento è lento.
