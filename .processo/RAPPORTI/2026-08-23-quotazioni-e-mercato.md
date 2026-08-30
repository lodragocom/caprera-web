# 2026-08-23 · Quotazione per tutti, e la colonna «Mercato» che dice come sei arrivato

> Da 30 su 31 a **31 su 31**. E ogni riga adesso dice se l'hai comprato o se ce l'avevi già.

---

## 1 · La quotazione che mancava

Avevi ragione: erano giocatori arrivati in Serie A dopo. Il listone di partenza è del **30 agosto**;
chi è sbarcato in Italia a gennaio non ci poteva essere. Sono questi, e **hanno tutti** una
quotazione di fine stagione:

| società | senza quotazione di settembre |
|---|---|
| Prosecco | Akanji, Fullkrug, Vaz |
| Smit | De Marzi, Sherri, Tsimikas, Zhegrova, Hojlund, Kulenovic |
| Disperata | Boga, Openda, Trepy |
| Sanguemisto | Motta, Elmas, Taylor |
| Subbuteo | Diego Carlos, Rabiot, Gandelman |

Adesso la colonna **Quot.** mostra quella di maggio, **in corsivo e sottolineata a puntini**, e
passandoci sopra dice perché: *«Non era sul listone di settembre: è arrivato in Serie A dopo.»*
Righe senza quotazione, su tutte e dieci le società: **zero**.

### Una cosa che ho fatto e che vale la pena dirti

**Si mostra, ma non si conta.** Nei totali — «crediti per punto di quotazione», la crescita da
settembre a maggio, il confronto col mercato della lega — resta dentro solo la quotazione **vera**
di settembre.

Se ci infilassi quella di maggio, il totale diventerebbe un numero misto che nessuno può più
smontare, e la crescita di Fullkrug verrebbe fuori «maggio meno maggio = zero», che è uno zero
falso. Il numero che vedi in tabella serve all'occhio; i conti restano puliti.

## 2 · La colonna «Mercato»

Prima diceva qualcosa solo per i dieci che si sono mossi a gennaio, e per gli altri ventisei era un
trattino. Adesso ogni riga dice come è arrivata, con quattro pastiglie:

| | |
|---|---|
| **uscito** (rosso) | c'era a settembre, a maggio no |
| **gennaio** (verde) | non c'era a settembre, è arrivato dopo |
| **contratto** (oro) | ce l'avevi già: all'asta non è passato |
| **comprato** (grigio) | l'hai preso all'asta |

Sul Prosecco: **25 comprati, 1 contratto (Thuram), 5 usciti, 5 presi a gennaio**.

Contratto e comprato non sono verde e rosso: non sono buono e cattivo, sono due modi di essere
arrivato. Oro per il contratto perché è la cosa rara, grigio per l'asta perché è la regola.

## 3 · I contratti: cinque cose da guardare, e non le ho toccate

Qui mi fermo e te le giro, perché sono decisioni tue.

**a) «Bastoni» contro «Bastoni A.»** — il contratto del Prosecco dice *Bastoni*, la rosa dice
*Bastoni A.* Stesso giocatore, stesso ruolo, stessa Inter. La pagina **non li aggancia**, e mostra
«comprato» di uno che comprato non è.

Non ho messo un aggancio per cognome **apposta**: in Serie A i Bastoni sono due, e tirare a
indovinare qui vuol dire attribuire un contratto a chi non ce l'ha. È il decimo refuso, dopo i
nove di ieri. Se mi dici che è lui, correggo il nome nel contratto in trenta secondi.

**b) Lauriente** è sotto contratto allo **Sporting Mangiapreti**, ma in rosa sta al **Subbuteo** —
e con un ruolo diverso (C nel contratto, A in rosa). O il contratto è passato di mano, o una delle
due fonti sbaglia.

**c) Chiesa, Gonzalez N, Pafundi, F. Anderson** hanno un contratto attivo fino al 2025-26 ma non
sono in nessuna rosa: hanno lasciato la Serie A. Questo è normale, non è un errore.

**d) Nei contratti del Prosecco c'è una riga spazzatura**: `Pro Secco⎵⎵⎵…⎵⎵Ibanez`. Non aggancia
niente e non fa danni, ma sta lì.

**e) Sulle stagioni vecchie contratti e rose non concordano.** Nel 2022-23 il Prosecco risulta
avere sotto contratto **Kean, Lukaku e Zalewski**, che quell'anno erano del Sanguemisto e
dell'Armata Rossa.

Per questo la colonna «Mercato» **esce solo dove c'è la rosa d'asta** — oggi il solo 2025-26.
Finché non si capisce quale delle due fonti ha ragione, «contratto» sulle stagioni vecchie sarebbe
una cosa scritta come se la sapessimo. Quando arriva la rosa d'asta del 2024-25, la colonna la
segue.

### E intanto la pagina lo dice

Sotto la rosa c'è una nota che nomina i contratti attivi che non trovano nessuno:

> *Un contratto attivo non trova il giocatore in rosa: Bastoni (D, fino al 2025-26). O ha lasciato
> la Serie A, o il nome è scritto in due modi fra la rosa e il foglio dei contratti. Da guardare,
> non da ignorare.*

Un contratto che sparisce in silenzio è peggio di un contratto sbagliato: nessuno lo cerca.

## 4 · Un difetto che il banco di prova ha preso al volo

La funzione nuova l'avevo chiamata `mercato`, e dentro quella pagina `mercato` era già il nome del
confronto coi prezzi della lega. La pagina è andata in bianco con *«K is not a function»* — un
errore che, se fosse arrivato in produzione, avrebbe fatto sparire tutta «la mia rosa». Rinominata.

## 5 · Il collaudo

Tre controlli nuovi, tutti sull'invariante e non sul caso di oggi:

```
mercato 2025-26 · righe 36 · senza quotazione 0 · di maggio 3
                · comprato 25 · gennaio 5 · uscito 5 · contratto 1
```

- **nessuna riga senza quotazione** — se il ripiego smette di funzionare, si ferma
- **nessuna cella «Mercato» vuota** — una riga che il sito non sa raccontare è un difetto
- **usciti = presi a gennaio**, contati dalle pastiglie — lo stesso invariante della scheda del
  mercato, ma letto da un'altra parte della pagina: se le due si scollano, se ne accorge

Collaudo sito: nessun problema. Collaudo area: nessun problema.

## File toccati

- `src/pages/area/sezioni.jsx` — il ripiego sulla quotazione, l'indice dei contratti, la colonna
- `src/pages/area/sezioni.css` — le due pastiglie nuove, la quotazione di ripiego, la nota
- `collaudo/collaudo-area.mjs` — i tre controlli
- `collaudo/scatto-rosa.mjs` — **nuovo**, per fare le fotografie della rosa
