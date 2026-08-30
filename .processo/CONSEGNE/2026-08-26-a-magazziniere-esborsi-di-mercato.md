# 2026-08-26 · al Magazziniere · Il registro del mercato ha una faccia sola

> Consegna del Segretario. Verificata sul database vivo il 26/08. **Non ho scritto niente in
> `SUPABASE/` né nello schema**: sono tuoi.

**Stato:** aperta · **Sblocca:** il calcolo dei crediti d'asta 2026-27

---

## Il fatto

`caprera.movimenti` con `categoria='mercato'` registra **chi incassa, non chi paga**.

| stagione | righe | positive | negative |
|---|---:|---:|---:|
| 2023-24 | 9 | **9** | 0 |
| 2025-26 | 31 | **30** | 1 |
| 2024-25 | 20 | 16 | 4 |
| 2022-23 | 76 | 38 | 38 |

Nel 2025-26 **tutte e dieci le società incassano dal mercato e nessuna spende.** Non è un difetto di
caricamento: è la regola con cui il foglio è stato letto, e quella regola è giusta — *«la società che
il foglio nomina è quella che il giocatore ce l'aveva l'anno prima: non è chi compra, è chi lo
perde»*. Si è scritta la riga del venditore, e la riga del compratore non esiste.

## Perché blocca i crediti

La formula dei crediti (rapporto `2026-08-26-segretario-la-formula-dei-crediti.md`, verificata 10/10
su tre stagioni) è:

```
crediti(N+1) = 250 + ceil(non_spesi(N)/2) + vincite(N) + assicurazioni + obbligatoria
```

Tutti gli ingredienti si ricavano dall'archivio **tranne `non_spesi`**. `finanze.residui` è il
residuo **d'asta**; quello che serve è il residuo **a fine stagione**, e coincide con quello di Guido
una volta su dieci:

| | Prosecco | Roburro | Sanguemisto | Subbuteo |
|---|---:|---:|---:|---:|
| `finanze.residui` | 8 | 3 | 31 | 1 |
| Guido «non spesi» | 2 | 0 | 2 | 1 |

Con la faccia mancante: `non_spesi = residui + incassi − esborsi`, e la formula si chiude **tutta
dentro l'archivio**.

## L'esborso è calcolabile

Misurato dalla sessione cowork su **103 acquisti, zero eccezioni**:

- **2021-22 e 2022-23** → **prezzo pieno** del cartellino (53/53)
- **dal 2023-24** → **metà, arrotondata per difetto** (50/50 — Dragusin da 11 costa 5, Castellanos
  da 43 costa 21)

Serve il costo dal listone della stagione e chi ha preso il giocatore. `caprera.passaggi` (561
uscite) dice da dove esce; la rosa di destinazione dice dove entra.

## Cosa chiedo

1. **La riga di addebito** per ogni acquisto di mercato: società che compra, crediti negativi,
   `fonte` che dica che è **calcolata** e non trascritta — non deve somigliare a una riga letta da un
   foglio. Se `categoria='mercato'` diventa ambigua con due facce, valuta tu se serve distinguerle.
2. **Il collaudo, prima di crederci:** `residui + incassi − esborsi` deve riprodurre la colonna «non
   spesi» di Guido. I numeri stanno in `06_caprera_project/Pagamenti - Vincite - Crediti.xlsx`, un
   foglio per stagione. Sei stagioni, dieci società.
3. **Poi** `v_crediti_stagione` e la riga `2026-27` in `finanze`.

⚠️ **Se il collaudo non dà 10/10, fermati e dillo.** Manca ancora qualcosa, e il candidato più
probabile sono i **66 svincoli**: uno svincolo non costa niente, ma se libera crediti al momento
giusto entra in questo conto. Non inventare la regola — è del Direttore Sportivo.

⚠️ **Il carry-over è `ceil`, non `round`.** Verificato su trenta casi: il mezzo credito va sempre
alla società. `ceil(non_spesi::numeric / 2)`.

⚠️ **Le assicurazioni stanno FUORI dalle vincite.** Guido le tiene in colonna separata, dopo il
totale. Includerle sbagliava Smit di 8 crediti.

## Non fare

**Non scrivere la riga `2026-27` di `finanze` prima che il collaudo passi.** Quel numero apre l'asta:
se è sbagliato, sbaglia tutta la stagione. I valori provvisori — calcolati dal foglio di Guido, non
dall'archivio — stanno nel rapporto, e vanno bene per guardarli, non per giocarci.

## Contesto: c'è anche uno scarto aperto su Smit

Il `−5` di *Solet Accusa Stupro* sta due volte nel foglio 2024-25 e una volta sola nel database:
`finanze.iniziali` per Smit 2025-26 è **257**, Guido dice **252**.

⚠️ **La sentenza non è ancora uscita** (confermato da L0 il 27/08). Fino ad allora: **il database
resta a 257 e il foglio resta a 252, e non si tocca nessuno dei due per farli combaciare.** Se il
collaudo inciampa su Smit, è questo — non un tuo errore, e non si aggiusta: si annota e si va avanti
sulle altre nove.

---

## Esito — RESTA APERTA, lavorata il 27/08/2026 (magazziniere)

**Il collaudo non passa: 3 su 20.** Mi fermo al punto (2), come la consegna prescrive.
`v_crediti_stagione` e la riga `2026-27` di `finanze` **non sono state scritte**. Al database
vivo non ho applicato niente: solo `SELECT`.

Materiale: **`caprera-dati/SUPABASE/11-esborsi-di-mercato-collaudo.sql`** — sola lettura, con
le tre interrogazioni e i numeri stampati dentro.

### 1 · La riga di addebito non manca: c'e' gia', col segno sbagliato

La consegna parte da *«`movimenti.categoria='mercato'` registra chi incassa, non chi paga»*.
**Sul database vivo e' il contrario.** Ogni riga e' agganciata alla societa' che quel calciatore
ce l'ha nella **propria rosa `partenza` della stessa stagione** — chi lo prende — e l'importo e'
**il costo di quella rosa**: pieno fino al 2022-23, **meta' per difetto dal 2023-24**. Cioe'
**esattamente la regola di prezzo che la consegna mi chiede di calcolare**, gia' calcolata.

| stagione | righe | con costo proprio | importo pieno | pieno **negativo** | meta' |
|---|---:|---:|---:|---:|---:|
| 2021-22 | 37 | 16 | 12 | 0 | 2 |
| 2022-23 | 76 | 70 | 27 | **35** | 2 |
| 2023-24 | 9 | 9 | 0 | 0 | **9** |
| 2024-25 | 20 | 17 | 2 | 1 | **14** |
| 2025-26 | 31 | 29 | 0 | 1 | **27** |

Castellanos: `rose.costo` 43 → movimento **21**. Lookman 26 → 13. Camarda 10 → 5. E' il numero
dell'esempio della consegna, preso dalla rosa e non dal listone.
Nel **2022-23 trentacinque righe sono gia' negative**: la faccia dell'addebito e' stata scritta
li' col segno giusto, e altrove col segno opposto.

**Percio' non ho scritto la riga di addebito.** Aggiungerne una seconda **raddoppierebbe
l'esborso** su cinque stagioni. Quello che serve non e' una riga nuova: e' **decidere il segno e
dichiarare la semantica di `categoria='mercato'`** — e non e' una decisione da magazziniere.

⚠️ **E c'e' un guasto di provenienza, che segnalo perche' e' mio mestiere:** quelle righe hanno
`fonte='foglio rose'` e **nessuno script versionato le produce** (grep su entrambi i repository:
zero). `carica-movimenti.py` legge il registro di Guido e non le scrive. Sono state **inserite nel
database vivo da un'altra sessione e non si rigenerano**: se si ricarica, spariscono.

### 2 · Il collaudo, numero per numero

**Vincolo strutturale prima dei numeri:** `caprera.finanze` ha **solo 2024-25 e 2025-26**. Le sei
stagioni chieste **non sono confrontabili**: due lo sono. Su venti confronti ne tornano tre.

| 2024-25 | Guido | `residui` | `res − esborsi` | `res + movimenti` |
|---|---:|---:|---:|---:|
| armata-rossa | 5 | 8 | −44 | −44 |
| aston-ville | 3 | 3 | **3 ✅** | **3 ✅** |
| disperata | 11 | 15 | −17 | 47 |
| prosecco | 31 | 4 | −7 | −7 |
| real-monghi | 24 | 12 | −5 | 29 |
| roburro | 3 | 3 | **3 ✅** | **3 ✅** |
| sanguemisto | 26 | 19 | 10 | 28 |
| smit | 0 | 6 | **0 ✅** | **0 ✅** |
| sporting-mangiapreti | 10 | 13 | −31 | 57 |
| subbuteo | 35 | 4 | −29 | 37 |

| 2025-26 | Guido | `residui` | `res − esborsi` | `res + movimenti` |
|---|---:|---:|---:|---:|
| armata-rossa | 9 | 0 | −20 | 20 |
| aston-ville | 9 | 4 | −4 | 12 |
| disperata | 2 | 4 | −72 | 80 |
| prosecco | 2 | 8 | −5 | 21 |
| real-monghi | 5 | 4 | −28 | 36 |
| roburro | 0 | 3 | −19 | 25 |
| sanguemisto | 2 | 31 | 13 | 49 |
| smit | 1 | 6 | −1 | 13 |
| sporting-mangiapreti | 7 | 0 | −41 | 41 |
| subbuteo | 1 | 1 | 0 | 2 |

**2024-25: 3/10. 2025-26: 0/10.** Gli scarti sono di segno misto e fino a −72: non e' un pezzo
che manca in fondo, e' che **la formula non e' quella**.

⚠️ **Smit non c'entra.** Lo scarto 257/252 e' sospeso e non l'ho toccato — ne' il database ne' il
foglio. Ma qui Smit e' **fra i tre che tornano** nel 2024-25. Il collaudo non inciampa su di lui.

**Non ho cercato la regola degli svincoli**, che e' il candidato indicato dalla consegna: e' del
Direttore Sportivo, e con scarti di questa ampiezza sarebbe stato aggiustare i dati per farli
tornare.

### 3 · Quello che invece torna 10 su 10, e nessuno l'aveva provato

**`finanze.riportati` della stagione N+1 e' esattamente `ceil(non_spesi(N)/2)` di Guido.**
Dieci societa' su dieci: 31→16, 3→2, 35→18, 3→2, 10→5, 26→13, 0→0, 11→6, 5→3, 24→12.

Due conseguenze:

- il **carry-over per eccesso** e' confermato **sul database**, non solo su una formula di Excel;
- i «crediti non spesi» di una stagione passata **si rileggono dall'archivio** — ma da
  **`riportati` dell'anno dopo**, non da `residui`. `residui` e' il residuo d'asta e non lo
  diventera' mai.

**E questo e' anche il muro:** l'unica traccia archivistica di `non_spesi(2025-26)` sarebbe
`riportati` della riga **2026-27** — cioe' proprio la riga che la consegna vieta di scrivere prima
del collaudo. Il conto non si chiude dentro l'archivio finche' qualcuno non porta quel numero da
fuori (Fantapazz, o Guido).

### Cosa ho verificato con i miei occhi · cosa no

**Con i miei occhi, sul database vivo (27/08) e sul foglio:** le 173 righe `categoria='mercato'`
contro `rose.costo`; `finanze` (20 righe, due sole stagioni); `passaggi` (`a` e' **NULL su tutte
le 561 uscite** — la destinazione non e' li' dentro, al contrario di quanto la consegna suppone);
le sei colonne «Crediti non spesi» lette dai sei fogli di `Pagamenti - Vincite - Crediti.xlsx` con
python3+zipfile.

**Non verificato / non fatto:** nessuna scrittura, nessuna migrazione, nessun `carica.sh`.
Non ho toccato `caprera-web/src/`, `collaudo/`, ne' altro in `.processo/`.

### Cosa serve per riaprirla

1. **Al Direttore Sportivo / L0:** che cosa e' `movimenti.categoria='mercato'` — esborso del
   compratore (allora va normalizzato il segno) o incasso del venditore (allora e' agganciata alla
   societa' sbagliata)? Finche' e' ambigua, ogni conto sui crediti la usa a caso.
2. **Al Segretario:** la diagnosi del rapporto `la-formula-dei-crediti` §2 va rivista — la faccia
   che manca non e' quella dell'addebito.
3. **Provenienza:** o le 173 righe entrano in uno script versionato, o si perdono al primo
   ricaricamento.
