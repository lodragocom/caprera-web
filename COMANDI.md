# Comandi — cosa lanciare, e quando

## Per vedere il sito

```
cd ~/dev/caprera/caprera-web
npm run dev
```

Apre l'indirizzo che stampa in console (di solito `http://localhost:5173`).
È l'unico comando che serve nell'uso normale.

Se il server è già avviato, riusare quell'indirizzo senza aprire un altro
processo: 5173 è la porta usuale di sviluppo, 4180 quella usata nei collaudi
del 18/10. Rose attuali e storico si trova in
`/area/analisi?sezione=rose-storico`, sulla stessa porta dell'app aperta.

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

Questo è un caricamento generale della vecchia pipeline. **Non usarlo per
aggiornamenti parziali o per sincronizzare Git.** Gli import correnti seguono
`../caprera-dati/PROTOCOLLI/PROTOCOLLO_Aggiornamento_Dati.md`, con prova in
rollback, migrazione dedicata e verifica dei dati preesistenti.

```
sh ~/dev/caprera/caprera-dati/SUPABASE/carica.sh
```

La stringa di connessione la prende da `~/.caprera-dsn`, che deve contenere il
**Session pooler** e non la connessione diretta (quella risponde solo su IPv6).

**Cosa non tocca** (dal 22/08): tessere, misteri, incarichi e assegnazioni —
l'identità non è archivio — le quotazioni di **fine** stagione del listone e la
tabella `movimenti`, che hanno un caricatore loro. Vengono messe da parte e
rimesse al loro posto. E il `truncate` non ha più `cascade`: se nasce una
tabella che si appoggia all'archivio e nessuno l'ha dichiarata, il caricamento
**si ferma e la nomina** invece di portarsela via.

### Caricare il registro dei crediti di Guido

```
cd ~/dev/caprera/caprera-dati/SUPABASE
python3 carica-movimenti.py --registro "../../06_caprera_project/Pagamenti - Vincite - Crediti (1).xlsx"
```

Senza `--carica` non tocca il database: legge, controlla e stampa. È il
dettaglio di `finanze.bonus` — da dove viene ogni credito.
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

> ⚠️ **Trappola da conoscere.** `npm run build` legge il `.env`, che punta al **Supabase vero**:
> una build fatta così, provata contro il finto Supabase, mostra pagine vuote e **sembra un guasto
> del sito**. Per i collaudi la build va fatta puntando al finto:
>
>     VITE_SUPABASE_URL=http://localhost:5410 VITE_SUPABASE_ANON_KEY=finto npx vite build

Spiegazione completa in `collaudo/README.md`.

## Per pubblicare il sito

```
npm run build
```

Crea la cartella `dist/`. Il primo rilascio è documentato il 30/08/2026 su
Cloudflare Worker con static assets: configurazione in `wrangler.jsonc`.
Il deploy dell'ultima versione va verificato separatamente dal push Git.
Procedura aggiornata: `../caprera-dati/PROTOCOLLI/PROTOCOLLO_Deploy_Sito.md`.

### Consegnare codice e documentazione

Nel web, dopo revisione e commit:

```
git push origin main
git push github main
```

Nel repository `caprera-dati`, dopo revisione e commit: `git push origin main`.
I dati riservati non vanno su GitHub. Verificare i tre hash remoti con
`git ls-remote <remoto> refs/heads/main` e confrontarli con il rispettivo HEAD.
Per una modifica solo documentale controllare `git diff --check`; non occorre
rilanciare import o collaudi funzionali già superati sul codice invariato.

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
