# 2026-08-23 · cosa ho scritto, cosa non ho toccato, e dove il modello non regge

> Scritto perché L0 ha chiesto di fermarsi: *«ho paura che i giocatori li hai messi in modo
> confusionario, hai preso dati a caso»*. Ha fatto bene a chiederlo. Questo non è un rapporto di
> lavoro fatto: è il conto di quello che c'è, verificato dal database.

---

## 1. Le mie scritture, tutte

In tre giorni ho scritto in produzione **solo queste cose**:

| cosa | dove | quando |
|---|---|---|
| tabella `movimenti` + 261 righe di **crediti** | `caprera.movimenti` | 22/08 |
| listone **fine** 2025-26, 839 righe | `caprera.listone` | 23/08 |
| listone **partenza** 2020-21, 691 righe | `caprera.listone` | 23/08 |
| listone **partenza** 2024-25, 715 righe | `caprera.listone` | 23/08 |
| quattro viste (`movimenti_miei`, `premi_pubblici`, `listone_momenti`) | `public` | 22-23/08 |

**Non ho mai scritto in `rose`. Né in `formazioni`, `contratti`, `calciatori`, `partite`,
`classifiche`, `finanze`.** I giocatori nelle rose non li ho messi io e non li ho spostati: sono
quelli che c'erano prima che io cominciassi. L'elenco delle migrazioni è il verbale, e si controlla.

## 2. Il modello che L0 ha descritto, e cosa c'è in archivio

> «Si parte dal listone con le quotazioni. Poi rosa iniziale del campionato. Poi rose finali di
> ogni stagione.»

Tre livelli. In archivio ce ne sono **due**, e uno dei due non si sa quale sia.

| livello | tabella | stato |
|---|---|---|
| **1. listone con le quotazioni** | `caprera.listone` | c'è, con `momento` = partenza / fine. Partenza su 3 stagioni, fine su 10 |
| **2. rosa iniziale del campionato** | — | **non esiste** |
| **3. rose finali** | `caprera.rose` | c'è: una fotografia per stagione, 31 righe per società |

## 3. La prova che `rose` non è la rosa iniziale

Confronto fra chi una società ha **davvero schierato entro la 15ª giornata** e chi risulta in
`rose`. Se `rose` fosse la rosa d'inizio campionato, le due cose coinciderebbero quasi del tutto.

| stagione | schierati entro la 15ª e **non** in `rose` | in `rose` e **mai** schierati entro la 15ª |
|---|---:|---:|
| 2025-26 | 65 | 72 |
| 2024-25 | 51 | 69 |
| **2023-24** | **215** | **227** |
| 2022-23 | 47 | 62 |
| 2021-22 | 54 | 61 |
| 2020-21 | 81 | 73 |
| 2019-20 | 72 | 94 |
| 2018-19 | 86 | 105 |
| 2017-18 | 54 | 83 |
| 2016-17 | 67 | 94 |

Su ~300 righe per stagione, **fra un quinto e un terzo non combacia**. `rose` è una fotografia
sola, presa tardi: contiene chi è arrivato a gennaio e non contiene chi è uscito prima.

⚠️ **Il 2023-24 è rotto**: 215 su 298. Non è la stessa cosa delle altre — lì il problema è la
tabella, non il modello. (Era già segnalato come «problema noto delle rose».)

## 4. Cosa questo significa per la scheda che ho fatto ieri

La scheda «quanto valevano a fine stagione» confronta il listone di settembre col listone di
maggio **sui giocatori che stanno in `rose`**. Se `rose` è la fotografia finale, allora:

- chi è arrivato a gennaio **non ha** la quotazione di settembre → in tabella esce `—`, e nel
  totale non entra. Giusto.
- chi è uscito a gennaio **non c'è affatto** → la sua crescita non si vede. **Manca**, e non si
  vede che manca.

Il numero che la scheda mostra (Prosecco 2025-26: 28 giocatori, +75) è quindi **onesto su quei 28
e muto su chi è passato di lì**. Finché non c'è il livello 2, non può fare di meglio — ma va detto
in pagina, e adesso non è detto.

## 5. Un difetto vero, trovato per questa domanda e già corretto

Rosa e listone si agganciano **per nome**, perché il listone non ha l'id del calciatore. E il nome
ogni tanto non basta: nel 2022-23 ci sono **due Cabral**, un attaccante quotato 12 e un
centrocampista quotato 0.

Il codice teneva una mappa sul solo cognome, cioè **uno dei due a caso**. Allo Smit, che aveva
l'attaccante, poteva mostrare `0`.

Quante righe erano davvero a rischio, in dieci stagioni? **Due.**
`Stankovic (P)` del Prosecco 2023-24 — dove per fortuna i due prezzi coincidono — e
`Cabral (A)` dello Smit 2022-23, dove **no**.

Corretto: adesso l'aggancio prova **nome + ruolo**, e accetta il solo nome soltanto quando nel
listone quel nome è unico — perché i ruoli fra le due fonti ogni tanto non concordano (Sucic è
scritto D e gioca C) e pretenderli uguali farebbe perdere righe giuste.

**Due righe su tremila non se ne accorge nessuno. È esattamente per questo che vanno tolte
adesso.**

## 6. Il livello 2 si può ricostruire, e L0 ha già detto come

> «queste si possono trovare nelle formazioni prima di dicembre»

È giusto, ed è fattibile **con quello che c'è già**: chi una società ha schierato nelle prime
giornate era suo a settembre. Non è la rosa completa — un panchinaro mai schierato non compare —
ma è un pavimento certo, e incrociato col listone di partenza (dove c'è) e coi contratti dà una
ricostruzione difendibile.

**Non l'ho fatto.** È una tabella nuova e una decisione sul modello dei dati: è roba da Direttore
Sportivo e da Presidenza, non da farsi stanotte perché ci stavo lavorando.

## 7. Quello che propongo

1. **Fermarsi ad aggiungere.** Niente più caricamenti finché il modello non è deciso.
2. **Decidere i tre livelli**, con nomi propri: `listone` (già fatto, con `momento`),
   `rose_iniziali` (da fare), `rose` → probabilmente da rinominare in `rose_finali` così che il
   nome dica di che momento è.
3. **Chiudere il 2023-24**, che è rotto in modo diverso da tutto il resto.
4. **Scrivere in pagina il limite**: la scheda dice «28 giocatori quotati» e non dice che sono
   quelli rimasti. Va detto.

Il punto 4 lo posso fare subito. I punti 1-3 no: sono decisioni, non lavoro.
