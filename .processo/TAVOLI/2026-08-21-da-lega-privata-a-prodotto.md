# 2026-08-21 · Da lega privata a prodotto

> Primo tavolo del Processo. Aperto dal Segretario su indicazione di L0, che ha dichiarato la
> direzione: *"al momento siamo solo 10 amici che giocano da 10 anni, ma dovrà essere un gioco
> accessibile ad altri nuovi utenti, scaricando l'App e si gioca alla Caprera League"*.

## 1. Domanda

**Che cosa va deciso adesso, e che cosa va deliberatamente rimandato, perché Caprera possa
diventare un prodotto per utenti nuovi senza dover riscrivere ciò che è già in esercizio?**

Non *se* farlo — quello lo ha deciso L0. **In quale ordine**, e quali porte vanno lasciate aperte
oggi perché costano poco adesso e carissimo dopo.

## 2. Convocati, e perché

| ruolo | perché è al tavolo |
|---|---|
| **Direttore Sportivo** (Dedalo / Marotta) | pronuncia la sentenza: è scope, è irreversibile, è suo |
| **Magazziniere** (Efesto / Gattuso) | `lega_id` tocca 26 tabelle, 38 finestre e 28 regole di riga già scritte |
| **Curatore** (Atena / Baggio) | una lega vuota il primo giorno è un problema di progettazione, non di dati |
| **Addetto Stampa** (Calliope / Quagliarella) | "Caprera League" diventa un nome che parla a estranei, non più a dieci amici |
| **Preparatore** (Apollo / Cannavaro) | dati di persone che non conosciamo: GDPR, SMTP, tenuta |
| **Team Manager** (Ermes / Totti) | i voti arrivano da fuori, ed è il confine con il mondo |
| **Segretario** (Mnemosine / Zoff) | sintesi, e poi l'ADR |
| **L0 Salvo** | Presidenza, soldi, rapporto con Guido, e il *se* — già deciso |

## 3. I fatti sul tavolo — verificati, non riferiti

**a) Il multi-lega c'è nella struttura, non nell'applicazione.**
*Corretto il 22/08 interrogando il database vivo. La versione precedente di questo punto diceva
che `lega_id` non esisteva: **era sbagliata**, e cercava il nome sbagliato nei file sbagliati —
`.sql` fermi al 20/08 invece del database.*

Quello che c'è davvero: la colonna si chiama **`lega`**, ed è una **chiave esterna verso
`caprera.lega`** su **`societa`, `stagioni`, `competizioni`**. Sono le tre radici: partite, rose,
formazioni, contratti e finanze ci arrivano per chiave. È il disegno normalizzato corretto, non
una scorciatoia — migliore di *"lega_id ovunque"*.

Quello che manca: **delle 28 regole di riga, zero filtrano per lega** (`pg_policies`, verificato).
Filtrano per società e per incarico. Oggi due leghe non sarebbero tenute separate dal database.
Manca lo stesso predicato nelle **38 finestre** di `public`.

**Quindi non è una riscrittura dello schema: è un predicato da aggiungere in due posti.**
Resta da decidere *chi decide qual è la tua lega*: oggi la tessera dà una **società**, e la lega
si ricava da quella. Con N leghe va detto esplicitamente.

**b) ADR-003 poggia su una premessa mono-lega.**
La frase portante è *«la Presidenza sa già chi è chi»*, ed è vera **perché la Presidenza è una**.
Con N leghe: o ognuna ha la sua che emette tessere, o serve un'autoregistrazione — che riapre
esattamente ciò che ADR-003 aveva chiuso, *il primo che sbaglia o fa il furbo si prende la
squadra di un altro*.

**c) I voti non li produciamo noi. ✅ DECISO da L0 il 22/08 — non è più una domanda aperta.**

**La stagione 2026-27 si continua a prendere da Fantapazz e dalla Shiny.** Alternative praticabili
oggi non ce ne sono: i voti sono materiale editoriale, e chi lo produce lo produce per sé.

Non è un rinvio per pigrizia, è un vincolo dichiarato. Ma sposta la questione invece di chiuderla,
e va scritto dove non si perde:

> **La dipendenza dai voti non è un problema del prototipo: è la porta d'ingresso del prodotto.**
> Per dieci amici che giocano fra loro, leggere i voti da Fantapazz è comodità e non ha
> conseguenze. Nel momento in cui qualcuno **scarica un'App** e gioca alla Caprera League, quegli
> stessi voti diventano l'ingrediente di un servizio offerto a terzi — e la domanda cambia
> natura: da tecnica a commerciale e legale.

Quindi **non è un compito da fare adesso: è una condizione da verificare prima di aprire**. Il
tavolo deve decidere *quando* si torna a guardarla, e la risposta ragionevole non è una data ma un
evento: **il primo utente che non è uno dei dieci.**

**Corollario che il tavolo non può ignorare — Guido è sulla via critica.**
Se anche gli aggiornamenti futuri passano dalla Shiny, allora `TASK/TASK_Infrastruttura_Lega.md`
smette di parlare solo dell'archivio storico. Lì è già scritto: *«se Guido si ferma, la lega perde
la sua memoria statistica»*. Con l'App, se Guido si ferma **la lega non gioca**. È una persona
sola, non ha firmato niente, e non è un fornitore: è un amico. Va detto, perché è esattamente il
tipo di rischio che nessuno mette per iscritto finché non accade.

**d) Il prodotto è il regolamento.**
Ciò che rende Caprera diversa sono Jobs Act, Cura Caprera e gli stipendi. Quindi le **8
incongruenze** note e le **3 regole ricostruite dall'archivio** invece che lette non sono debito
documentale: sono **difetti di prodotto**. Un utente nuovo non ha dieci anni di consuetudine per
colmare un buco del testo.

**e) Il fossato non è trasferibile.**
Dieci stagioni di archivio sono metà della bellezza del sito: albo d'oro, carriera, andamento,
bacheca. **Una lega nuova, il primo giorno, non ha niente di tutto questo.**

**f) "App" non è definito.**
Oggi esiste un sito React da 892 KB. *«Scaricando l'App»* implica gli store — o una PWA. Sono
universi diversi per costo, per competenze e per vincoli. **Nessuno l'ha ancora deciso.**

## 4. Posizioni

*Da compilare da ciascun ruolo, con il criterio in chiaro — non la preferenza.*

### Direttore Sportivo
> *(vuoto — convocare in una sessione aperta in `caprera-web`)*

### Magazziniere
> *(vuoto)*

### Curatore
> *(vuoto)*

### Addetto Stampa
> *(vuoto)*

### Preparatore
> *(vuoto)*

### Team Manager
> *(vuoto)*

## 5. Sintesi

*La scrive il Segretario quando le posizioni ci sono. Non prima: una sintesi senza posizioni è
un'opinione travestita.*

## 6. Sentenza

*La pronuncia il Direttore Sportivo. Poi diventa un ADR in `../../../caprera-dati/ADR/`.*
Numerazione: **ADR-004 è già prenotato** per la riproducibilità del database, da scrivere solo
dopo che l'export delle migrazioni esiste ed è stato provato. Questa sentenza sarà **ADR-005**.

---

## Nota del Segretario — dove partire, dopo la risposta di L0 sui voti

Avevo consigliato di partire **dai voti**, perché è l'unico nodo che può rendere la visione
*impossibile* invece che *costosa*. L0 ha risposto il 22/08: **non c'è alternativa praticabile
oggi, si continua con Fantapazz e la Shiny.** La raccomandazione decade, e correttamente: una
dipendenza che non hai modo di sostituire non è un problema da risolvere, è un vincolo da
dichiarare — e adesso è dichiarato, con la sua condizione di riesame (*il primo utente che non è
uno dei dieci*).

**Avevo poi indicato `lega_id` come primo, e anche quella era sbagliata**: la struttura c'era già
(vedi il fatto **a**, corretto). Il lavoro vero è il predicato di lega nelle politiche e nelle
finestre — reale, ma bounded, e **non cresce da solo** come avevo scritto.

**Il primo, allora, è il regolamento** — fatto **d**. È l'unico nodo che *è* il prodotto: Jobs
Act, Cura Caprera e gli stipendi sono la ragione per cui qualcuno dovrebbe scaricare la Caprera
League invece di aprire Fantapazz. Otto incongruenze note e tre regole ricostruite dall'archivio
invece che lette significano che **il prodotto non è ancora scritto**, e nessuna quantità di
codice lo compensa. È anche l'unico che non dipende da noi: lo ratifica la Presidenza, e i tempi
sono i suoi. **Va avviato adesso proprio perché matura lentamente.**

**E c'è una cosa da fare prima ancora, che costa un'ora:** definire *«dalla Shiny, in qualche
modo»*. È la frase con cui L0 ha descritto il percorso degli aggiornamenti di questa stagione, e
*in qualche modo* non è una procedura. Oggi i dati storici sono arrivati come export passati a
mano, con il codice società annegato dentro **HTML della dashboard R** — sta scritto in
`SPIEGAZIONI/CONCEPT_Architettura_Dati.md`. Se è così che entreranno anche i risultati di ogni
giornata, allora la lega gioca su un passaggio manuale che nessuno ha scritto.

Territorio del **Team Manager**: è traffico che entra da fuori. Costa poco e toglie di mezzo la
sorpresa peggiore — quella che arriva di lunedì, a giornata finita.
