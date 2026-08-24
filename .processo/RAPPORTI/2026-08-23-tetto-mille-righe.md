# 2026-08-23 · Il tetto delle mille righe

> Le quotazioni non mancavano. Arrivavano, e venivano buttate via per strada.

---

## Cosa si vedeva

Nella «mia rosa», stagione 2025-26, la colonna **Quot.** era vuota su quasi tutti i
centrocampisti. Sembrava un buco nell'archivio — dei dati caricati a metà.

L'archivio era completo. Il listone 2025-26 sono **1.519 righe**: 680 di partenza e 839 di fine.

## Cosa succedeva davvero

Supabase risponde **al massimo con mille righe** — è un suo limite, si chiama `db-max-rows` — e
**non lo dice**. Non c'è un errore, non c'è un avviso: quello che arriva è un elenco valido, solo
più corto della verità.

Il sito chiedeva il listone intero e ne riceveva mille. E le prime mille, per come stanno in
archivio, contenevano **tutte le 839 di fine e appena 161 di partenza**:

```
nelle prime 1000 righe · partenza 161 · fine 839
in tutto               · partenza 680 · fine 839
```

Le quotazioni di settembre — quelle che servono, perché sono quelle che avevate davanti all'asta —
erano il 24% di quelle che dovevano essere. Da lì la colonna vuota.

## Perché il collaudo non l'aveva preso

**Perché il banco di prova era più permissivo della produzione.** Il finto Supabase su cui giro i
controlli rispondeva con tutte e 1.519 le righe. Sul banco tutto funzionava; in produzione no.

Questo è il difetto vero della giornata, ed è peggio di quello che ha causato. Un banco di prova
più permissivo della produzione **non è un banco di prova**: è una cosa che dice sempre di sì.

## Cosa ho corretto, in quest'ordine

**1. Il banco di prova, per primo.** Adesso applica lo stesso tetto di mille righe, risponde
`Content-Range` come il vero e restituisce `206 Partial Content` quando sta rispondendo a pezzi.
Prima di correggere il sito, ho controllato che sul banco corretto **il difetto si vedesse** — e si
vede: 1000 righe, 161 di partenza, colonna vuota.

**2. Il modo di leggere.** In `archivio.js` c'è ora `tutte()`: chiede a pezzi da mille finché non
finiscono. Una lettura grossa è completa per costruzione, non per fortuna.

**3. Le quattro letture che sfondavano il tetto** — e non era solo il listone:

| lettura | righe | cosa si rompeva |
|---|---|---|
| `listone` | fino a **1.690** per stagione | le quotazioni di settembre |
| `tutteLeRose` | **3.309** | le statistiche di sempre, sulle stagioni vecchie |
| `tuttePartite` | **2.475** | la classifica perpetua |
| `stagioniRose` | **3.309** | l'elenco delle stagioni con una rosa |

Le ultime tre non se n'era accorto nessuno perché sbagliavano **in silenzio, sui dati vecchi**:
mostravano meno di quello che c'era, e chi guardava non aveva modo di sapere quanto mancasse.

`v_marcatori` (1.877 righe) risultava a rischio: **il sito non la legge**, quindi non c'era niente
da correggere. L'ho verificato invece di correggerla a scanso di equivoci.

## Due controlli nuovi, e uno dei due vale più dell'altro

**a) La trappola del tetto** (`collaudo/tetto.mjs`). Non controlla le quattro letture che ho
sistemato oggi: controlla **la regola**, e vale anche per quelle che scriveremo domani.

> Se una risposta torna con esattamente mille righe, la stessa domanda deve chiedere anche il pezzo
> dopo. Mille righe tonde non sono un archivio: sono un tetto.

Gira su tutte e due i collaudi, guardando la rete mentre il sito naviga.

**b) La quotazione, contata riga per riga.** Il controllo che c'era prima diceva «almeno una
quotazione in pagina». Con il listone troncato le quotazioni in pagina erano **9 su 36**, e quel
controllo passava lo stesso. Una spia che si accende solo a motore fuso non è una spia. Adesso
misura la proporzione: sotto i tre quarti si ferma.

## La controprova

Non mi fido di un controllo che non ho visto fallire. Ho **rimesso il difetto**, ricostruito il
sito e rigirato:

```
col difetto:  righe 36 · con quotazione  9 · [tetto] mille righe tonde e nessun seguito: /rest/v1/listone?...
corretto:     righe 36 · con quotazione 33 · problemi: (nessuno)
```

Tutte e due le trappole scattano. Poi ho rimesso la correzione.

**Le tre righe senza quotazione su 36 non sono un difetto**: il listone è del 30 agosto e il
mercato di Serie A ha chiuso il 1º settembre. Chi è arrivato in mezzo non poteva esserci.

## I due collaudi, per intero

```
Sito   · nessun errore JS, nessuna pagina vuota, tutti i link seguiti
         letture oltre le mille righe: 5   (tutte hanno chiesto il seguito)
Area   · nessun problema
         quotazioni 2025-26 · righe 36 · con quotazione 33
         quotazioni 2019-20 · righe 30 · con quotazione 30
         quotazioni 2016-17 · righe 28 · con quotazione 28
```

## File toccati

- `src/lib/archivio.js` — `tutte()`, e le quattro letture che ora la usano
- `collaudo/finto-supabase.mjs` — il tetto, `Content-Range`, il 206
- `collaudo/tetto.mjs` — **nuovo**, la trappola
- `collaudo/collaudo-sito.mjs`, `collaudo/collaudo-area.mjs` — la trappola dentro, e la
  quotazione contata riga per riga

## Una cosa che ho corretto strada facendo

Il commento sopra `listone` diceva ancora che il listone di partenza ce l'ha **solo** il 2025-26.
Da ieri ce l'hanno anche il 2020-21 e il 2024-25. Era la stessa frase falsa di ieri, in un altro
posto: adesso rimanda a `momentiDelListone`, che lo chiede all'archivio invece di ricordarselo.

## Il prossimo

Il **2024-25**. Serve il file mercato di quella stagione — l'equivalente di
`Rose_Caprera_2025-26.xlsx`, con il foglio della rosa d'asta e quello degli svincoli. Il listone di
partenza 2024-25 è già in archivio.
