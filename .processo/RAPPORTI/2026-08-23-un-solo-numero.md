# 2026-08-23 · Un solo numero per la stessa rosa

> Avevi visto giusto: **31 su 31 quotati** in testa e **30 giocatori, 325 a settembre** più giù.
> Due conti sulla stessa rosa, nella stessa pagina, che non combaciavano.

---

## 1 · Come sono calcolate le presenze

Domanda giusta, perché il numero sorprende. **Pres. = le partite in cui il tuo mister l'ha messo in
distinta e il giocatore ha preso un voto** — e sono **tutte le competizioni insieme**.

Maignan, 2025-26, 48:

| | in distinta | titolare | entrato | con voto |
|---|---|---|---|---|
| campionato | 35 | 26 | 9 | **35** |
| qualificazione Champions | 8 | 7 | 1 | **8** |
| Europa League | 3 | 2 | 1 | **3** |
| Coppa Italia | 2 | 2 | 0 | **2** |
| | | | | **48** |

Non è quante partite ha giocato in Serie A — quella è un'altra cosa e sta nella sua scheda. È
**quante volte è sceso in campo per te**. Ho messo «campionato e coppe insieme» nella spiegazione
della colonna, perché prima non lo diceva.

Se preferisci il solo campionato, o le due cose separate, si fa: serve aggiungere la competizione a
`v_carriera`, che oggi somma tutto.

## 2 · I due riquadri adesso dicono lo stesso numero

Il valore in testa contava **31** giocatori (con il ripiego sulla quotazione di maggio, come hai
chiesto). La scheda «quanto valevano a fine stagione» ne contava ancora **30**, perché filtrava
sulla quotazione vera di settembre. Nessuno dei due era rotto: contavano **insiemi diversi** — ed è
per questo che non se ne accorgeva nessuno finché non li si metteva uno accanto all'altro.

Adesso è uno solo:

> **31 giocatori quotati: 337 a settembre, 385 a maggio · +48**

Cresciuti in mano tua: Paz 22→43, Esposito Pio 12→29, Thuram 30→46.
Scesi: Dovbyk 27→11, Neres 16→8, Bastoni A. 18→11.

## 3 · Un difetto che avevo introdotto io ieri

Allargando il conto a 31, **«Pagati più di quanto valgono» ha iniziato a pescare anche chi la
quotazione di settembre non ce l'ha**. In JavaScript `17 - null` fa `17`: Fullkrug, pagato 17,
sarebbe comparso fra i pagati-troppo con un **+17 inventato di sana pianta**.

Quella classifica giudica **com'è andata l'asta**, e uno che il giorno dell'asta non era in Serie A
all'asta non c'era. Adesso ci entra solo chi una quotazione di settembre ce l'aveva. Il valore
della rosa invece li conta tutti e trentuno, come volevi tu: sono due domande diverse.

Controllato: nelle due liste non c'è nessuno dei tre.

## 4 · «Cosa non c'è» era invecchiato in due punti su tre

**Ingaggi** — diceva «vuota su tutte e 140 le righe di contratto». Adesso legge dall'archivio: *«Di
questa società l'archivio tiene 20 contratti, e 7 portano la clausola di riscatto. L'ingaggio no.»*
La clausola è arrivata ieri col registro; l'ingaggio manca ancora davvero.

**Che giorno è la quotazione** — diceva «per il 2025-26 c'è il listone di partenza, per le nove
stagioni prima solo quello di fine». **Falso da due giorni**: ci sono anche 2020-21 e 2024-25. È la
stessa frase che avevo già trovato falsa una volta, in un altro punto della pagina.

Non l'ho riscritta con l'elenco giusto — **l'ho fatta chiedere all'archivio**, come l'altra:

> *Il listone di partenza l'archivio ce l'ha per **2020-21, 2024-25 e 2025-26**. Questo elenco non è
> scritto qui: lo chiediamo all'archivio ogni volta, così non invecchia.*

Aggiunto anche il paragrafo sul ripiego, che prima non era spiegato da nessuna parte.

**Squalificati e infortunati** era ancora vero: l'ho lasciato.

## 5 · La squadra vera come chiave, come hai detto

Fofana del Milan e Fofana dell'Udinese hanno lo stesso cognome e lo stesso ruolo: nome e ruolo non
li distinguono, **la maglia sì**. L'aggancio col listone adesso prova nome+ruolo, poi
**nome+squadra**, e solo alla fine il nome da solo.

Il club si usa **dopo** il ruolo e mai al posto suo, e c'è una ragione: sui listoni delle stagioni
vecchie il club è quello di **oggi**, non quello di allora — nel listone 2016-17 Cristiano Ronaldo
risulta alla Juventus. Come indizio in caso di dubbio vale; come chiave no.

## 6 · Il collaudo

Un controllo nuovo, ed è quello che avresti fatto tu:

```
quotati 2025-26 · in testa 31 · nella crescita 31
```

Se i due riquadri della stessa rosa tornano a dire numeri diversi, si ferma.

Collaudo sito: nessun problema. Collaudo area: nessun problema.

## Ancora da fare

1. **Presenze divise per competizione**, se le vuoi separate
2. **«La mia rosa»: stato attuale e storico** affiancati
3. **19 omonimi** nelle altre nove stagioni
4. **Lauriente** *(tua)*
5. Il file **Statistiche Serie A 2025-26**
6. Il **2024-25**

## File toccati

- `src/pages/area/sezioni.jsx` — la crescita sullo stesso insieme, gli affari filtrati,
  «Cosa non c'è» che legge dall'archivio, il club come chiave di riserva
- `collaudo/collaudo-area.mjs` — il controllo dei due riquadri
