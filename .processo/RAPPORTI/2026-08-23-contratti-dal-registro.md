# 2026-08-23 · I contratti veri, e le quotazioni che adesso contano

> Il foglio che hai mandato non era un aggiornamento: era **il registro**. In archivio ce n'era una
> fotocopia vecchia e sbiadita.

---

## 1 · Avevi ragione sui crediti, e i numeri lo dicono

Avevo tenuto fuori dai conti le quotazioni di ripiego per non mescolare due date. Tu hai detto:
*«se no il valore della rosa non è totale, è finta»*. Ecco il conto, sul Prosecco 2025-26:

| | giocatori contati | valore rosa | crediti spesi | crediti per punto |
|---|---|---|---|---|
| prima, solo settembre | 30 su 31 | 325 | 256 | **0,788** |
| adesso, col ripiego | **31 su 31** | **337** | **265** | **0,786** |

Il rapporto si muove di **due millesimi**. Il valore della rosa invece guadagna un giocatore intero
e i crediti spesi diventano quelli veri: 265, che è esattamente quello che c'è scritto sul foglio
d'asta. Un buco del 3% su un totale è molto peggio di uno spostamento dello 0,2% su un rapporto.

Corretto anche il confronto con la lega: usa lo stesso ripiego. Se il tuo rapporto contasse i
giocatori di gennaio e quello della lega no, sarebbe un confronto fra due conti fatti con regole
diverse.

**Resta fuori una cosa sola**: il verde e il rosso dell'«affare». Quello confronta quanto hai pagato
all'asta con quanto valeva *quel giorno*, e su chi quel giorno non era in Serie A non è un giudizio
severo — è un giudizio su una scommessa che non hai mai fatto. Il numero c'è e conta; il colore no.

## 2 · «Comprato» è diventato **asta**

Quattro pastiglie: **uscito**, **gennaio**, **contratto**, **asta**.

## 3 · I contratti: c'era una fotocopia sbiadita

Quello che avevamo in archivio erano **140 righe** estratte da una versione vecchia dello stesso
foglio: si fermavano al 2024-25, non avevano **nessuna** clausola, e sei righe portavano il nome
della società appiccicato a quello del giocatore.

Il tuo foglio ne ha **186**, con **63 clausole**, e i nomi scritti come li scrive l'archivio —
*Bastoni A.*, *Martinez L.*, *Carlos Augusto*. Si legge senza margini: 186 righe, **zero non
capite**, zero buchi in mezzo a un contratto, zero nomi che cambiano dentro la stessa riga.

**Verificato prima di sostituire:** tutte e 140 le righe vecchie ci sono anche nel nuovo, sotto lo
stesso nome o sotto una grafia migliore. Non si è perso niente.

### Cosa cambia in pagina

Sul 2025-26 i contratti attivi passano da **12 a 69**. Sul Prosecco da 1 a 6: **Bastoni A.,
Barella, Thuram, Neres, Sucic, Esposito Pio** — i tre che mi avevi indicato ci sono tutti.

| società | contratti 2025-26 |
|---|---|
| Smit | 8 · Subbuteo 8 · Prosecco 7 · Real Monghi 7 · Sanguemisto 7 · Aston Ville 7 · Disperata 7 |
| Armata Rossa | 6 · Roburro 6 · Mangiapreti 6 |

Il Prosecco ne ha 7 in archivio e 6 in pagina: **Bijol** ha il contratto ma ha lasciato la Serie A.

### Una migrazione che è servita per forza

`contratti.alla` era agganciato alle stagioni *giocate*, e `anni` si fermava a cinque. Il registro
li smentisce tutti e due: **Barella arriva al 2026-27** (sei anni), Mancini e Calhanoglu a sette,
e sette contratti finiscono nel 2027-28.

Ho tolto la chiave esterna su `alla` — mettendo il 2026-27 fra le stagioni per farla passare
avrebbe fatto comparire una stagione vuota in tutti i menu a tendina del sito, che è la coda che
muove il cane — e l'ho sostituita con un controllo di forma. `dalla` resta agganciato: un contratto
comincia sempre in un anno che c'è stato, e per tutti e 186 è vero.

## 4 · Le tue tre risposte, sistemate

**Bastoni → Bastoni A.** Risolto alla radice: nel registro nuovo si chiama già così. La pagina lo
aggancia da sola.

**Ibanez** era davvero sotto contratto col Prosecco — 2022-23 e 2023-24. La riga spazzatura
`Pro Secco⎵⎵⎵Ibanez` era un artefatto dell'estrazione vecchia: sparita con tutte le altre cinque.

**Lauriente** → in lista, non risolto. Risulta al Mangiapreti e gioca nel Subbuteo. Da quando mi
hai detto che i giocatori sotto contratto si possono scambiare, la pagina non lo chiama più errore:
dice le tre possibilità e lascia la domanda aperta.

## 5 · Cosa dice la nota sotto la rosa

> *2 contratti attivi non trovano il giocatore in rosa: Pafundi (C, fino al 2025-26), Kayode (D,
> fino al 2026-27). O ha lasciato la Serie A, o è stato scambiato — un giocatore sotto contratto si
> può scambiare — o il nome è scritto in due modi fra la rosa e il foglio dei contratti.*

## 6 · Il collaudo

```
mercato 2025-26 · righe 36 · senza quotazione 0 · di maggio 3
                · asta 20 · contratto 6 · gennaio 5 · uscito 5
```

20 + 6 = 26 rimasti a maggio, + 5 presi a gennaio = 31. E 26 + 5 usciti = 31 a settembre. I conti
si chiudono da tutte e due le parti.

Collaudo sito: nessun problema. Collaudo area: nessun problema.

## Ancora da fare, dalla tua lista

1. **Lauriente** — verificare se è uno scambio o un refuso *(tua)*
2. **La scheda dei portieri non è allineata** con le altre — colonne diverse
3. **Ammonizioni ed espulsioni** in tabella — i dati ci sono, in `v_carriera`
4. **«La mia rosa»: stato attuale, poi lo storico** — la ristrutturazione che hai chiesto
5. Il file **Statistiche Serie A 2025-26** che hai mandato: ancora da guardare
6. Il **2024-25**, quando ci arriviamo

## File toccati

- `src/pages/area/sezioni.jsx` — i totali col ripiego, «asta», la nota a tre possibilità
- `src/pages/area/sezioni.css` — la pastiglia rinominata
- `caprera-dati/SUPABASE/08-contratti.sql` — **nuovo**, le due migrazioni
- `caprera-dati/SUPABASE/dati/contratti.sql` — **nuovo**, i 186 contratti
