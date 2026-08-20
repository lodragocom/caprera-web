# Comandi — cosa lanciare, e quando

## Per vedere il sito

```
cd ~/dev/caprera/caprera-web
npm run dev
```

Apre l'indirizzo che stampa in console (di solito `http://localhost:5173`).
È l'unico comando che serve nell'uso normale: **i dati sono già pronti**, non
c'è niente da rigenerare.

Per fermarlo: `Ctrl+C`.

## Serve Python?

**No, non nell'uso normale.** I file JSON che alimentano il sito sono già sul
disco e vengono aggiornati solo quando arrivano dati nuovi.

Python serve in tre casi:

### 1. È stata giocata una nuova giornata

Prendi le formazioni aggiornate da Fantapazz (le scarichiamo insieme), mettile
in `caprera-web/data-src/formazioni/`, poi:

```
cd ~/dev/caprera/caprera-web
python3 scripts/costruisci-formazioni.py    # formazioni e moduli
python3 scripts/costruisci-coppe.py         # tabelloni e albo d'oro
python3 scripts/applica-risultati.py        # classifiche e risultati
```

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
rilancia il collaudo per vedere l'effetto.

## Per pubblicare il sito

```
npm run build
```

Crea la cartella `dist/`, che è il sito pronto da caricare online.

## Se `npm run dev` non parte

Se si lamenta di pacchetti mancanti:

```
npm install
```

E se dà errori strani su moduli nativi, di solito basta ripartire pulito:

```
rm -rf node_modules package-lock.json && npm install
```
