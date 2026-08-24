# 2026-08-23 · i due listoni di partenza ritrovati sono in archivio

> Sessione che lavora sul codice. L0 lo chiedeva **da giorni** e io continuavo a scriverlo fra le
> cose aperte invece di farlo. Questo rapporto chiude il §1 della consegna `i-file-ritrovati`.

**Stato:** caricati, provati, in produzione. Collaudo sito e collaudo area passano.

---

## Cosa è entrato

| | file | righe | club |
|---|---|---:|---:|
| **2020-21** | `06_caprera_project/Caprera 20-21/Listone_Fantapazz.xlsx` | **691** | 20 |
| **2024-25** | `06_caprera_project/01_season_24_25/Listone_Fantapazz.csv` | **715** | 20 |

Adesso **tre** stagioni hanno tutti e due i listoni: 2020-21, 2024-25, 2025-26.

## Perché sono di partenza, e non un altro export

Quattro prove, tutte controllabili:

1. **La data del file.** 7 ottobre 2020 e 9 settembre 2024 — subito dopo la chiusura del mercato,
   cioè quando Fantapazz ripubblica il listone e quando si fa l'asta.
2. **Zero quotazioni a zero.** I file di fine stagione ne hanno da 119 a 222 (chi nel frattempo ha
   lasciato la Serie A). Questi ne hanno **zero**.
3. **I club sono quelli giusti di quella stagione.** Il 2020-21 ha Benevento, Crotone e Spezia; il
   2024-25 ha Como, Empoli, Monza, Parma e Venezia. Venti squadre esatte, non ventiquattro.
4. **Sono davvero un'altra data.** Confronto col listone di fine della stessa stagione: solo
   **268 prezzi su 693** identici nel 2020-21, scarto medio 2,26. È la stessa forma del 2025-26
   (226 su 680, scarto 3,13), che è una coppia partenza-fine certa.

E il contenuto lo conferma da sé: nel 2020-21 c'è Ronaldo alla Juventus a 53, Ibrahimović al Milan,
Osimhen appena arrivato al Napoli, Hakimi all'Inter.

**Copertura sulle rose:** 96,0% (2020-21) e 93,2% (2024-25) — più alta del 2025-26, che è
90,6% e che avevamo già accettato. Quello che manca sono gli acquisti di gennaio, che a settembre
non erano sul listone: è esattamente quello che ci si aspetta.

⚠️ Lo script `carica-listoni.py` avverte «per queste stagioni vince un listone che non è il suo».
**In questo caso è un falso allarme**: confronta ogni rosa con *tutti* i listoni disponibili, e
avendogliene dato uno solo per volta quello vince ovunque per mancanza di avversari.

## Il club, qui, si carica

I file della cartella `Listoni/` hanno la squadra di *adesso*, quindi si caricano con `club` a
`null`. **Questi due no**: hanno la colonna giusta della loro stagione, ed è per questo che la
consegna li segnalava a parte. Restano senza club solo i giocatori che a quella data non erano in
Serie A — 116 nel 2020-21 (Castagne al Leicester, Florenzi al PSG, De Sciglio al Lione), 111 nel
2024-25. Anche quello è un dato, non un buco.

*Dichiarato come scavalcamento, non come prassi* — stessa nota delle altre due volte.

## Il difetto vero che questa richiesta ha scoperto

La scheda diceva: *«Nel 2025-26, **l'unica stagione** che ha tutti e due i listoni…»*.

Dal momento del caricamento quella frase è **falsa**, e non rompe niente. Nessun errore, nessuna
pagina vuota, collaudo verde — solo una riga che dice una cosa sbagliata a chiunque la legga. È il
difetto peggiore che ci sia, perché non lo trova nessuno.

Ed era la seconda volta in due giorni: ieri avevo scritto «Simeone vale 30 alla fine» leggendolo
dal file invece che dall'archivio.

**La correzione non è cambiare la frase.** È togliere dalla pagina l'elenco delle stagioni:

- migrazione **`caprera_listone_quali_momenti`** (la 42ª) → vista `public.listone_momenti`,
  dodici righe, `select distinct stagione, momento`;
- `momentiDelListone()` in `archivio.js`;
- la scheda adesso scrive *«2020-21, 2024-25 e 2025-26»* perché è l'archivio a dirglielo;
- e **il collaudo confronta le due cose**: legge dalla vista quali stagioni hanno il listone di
  partenza, apre una stagione che non ce l'ha, e controlla che la pagina le nomini **tutte** e non
  ne nomini **nessuna in più**.

```
stagioni coi due listoni · archivio: 2020-21, 2024-25 e 2025-26 · nominate in pagina: tutte
```

Se domani ne entra una quarta e qualcuno dimentica di aggiornare la pagina, non serve che se ne
accorga: non c'è più niente da aggiornare.

## Cosa si vede adesso

La scheda del confronto compare su tre stagioni invece di una.

| | quotati | a settembre | a maggio | |
|---|---:|---:|---:|---:|
| Prosecco 2025-26 | 28 | 284 | 359 | **+75** |
| Prosecco 2024-25 | 28 | 364 | 402 | **+38** |
| Prosecco 2020-21 | 27 | 401 | 468 | **+67** |

Nel 2020-21: Raspadori `11 → 22`, Darmian `9 → 19`, Demme `10 → 17`; dall'altra parte Kulusevski
`31 → 21`, Koulibaly `19 → 15`.

## File toccati

- `src/lib/archivio.js` — `momentiDelListone()`
- `src/pages/area/sezioni.jsx` — le due schede non nominano più stagioni a mano; `elenco()`
- `collaudo/collaudo-area.mjs` — il controllo sulle stagioni nominate
- `caprera-dati/SUPABASE/06-listone-momenti.sql` — nuovo

## Resta aperto

Il **2015-16** nella cartella `Listoni/` non è una stagione della Caprera: resta fuori, ed è
giusto così. Non manca più nessun listone.
