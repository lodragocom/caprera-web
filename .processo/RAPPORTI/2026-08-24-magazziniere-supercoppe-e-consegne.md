# 2026-08-24 · magazziniere · Le quattro Supercoppe, e il giro sulle sei consegne

**Stato:** CALCOLO fatto · **PASSO LA PALLA** su tre decisioni che non sono mie
**Scrittura in produzione: nessuna.** Il database è vivo e ci lavorano altre sessioni — mentre
scrivevo, una stava caricando `statistiche_serie_a`. Tutto quello che ho prodotto è materiale
pronto da applicare in `caprera-dati/SUPABASE/`.

## Manufatti

| file | cosa |
|---|---|
| `SUPABASE/09-supercoppe-ricostruite.sql` | le quattro Supercoppe mancanti, idempotente, con il ragionamento dentro |
| `SUPABASE/10-diritti-tv.sql` | `caprera.v_diritti_tv` — importi da `lega.regole`, finalisti da `v_albo` |
| `SUPABASE/carica.py` | una riga: `statistiche_serie_a` in `ALTRUI` |
| quattro consegne chiuse, due lasciate aperte con lo stato scritto in fondo | |

## 1 · Le quattro Supercoppe

Non erano dati persi: erano calcolabili. Partecipanti dall'albo dell'anno prima, esito dai
fantapunti della **2ª (SCI) e 3ª (SCE) giornata Caprera**.

**La trappola l'ho verificata invece di fidarmi.** Una giornata che Caprera non gioca sta in
archivio come dieci società a 60,00 esatti:

- **2022-23 → saltate le giornate 1, 2, 3** ⇒ 2ª Caprera = **5ª** di Serie A, 3ª = **6ª**
- **2023-24 → saltata la giornata 1** ⇒ 2ª Caprera = **3ª**, 3ª = **4ª**

| | casa (+1) | fuori | fantapunti | risultato | vincitore |
|---|---|---|---|---|---|
| **SCI 2022-23** | sanguemisto *(campione 21-22)* | armata-rossa *(CI)* | 79,50 **+1 = 80,50** — 69,00 | **3-1** | **Sanguemisto** |
| **SCE 2022-23** | disperata *(CL)* | sporting-mangiapreti *(EL)* | 79,50 **+1 = 80,50** — 74,00 | **3-2** | **Disperata** |
| **SCI 2023-24** | roburro *(campione 22-23)* | subbuteo *(CI)* | 66,00 **+1 = 67,00** — 72,50 | **1-2** | **Subbuteo** |
| **SCE 2023-24** | sanguemisto *(CL)* | armata-rossa *(EL)* | 65,00 **+1 = 66,00** — 72,50 | **1-2** | **Armata Rossa** |

I gol dalla `scala_gol` in vigore dal 2020-21 (soglie 66 · 72 · 77 · 82 · 86). La soglia si intende
**raggiunta**, non superata: verificato sul database, tutti e **18** i casi da 66,00 esatti in
queste stagioni valgono 1 gol.

Il **+1 casa non cambia nessuno dei quattro vincitori**. Cambia un numero solo: i gol della SCE
2023-24, che senza sarebbero 0-2.

**Partecipanti verificati 4 su 4 con i miei occhi**, contro `caprera.movimenti` categoria
`diritti-tv`: le società che hanno incassato SCE e SCI in quelle due stagioni sono esattamente
queste otto.

## 2 · I diritti TV tornano — il calcolo che è anche un collaudo

Rifatto io il conto del Segretario, e dà la stessa tabella: **8=8 · 8≠14 · 8≠14 · 16=16 · 16=16**.
Lo scarto è 6 crediti in due stagioni ed è SCE 4 + SCI 2. Con `09` applicato, tornano tutte e cinque.

Prima del 2021-22 il registro di Guido non arriva: il calcolo produce comunque 6 o 8 a stagione, e
**nessuna fonte lo conferma**. Chi lo mostra deve dirlo.

## 3 · Il giro sulle sei consegne

**Quattro chiuse** — ed erano già state riparate da altre sessioni: il mio lavoro è stato
verificarle sul database vivo, non rifarle. Due cose sono uscite da lì e non erano note:

- ⚠️ **`carica.sh` oggi si ferma.** La guardia `dipendenti_impreviste()` — nata proprio dalla
  consegna delle tessere — ha trovato `statistiche_serie_a` fuori da tutti gli elenchi. Ha
  funzionato come doveva: si ferma invece di travolgere. Aggiunta ad `ALTRUI`.
- ⚠️ **Il controllo n. 1 della consegna sui movimenti era scritto sull'allineamento sbagliato** e
  non torna su nessuna riga. La forma giusta è
  `sum(movimenti di N) = finanze(N+1).bonus + finanze(N+1).ffp`, e **torna con resto 0 su tutte e
  dieci le società**. Che chiude anche una domanda aperta nello STATO: **`ffp = 2` è il pagamento
  anticipato**, confermato dal registro di Guido.

**Due lasciate aperte:** `statistiche-serie-a` (caricamento in corso da un'altra sessione: 4
stagioni su 11 e una troncata — la chiuda chi la sta caricando) e `i-file-ritrovati` (§1 fatto,
§2 a metà, §3/§6 fermi sulle quattro domande a L0).

## PASSO LA PALLA — tre cose che non decido io

1. **Il +1 casa nella Supercoppa non risulta applicato.** Unico caso in archivio in cui avrebbe
   cambiato qualcosa: **SCE 2024-25**, sanguemisto (vincente CL, ed è casa) 77,00 contro real-monghi
   77,50, vinta da real-monghi. Col +1 avrebbe vinto sanguemisto. O il +1 non si è mai applicato
   davvero, o il 2024-25 è registrato sbagliato — e la risposta tocca l'**albo d'oro**. → **L0**
2. **Il pari merito sui premi positivi è in esercizio senza ratifica.** Il Segretario aveva scritto
   *«chiedi prima di darla per buona»*; nella vista è data per buona. Oggi non cambia un credito.
   Non l'ho tolta: toglierla sarebbe decidere al contrario. → **L0 / Direttore Sportivo**
3. **Le quattro domande su Grigliata e Mr Champions** restano senza risposta, e senza sono crediti
   veri assegnati su una supposizione. → **L0 e Guido**

Più due che restano in coda a me e oggi non bloccano niente: `carica.sh --solo-regole`, e le 123
clausole ancora vuote su 186 contratti.

## Cosa ho verificato con i miei occhi, e cosa no

**Sì:** le giornate saltate del 2022-23 e 2023-24 (tutte e dieci a 60,00); i fantapunti delle
quattro giornate; la scala dei gol e la soglia a 66,00 su 18 casi; i partecipanti contro
`movimenti`; il testo del regolamento §5.3 sul +1 casa; `pg_get_viewdef` di `v_premi_crediti`;
il conto dei diritti TV rifatto da me; l'identità `movimenti/bonus+ffp` su dieci società; i
conteggi di `listone`, `rose`, `contratti`, `tessere`, `misteri`; la guardia di `carica.py`
interrogata con la sua stessa query.

**No:** non ho lanciato `carica.sh` né applicato `09` e `10` — sono materiale pronto, non
applicato. Non ho riletto riga per riga il file di Guido (mi sono fidato di `movimenti`, che però
ho collaudato). Non ho verificato le categorie di `movimenti` una per una. Non ho aperto nessuno
degli `.xlsx` di Grigliata e Mr Champions.

**Se qualcosa è rotto per mano mia:** ho toccato un file solo, `carica.py`, e una riga sola.
`carica.sh` non era comunque lanciabile prima: adesso lo è di nuovo. Rollback: si toglie
`'statistiche_serie_a'` da `ALTRUI`.

## Handoff

- **L0** → le tre decisioni qui sopra, la prima per prima (tocca l'albo d'oro)
- **segretario** → lo STATO: le quattro Supercoppe calcolate, `ffp = 2` confermato, quattro
  consegne chiuse. Non l'ho aggiornato io.
- **curatore** → `movimenti` c'è e collauda: `/area/crediti` si può rifare, leggendo i movimenti
  **della stagione precedente** per spiegare il `bonus` di quella corrente
- **direttore-sportivo** → la finestra `public` su `v_diritti_tv`, se serve al sito

## Pattern

**Prima di riparare una consegna vecchia di due giorni, guarda se è ancora rotta.** Quattro su sei
erano già a posto. Il valore del giro non è stato ripararle: è stato **collaudarle**, e il collaudo
ha trovato due cose che nessuno sapeva. Un controllo scritto in una consegna è una proposta di
controllo, non un controllo: va rifatto, e a volte è il controllo a essere sbagliato, non il dato.
