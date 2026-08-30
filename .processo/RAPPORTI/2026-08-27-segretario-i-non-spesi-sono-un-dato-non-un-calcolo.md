# 2026-08-27 · segretario · I «crediti non spesi» sono un dato, non un calcolo

> Terzo collaudo fallito di fila sulla stessa quantità. Questa volta il fallimento **dice qualcosa**,
> e la conclusione è l'opposto di quella che inseguivo da due giorni.

**Stato:** la domanda è chiusa · **serve una decisione di L0**, non altro lavoro

---

## I tre tentativi

| | ipotesi | esito |
|---|---|---|
| 26/08 | `residui + movimenti` (letti come incassi) | **3/20** |
| 27/08 mattina | `residui − esborsi` (segno normalizzato) | ritirata prima di provarla — avrebbe corrotto i dati |
| 27/08 sera | `residui + regola del verso` | **2/20** |

Il Magazziniere si è fermato tutte e due le volte invece di far tornare i conti. Ha anche provato
tre letture alternative — `regola` da sola, `iniziali − spesi + regola`, la vecchia
`residui + tutti i movimenti` — e **nessuna arriva a metà**.

## Il segnale che chiude la questione

**Le due sole società che tornano sono quelle dove la regola vale zero.** Verificato:

```
regola = 0 :  armata-rossa · aston-ville · roburro · smit
tornano    :  aston-ville · roburro
```

Cioè: **tornano solo quando il calcolo non fa niente.** Nessuna delle sedici righe in cui il
predicato interviene torna mai — né con questo verso, né col precedente, né con nessuna delle
alternative.

E c'è di peggio, e nessuno l'aveva misurato: **la base è sbagliata da sola, prima di toccare
qualsiasi movimento.**

| `finanze.residui` da solo, contro Guido | esito |
|---|---|
| 2024-25 | **2/10** |
| 2025-26 | **1/10** |

> **Non stavamo sbagliando la correzione: stavamo correggendo la cosa sbagliata.** Aggiungere
> movimenti a una base che già non torna non poteva funzionare in nessuna versione.

Terza prova, misurata dal Magazziniere: nel **2025-26 Guido ha «non spesi» fra 0 e 9 su tutte e
dieci** — una banda stretta, com'è naturale per quello che avanza a fine giostra. `residui` arriva a
31, e il registro aggiunge fino a 41. **Sono grandezze di ordine diverso**, non due misure della
stessa cosa a cui manca un pezzo.

## La conclusione, ed era sotto gli occhi da ieri

`ceil(non_spesi(N)/2)` riproduce `finanze.riportati(N+1)` **dieci su dieci**. L'avevo scritta come
una curiosità. **Era la risposta.**

> Se il numero di Guido si ritrova *già dentro* il database — dimezzato, dentro il `riportati`
> dell'anno dopo — allora **non è una cosa che si calcola: è una cosa che si registra.**

L'archivio ha i «non spesi» di **ogni stagione passata**, conservati nel `riportati` di quella
successiva. L'unico che manca è quello del **2025-26**, e il suo contenitore è esattamente la riga
`2026-27` che stiamo cercando di scrivere.

**Non c'è niente da derivare. C'è un numero da chiedere.**

Per due giorni ho trattato `non_spesi` come un output. È un **input**: il residuo di fine stagione
che sta su Fantapazz, dieci numeri fra 0 e 9. Con quelli, tutto il resto è già verificato:
`ceil(/2)` 10/10, `iniziali = 250 + riportati + bonus + ffp` 20/20, le vincite 10/10 su due stagioni.

## Una correzione a un suggerimento sbagliato che avevo dato io

Nella consegna avevo scritto che fra le 19 righe a `verso` nullo ce n'erano di *«simmetriche, che
sembrano scambi»*, citando Zapata −35/+81 e Immobile −43/+120. **Il Magazziniere ha misurato e sono
coppie interne alla stessa società** — Zapata è Prosecco/Prosecco, Immobile è Smit/Smit, e così Kean,
Muriel e Zalewski.

**L'unico incrocio vero è Lukaku/Vlahović 2024-25**: Prosecco −36/+1, Armata Rossa −36/+1. Che è lo
scambio col contratto depositato del 13.09.2024, l'unico contratto di scambio dell'archivio.

Avevo dato un indizio a occhio dentro una consegna. Anche gli indizi vanno misurati prima di
scriverli, altrimenti mandano l'altro tavolo a guardare nel posto sbagliato.

## Cosa serve adesso — una decisione, non lavoro

**A L0:** i **dieci «crediti non spesi» di fine 2025-26**, letti da Fantapazz o dal registro. Sono
dieci numeri fra 0 e 9. Con quelli la riga `2026-27` si scrive e si collauda in un pomeriggio.

**Da smettere di fare:** cercare di dedurli. Tre tentativi, tre fallimenti, e il quarto sarebbe
partito dalla stessa premessa. `finanze.residui` **non è** il residuo di fine stagione e non lo
diventerà sommandoci qualcosa.

**Resta aperto e non dipende da questo:** il verso delle 19 righe (a L0), la sentenza sui cinque
crediti di Smit (a L0), e le 103 migrazioni fuori dal repository (al Magazziniere, e si può fare
subito).

## Il pattern

I due errori di ieri erano *«ho esteso una frase vera a un perimetro più largo»*. Questo è diverso e
vale la pena distinguerlo:

> **Avevo un'identità che tornava 10/10 e l'ho archiviata come curiosità invece di chiedermi cosa
> stesse dicendo.**

Un calcolo che riproduce un registro è una funzione e un collaudo — l'abbiamo scritto tre volte. Ma
un'identità che tiene *perfettamente* può anche dire una terza cosa: **che il numero non si calcola,
si copia.** Quella lettura non l'avevo considerata.
