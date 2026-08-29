# 2026-08-24 · segretario · I diritti TV si calcolano — provato

> La moviola di una prova, non di un lavoro. **Non ho scritto niente nel database**: la vista che
> servirebbe è del Magazziniere.

**Scope:** livello 1 del «mettere in atto il regolamento» — far calcolare al sistema ciò che il
regolamento prescrive.
**Stato:** FATTO come verifica · la vista resta da scrivere

## Il contesto, in due righe

L0: *«non perdiamo l'obiettivo: mettere in atto il regolamento al gioco in modo meccanico e
dinamico»*, e poi *«partiamo dal calcolo»*.

Misurato prima di proporre: **su 97 regole scritte in `regole-caprera.json`, 50 non sono lette da
niente** — tutto il Jobs Act, tutto il mercato, quasi tutti i crediti. *(Metodo grezzo: cerco il
nome di ogni regola nel codice. Qualche "usata" è un falso positivo; la lista delle non lette è
affidabile.)*

## La prova

**I diritti TV ai finalisti** erano la voce calcolabile più grossa mai calcolata. Due cose l'hanno
resa immediata, ed erano già lì:

- **`caprera.v_albo`** ha già `vincitore` e `finalista` per ogni competizione e stagione — quindi
  la logica del tabellone (chi passa il turno, e quale delle due partite del turno «Finali» è la
  finale vera) **esiste già in SQL**, non solo in `coppe.js`;
- **`caprera.movimenti`** — 261 righe, il registro di Guido caricato dalla sessione del codice —
  permette di **verificare** invece di proporre.

Calcolo: `v_albo` × `lega.regole → competizioni[].diritti_tv_finalista`, per entrambi i finalisti.
Confronto con `movimenti` dove `categoria = 'diritti-tv'`.

| stagione | calcolato | registro di Guido | società che coincidono |
|---|---:|---:|---|
| 2021-22 | 8 | 8 | **5 su 5** ✅ |
| 2022-23 | 8 | 14 | 3 su 7 |
| 2023-24 | 8 | 14 | 2 su 6 |
| 2024-25 | 16 | 16 | **8 su 8** ✅ |
| 2025-26 | 16 | 16 | **8 su 8** ✅ |

**Tre stagioni su cinque tornano al credito.**

## Le due che non tornano: non è il calcolo, è l'archivio

Lo scarto è **6 crediti**, identico in entrambe. Cercato, e trovato esatto:

```
2022-23  Diritti TV SCE  4     2023-24  Diritti TV SCE  4
2022-23  Diritti TV SCI  2     2023-24  Diritti TV SCI  2
```

**4 + 2 = 6.** Sono le **Supercoppe**, e in `v_albo` per quelle stagioni non ci sono: dal 2021-22
al 2023-24 l'archivio ha **tre competizioni** (Champions, Coppa Italia, Europa League), dal 2024-25
**sei**.

Il regolamento dice che le Supercoppe esistono **dalla stagione 2022/23** — che è esattamente la
prima stagione in cui il conto non torna. E il 2021-22 torna proprio perché le Supercoppe non
c'erano ancora.

> **Il calcolo è corretto su tutte e cinque le stagioni. In due, l'archivio è incompleto.**

## Cosa se ne ricava

**1 · Il livello 1 funziona, ed è più vicino di quanto sembrasse.** Non serviva scrivere la logica
del tabellone: era già in `v_albo`. La vista dei diritti TV è un join di tre righe.

**2 · Il calcolo è un collaudo dell'archivio, non solo una funzione.** Facendolo girare contro il
registro di Guido, ha trovato **due stagioni di Supercoppe mancanti** — un buco che nessuno aveva
notato in dieci giorni di lavoro sui dati. È lo stesso principio di
`classifica-contro-i-file.mjs`: *se un numero non torna, è un errore e non un dettaglio*.

**3 · Il pattern si estende.** Ogni premio calcolabile diventa: una vista che legge gli importi da
`lega.regole`, più un confronto col registro. Il confronto è la parte che vale — senza, si
calcolerebbe qualcosa senza sapere se è giusto.

## Prossimo passo

**Non l'ho scritta.** Le viste sono del Magazziniere, e c'è già una consegna aperta sulla stessa
famiglia (`premi-crediti`, il pari merito). La vista dei diritti TV va lì, insieme.

Restano calcolabili e mai calcolate: **formazione non data** (−1/−3/−5, che è l'assenza di una
riga in `formazioni`, con l'escalation da contare per stagione) e il **Ranking** — quest'ultimo
solo se la tabella dei punteggi arriva (C1, rimandata da L0).

## Seguito — le Supercoppe non mancavano, mancava la numerazione

L0 ha raddrizzato la pista **due volte**, e ogni volta il risultato è migliorato.

**Prima correzione:** *«le Supercoppe le facevamo già, prendendo i voti di squadre che sapevamo chi
erano»*. Non erano partite registrate da Fantapazz: si calcolavano dai fantapunti di squadre note.
**I partecipanti si ricavano dall'albo della stagione precedente**, e l'ho verificato contro il
registro di Guido — **quattro casi su quattro**:

| | chi ha incassato | dall'albo dell'anno prima |
|---|---|---|
| SCE 2022-23 | disperata + sporting | vincitore CL 21-22 · vincitore EL 21-22 ✓ |
| SCI 2022-23 | armata-rossa + sanguemisto | vincitore Coppa Italia · campione 21-22 ✓ |
| SCE 2023-24 | armata-rossa + sanguemisto | vincitore EL 22-23 · vincitore CL 22-23 ✓ |
| SCI 2023-24 | roburro + subbuteo | campione 22-23 · vincitore Coppa Italia 22-23 ✓ |

**Seconda correzione, e ha sciolto la prima.** Avevo trovato «sei giornate vuote» e stavo per
chiamarle un buco nei dati. L0: *«partiamo sempre dopo, il mercato finisce il primo settembre,
quindi saltiamo le prime giornate»*.

**Non è un buco: sono giornate che Caprera non gioca.** E soprattutto: **«giornata Caprera» non è
«giornata di Serie A»**. Nel 2022-23 le prime tre di Serie A si saltano, quindi la 2ª Caprera è la
**5ª** — ed è lì che ci sono i fantapunti veri.

Ricalcolate sulla numerazione giusta:

| | partecipanti | fantapunti | vincitore |
|---|---|---|---|
| **SCI 2022-23** (2ª Caprera = 5ª SA) | armata-rossa · sanguemisto | 69,0 — **79,5** | **Sanguemisto** |
| **SCE 2022-23** (3ª Caprera = 6ª SA) | **disperata** · sporting | **79,5** — 74,0 | **Disperata** |

*(Sulla SCE va poi applicato il +1 casa al vincitore della Champions — è la Disperata, l'esito non cambia.)*

### E una distinzione che L0 ha imposto, giustamente

Avevo scritto «regola numero quattordici: Caprera salta le prime giornate». **Sbagliato.** L0:
*«è voluto ma non è una regola, è coincidenza — fattori mercato e periodo che si incontrano»*.

**Non si prescrive quante giornate saltare: si constata quante ne sono state saltate.** Mai più di
tre (2022-23); una in tre stagioni; zero nelle altre sei — che conferma anche la sua intuizione,
*«non credo che abbiamo sforato le 4 partite»*.

Quello che invece **va scritto** non è il salto: è la sua conseguenza. `giornata_caprera` in
`regole-caprera.json`, come **definizione** e non come norma: *ogni regola che dice «la N-esima
giornata» va letta nella numerazione Caprera*.

## Handoff

- **magazziniere** → la vista `v_diritti_tv`, da aggiungere alla consegna `premi-crediti`
- **magazziniere** → le **Supercoppe 2022-23 e 2023-24 sono ricostruibili**, non mancanti:
  partecipanti dall'albo dell'anno prima (verificati 4/4), esito dai fantapunti della 2ª e 3ª
  **giornata Caprera**. Con quelle, i diritti TV tornerebbero su tutte e cinque le stagioni.
- **magazziniere** → attenzione alla numerazione: un calcolo che usa la giornata di Serie A dove il
  regolamento dice «giornata Caprera» legge un 60-60 finto

## Pattern imparato

**Un calcolo che riproduce un registro è due cose insieme: una funzione e un collaudo.**

Avevamo il registro di Guido da due giorni e lo trattavamo come una fonte da leggere. Usato come
**termine di paragone** ha trovato in cinque minuti quattro Supercoppe assenti dall'albo. La
differenza non è nel dato: è nell'averci fatto girare contro un calcolo.

### E un secondo, che riguarda me

**Uno scarto nei numeri non dice dove sta lo sbaglio.** Ho letto «6 crediti mancanti» e ho concluso
«manca il dato». Erano due cose diverse — una convenzione della lega che non conoscevo e una
numerazione che non sapevo esistesse — e in entrambi i casi **il dato c'era**.

È la settima volta in quattro giorni che sbaglio così: il numero era giusto, la spiegazione no. E
tutte e sette le volte la correzione è arrivata da chi la lega la gioca, non da chi la misura.
