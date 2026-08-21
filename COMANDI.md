# Comandi — cosa lanciare, e quando

## Per vedere il sito

```
cd ~/dev/caprera/caprera-web
npm run dev
```

Apre l'indirizzo che stampa in console (di solito `http://localhost:5173`).
È l'unico comando che serve nell'uso normale.

Serve però che `.env` esista, perché **il sito legge da Supabase**: copia
`.env.esempio` in `.env` e riempi `VITE_SUPABASE_URL` e
`VITE_SUPABASE_ANON_KEY` (cruscotto Supabase → Project Settings → API).
Senza quei due valori le pagine si aprono vuote.

Per fermarlo: `Ctrl+C`.

## Da dove arrivano i dati

Dal database, non più dai file. Progetto Supabase `caprera`
(`ziggietzdtdtpsfmpthm`), schema `caprera`; il sito interroga le viste in
`public`. I JSON in `src/data/` sono rimasti sul disco, ma sono **il materiale
che si carica nel database** e il riferimento con cui si controlla che i conti
tornino — non è più da lì che il sito legge.

### Ricaricare il database

```
sh ~/dev/caprera/caprera-dati/SUPABASE/carica.sh
```

La stringa di connessione la prende da `~/.caprera-dsn`, che deve contenere il
**Session pooler** e non la connessione diretta (quella risponde solo su IPv6).
È lo stesso comando che servirà quando arriveranno i dati di Guido.

Dettagli, e come provare tutto su un Postgres locale senza toccare Supabase:
`caprera-dati/SUPABASE/README.md`.

## Serve Python?

**No, non nell'uso normale.** Serve in tre casi:

### 1. È stata giocata una nuova giornata

Prendi le formazioni aggiornate da Fantapazz (le scarichiamo insieme), mettile
in `caprera-web/data-src/formazioni/`, poi:

```
cd ~/dev/caprera/caprera-web
python3 scripts/costruisci-formazioni.py    # formazioni e moduli
python3 scripts/costruisci-coppe.py         # tabelloni e albo d'oro
python3 scripts/applica-risultati.py        # classifiche e risultati
```

Questi rigenerano i JSON. **Poi va rilanciato `carica.sh`**, altrimenti il sito
continua a mostrare quello che c'è nel database.

### 2. Vuoi ricontrollare che i conti tornino

```
cd ~/dev/caprera
python3 caprera-dati/PROGRAMMI/collaudo-motore.py caprera-web/src/data/lineups
python3 caprera-dati/PROGRAMMI/verifica-regolamento.py
```

Il primo rifà i calcoli di dieci stagioni e dice quante volte il motore ottiene
gli stessi numeri di Fantapazz. Il secondo controlla le regole che non
riguardano il calcolo: schemi ammessi, partecipanti alle coppe, gironi.

Non modificano niente: leggono e basta.

### 3. È cambiata una regola

Si modifica `caprera-dati/REGOLE/regole-caprera.json` — non il codice — e si
rilancia il collaudo per vedere l'effetto. Le regole stanno **anche** nel
database (tabella `lega.regole`, da cui una vista ricava i premi in crediti):
dopo una modifica va rilanciato `carica.sh`.

## Prima di dire che funziona

```
npm run lint
npm run build
```

Poi i collaudi browser — sono **tre**, e il terzo sta nel blocco dopo:

```
npx vite preview --port 4180 &
node collaudo/collaudo-sito.mjs
node collaudo/collaudo-area.mjs
```

E, per provare le pagine che leggono dal database senza rete verso Supabase:

```
node collaudo/finto-supabase.mjs &
# in .env, temporaneamente: VITE_SUPABASE_URL=http://localhost:5410
```

Spiegazione completa in `collaudo/README.md`.

## Per pubblicare il sito

```
npm run build
```

Crea la cartella `dist/`, che è il sito pronto da caricare online (~892 KB).
L'hosting è deciso — Cloudflare Pages, `caprera-dati/ADR/ADR-001-Hosting-Cloudflare.md` —
ma non ancora eseguito.

## Se `npm run dev` non parte

Se si lamenta di pacchetti mancanti:

```
npm install
```

E se dà errori strani su moduli nativi, di solito basta ripartire pulito:

```
rm -rf node_modules package-lock.json && npm install
```

Se invece parte ma le pagine sono vuote, il problema quasi sempre è `.env`:
manca, o le due variabili `VITE_SUPABASE_*` sono sbagliate.
