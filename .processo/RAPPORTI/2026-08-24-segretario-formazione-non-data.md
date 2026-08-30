# 2026-08-24 · segretario · La formazione non data non è un'assenza: è un orario che non cambia

> Seconda prova del livello 1 («far calcolare al sistema ciò che il regolamento prescrive»), fatta
> mentre il Magazziniere lavorava alle Supercoppe. **Non ho scritto niente nel database né in
> `SUPABASE/`**, per non incrociarlo.

**Stato:** FATTO come verifica · **7 casi su 7** riprodotti dal registro di Guido

---

## Da dove è partita

Avevo lasciato a L0 una domanda: *«una giornata saltata conta come formazione non data? Nei dati
sono indistinguibili — formazioni vuote in entrambi i casi.»*

**Erano distinguibili, e la domanda era mal posta.** Una giornata saltata ha **tutte e dieci** le
società vuote; una formazione non data ne avrebbe **una sola**.

Contato su dieci stagioni:

```
giornate normali                         353
giornate saltate (tutte e dieci vuote)     6
FORMAZIONI NON DATE (solo alcune vuote)    0
```

**Zero.** Non esiste una sola giornata in cui una società è vuota e le altre no. Eppure il registro
di Guido ha **sette penalità** per formazione non data.

## Perché: Fantapazz non lascia il vuoto

Il caso che lo prova è l'unico del registro che porta la giornata — **«Formazione non data 36a»,
Prosecco, 2025-26**. Quella formazione **esiste**, con 26 giocatori. Ma:

| società | inviata |
|---|---|
| **prosecco** | **Domenica 17 Mag – 11:37** |
| tutte le altre nove | Giovedì 21 o Venerdì 22 Mag |

**Il Prosecco non l'ha mandata: Fantapazz ha tenuto quella della giornata precedente.**

> **La formazione non data non è un'assenza: è un `inviata` che non cambia.**

Nell'audit del regolamento avevo scritto che era calcolabile *«perché una formazione mancante è
l'assenza di una riga»*. **Sbagliato.** La riga c'è sempre — cambia solo l'orario.

## La regola, e la verifica

**Rilevamento:** per ogni società e stagione, una formazione è «non data» se il suo `inviata` è
**identico a quello della giornata precedente**.

Girata su dieci stagioni e confrontata col registro di Guido, che copre dal 2020-21:

| registro di Guido | rilevato | giornata |
|---|---|---|
| 2020-21 · roburro | ✓ | 31 |
| 2022-23 · prosecco | ✓ | 35 |
| 2022-23 · sporting-mangiapreti | ✓ | 31 |
| 2023-24 · armata-rossa | ✓ | 28 |
| 2023-24 · prosecco | ✓ | 35 |
| 2024-25 · prosecco | ✓ | 20 |
| 2025-26 · prosecco «36a» | ✓ | **36** ✓ |

**Sette su sette.** Stesse stagioni, stesse società. E il **2021-22**, dove il registro non ha
penalità, **non produce rilevazioni** — che è la metà della prova che di solito nessuno guarda.

**In più, il calcolo dà la giornata**, che il registro non registra (tranne in un caso, dove
coincide).

E trova otto casi anche **prima del 2020-21**, dove il registro non arriva: 2016-17 → 2019-20,
inclusa una Casata dei Draghi che in una stagione non ha rimandato la formazione cinque volte.

## Due cose che non tornano, e le dico

**1 · Roburro 2020-21 ha preso −3, non −1.** Nella scala del regolamento (−1 la prima volta, −3 la
seconda, −5 dalla terza) il −3 è la **seconda** infrazione. Ma ne rilevo **una sola**, e ho
controllato anche le coppe: una sola.

Tre spiegazioni possibili, e non so quale sia: la scala conta **fra stagioni** e non dentro la
stagione; c'era una prima infrazione che il metodo non vede; oppure quel −3 è stato applicato per
altro. **Serve L0 o Guido.**

**2 · Il metodo è cieco sulla prima giornata giocata.** Se una società non manda la formazione alla
sua prima giornata, non c'è una precedente da cui copiare — quindi non c'è un `inviata` da
confrontare. **Non rileverei mai una prima giornata.** È un limite strutturale, non un bug, e
potrebbe spiegare il punto 1.

## Cosa se ne ricava

**Il livello 1 ha una seconda voce calcolabile**, ed è più preziosa dei diritti TV: la formazione
non data è **una penalità**, quindi tocca i crediti in negativo — ed è l'unica delle sette voci
«atto della Presidenza» che si è rivelata **derivabile dai dati**.

E vale il pattern già annotato ieri: **un calcolo che riproduce un registro è insieme una funzione
e un collaudo.** Qui ha fatto tre cose in una: ha confermato la regola, ha trovato la giornata che
il registro non aveva, e ha sollevato una domanda sulla scala delle penalità.

## Handoff

- **magazziniere** → la vista, quando avrà finito con le Supercoppe. Il rilevamento è una
  `lag(inviata) over (partition by stagione, societa order by giornata)`; il conteggio della scala
  −1/−3/−5 dipende dalla risposta sul punto 1.
- **L0 o Guido** → perché Roburro ha preso −3 nel 2020-21 con una sola infrazione rilevata. E: **la
  scala si conta dentro la stagione o fra stagioni?** Il regolamento dice «1a, 2a, dalla 3a» senza
  dire di cosa.

## Pattern imparato

**Quando una cosa non si trova, controlla di averla cercata nella forma giusta.**

Cercavo un'assenza — una riga che manca. La formazione non data si presenta come **una presenza
stantia**: tutto al suo posto, tranne un orario. Avevo perfino scritto nell'audit che era
«l'assenza di una riga», e quella frase mi ha impedito per due giorni di trovarla.

È il quarto errore dello stesso tipo in quattro giorni: `lega_id` cercato con il nome sbagliato, il
gol vittoria misurato sulla partita sbagliata, l'audit fatto sul JSON invece che sul PDF. **Ogni
volta il dato c'era.**
