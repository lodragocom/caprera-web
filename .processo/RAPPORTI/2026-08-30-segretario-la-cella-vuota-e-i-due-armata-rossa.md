# 2026-08-30 · segretario · La cella vuota, e i due Armata Rossa

> Costruendo la penna per gli atti di governo ho misurato se il registro tornasse coi saldi.
> Non tornava: **50 righe su 70**. Le venti che mancavano hanno raccontato tre cose diverse, e
> **una sola era colpa nostra**.

**Stato:** chiusa la nostra · **due segnalazioni a L0 e Guido**

---

## Dove eravamo, e dove siamo

| | prima | adesso |
|---|---|---|
| riconciliazione `movimenti` ↔ `finanze` | 50/70 | ✅ **58/60** |

Il denominatore cambia perché il 2020-21 non ha una stagione precedente: confrontarlo era un
errore mio.

## 1 · La cella vuota — l'unico difetto nostro, e chiuso

Nel foglio di Guido (*Vincite 2021-22*, blocco D13:G25) l'FPF ha **dieci righe**: chi ha pagato la
quota e chi no. Ma la colonna «Crediti» è scritta **solo per i tre che non hanno pagato**, dove
vale `0.0`. Per gli altri sette la cella è **vuota**, perché il valore era sottinteso: due crediti.

> **Al caricamento la cella vuota è stata letta come «niente» invece che come «il valore
> normale».** Le sette righe sono sparite, e con loro 14 crediti.

Il buco si vedeva da qui: la somma dei movimenti 2021-22 mancava di 2 su **esattamente** le sette
società che nel 2022-23 hanno `finanze.ffp = 2`. Sette su sette, e le tre con `ffp = 0` tornavano.

⚠️ **«Odessa» nel foglio è armata-rossa** — «Ska..rsi Odessa» sta in `societa_nomi_storici`. Le
società cambiano nome fra una stagione e l'altra (L0: *«ogni tanto cambiano i nomi»*), ed è il tipo
di dettaglio che fa fallire un caricamento in silenzio.

**Riparato:** 2022-23 da 3/10 a **10/10**.

## 2 · Smit non era rotto: era sbagliata la mia formula

Smit sembrava avere 8 crediti di troppo nel 2026-27. Non ne aveva: **l'assicurazione non entra in
`bonus`**, ha una colonna sua. `23 − 8 = 15`, che è il bonus al centesimo.

E la colonna vale **6** dove il registro dice **8**, perché `finanze.assicurazione` è già al netto
dei 2 dell'assicurazione obbligatoria.

> Avevo dichiarato uno scarto senza aver capito cosa stavo sommando. La formula giusta esclude
> `mercato` **e** `assicurazioni`: il primo nasce dalle compravendite, il secondo ha un contenitore
> suo.

## 3 · Due che restano, e sono del foglio — non nostri

### Armata Rossa 2023-24, +2 — **il foglio ha due volte la stessa società**

Blocco FPF del 2023-24, righe 27 e 36: **`ArmataRossa` compare due volte**, entrambe `ok` con
`2.0`. Sono **undici righe per dieci società**, e tutte e dieci sono già presenti altrove
nell'elenco: non è una società dimenticata, è una riga in più.

Il nostro caricamento ha copiato fedelmente, e ha fatto bene.

### Sporting Mangiapreti 2023-24, +1 — il foglio non torna con sé stesso

Il registro dice 5: Capocannoniere 2º (+1), Fantapunti 3º (+1), Fair Play 3º (+1), FPF (+2). **Sono
esattamente le quattro voci del foglio.** Ma `finanze` del 2024-25 ne porta 4.

*(Nota di lettura: nel foglio il Fantapunti 3º è intestato a «Magiapreti», senza la n. Il nome è
stato riconosciuto lo stesso, ma è un altro modo in cui una riga può sparire.)*

## Cosa serve — e cosa NON va fatto

**A L0 e Guido:** le due righe sopra. La domanda è la stessa per entrambe — *vale il foglio o
valgono le finanze?*

⚠️ **Non si correggono qui.** Sono la trascrizione fedele di una fonte, e cambiarle farebbe
divergere in silenzio l'archivio dal foglio. Se una è sbagliata **si registra un atto che la
corregge**, come uno storno e non come una gomma — che è precisamente la regola scritta stamattina
in `cancella_atto`, e questo è il suo primo caso reale.

## Il pattern

> **Uno scarto regolare non è un errore diffuso: è una regola che manca.**

Venti righe sbagliate sembravano un caricamento fatto male. Erano tre cose: una definizione
implicita in una cella vuota, una mia formula incompleta, e due refusi in una fonte scritta a mano
sei anni fa. **Nessuna delle tre era «i dati sono sporchi»**, che è la spiegazione che viene per
prima e non spiega niente.

E il segnale che ha aperto tutto era il più semplice possibile: **sette società sbagliavano dello
stesso identico numero.** Quando lo scarto è uguale per tutti, non è rumore — è una voce che manca.
