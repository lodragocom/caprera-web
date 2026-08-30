# 2026-08-23 · I numeri della stagione, non della carriera

> Barella diceva **268 presenze e 26 gol** mentre guardavi il 2025-26. Erano sei stagioni sommate.
> Adesso dice **44 e 4**, che è quello che ha fatto quest'anno.

---

## 1 · Presenze, gol e assist erano totali di carriera

Avevi ragione. Da **Pres.** in poi la tabella mostrava tutto quello che quel giocatore aveva fatto
con quella maglia in tutte le stagioni. Sul Prosecco:

| | prima | adesso |
|---|---|---|
| Barella | 268 pres · 26 gol · 48 assist | **44 · 4 · 11** |
| Paz | 94 pres · 21 gol · 22 assist | **46 · 14 · 8** |

L'unica colonna che parla ancora di tutti gli anni è **Con noi**, e c'è scritto nella nota. Il resto
è la stagione che stai guardando.

## 2 · La colonna «FM» non era la fantamedia

Diceva FM e mostrava la **media voto**. Sono due cose diverse e adesso ci sono tutte e due:

- **MV** — la media dei voti nelle partite in cui **tu** l'hai schierato
- **FM** — la fantamedia che Fantapazz gli dà in Serie A, su **tutte** le sue partite

Non è pignoleria: **Neres** ha MV 6,44 su 17 partite tue e FM 6,84 su quelle che ha giocato al
Napoli. Uno che gioca trenta giornate e che tu metti in campo sette volte ha due numeri diversi, ed
è giusto così.

## 3 · Le quattro schede adesso sono allineate

Diciannove colonne, **le stesse per portieri, difensori, centrocampisti e attaccanti**:

```
CALCIATORE · CLUB · COSTO · QUOT. · QUOT. FINE · MERCATO · CON NOI ·
PRES. · MV · FM · GOL · ASSIST · RIG. · RIG. SB. · AMM. · ESP. · IMB. · GOL SUB. · RIG. PAR.
```

Ci sono le cose che mi hai chiesto: **ammonizioni, espulsioni, rigori segnati, rigori sbagliati,
rigori parati, gol subiti**.

**Imb.**, **Gol sub.** e **Rig. par.** riguardano solo i portieri: negli altri reparti la casella
resta **vuota, non a zero**. Uno zero è un dato — «zero gol» vuol dire qualcosa; «zero porte
inviolate» di un attaccante non vuol dire niente.

Stessa distinzione per chi non è mai sceso in campo: **trattino, non zero**. Dire che un giocatore
mai schierato ha fatto zero gol è come dire che ha fallito un esame che non ha dato.

## 4 · Un difetto vero, e non era di ieri

Sistemando le colonne è saltato fuori che **Fofana risultava «mai schierato»** pur avendo giocato
19 partite per il Prosecco.

Il motivo: `rose.calciatore` era stato ricavato dal **nome**, e dove in dieci anni di Serie A due
giocatori portano lo stesso cognome la riga si è agganciata al più vecchio dei due. Ce ne sono
**undici** nel 2025-26:

> Fofana, Colombo, Di Gennaro, Furlanetto, Gabriel, **Pavlovic**, Lukaku, Pedro, Castro, Joao Mario

Non è un dettaglio anagrafico. `v_carriera` unisce le formazioni alla rosa **per id**: con l'id
sbagliato il collegamento salta e il giocatore risulta mai schierato, con tutte le caselle vuote —
**Pavlovic aveva giocato 46 partite**. E il link sul nome portava alla scheda di un altro.

Chi ha ragione sono le **formazioni**: lì l'id viene dal dato di partita, non da una ricerca per
nome. Verificato che tutti e dieci gli id vecchi appartengono a giocatori che nel 2025-26 non sono
mai scesi in campo. Corrette le 13 righe.

**Ne restano 19 nelle altre nove stagioni** — 2024-25 ne ha 8, 2020-21 tre, 2021-22 tre, 2022-23
tre, 2019-20 e 2023-24 una ciascuna. Non le ho toccate: si fanno stagione per stagione, come le
rose.

## 5 · Un controllo che non poteva fallire

Ne ho scritto uno che si ferma se le presenze di una stagione superano 70 — 36 giornate più le
coppe, oltre non è una stagione, è una carriera nella colonna sbagliata. Cercava la colonna
`Pres.`, ma il CSS scrive le testate in maiuscolo e `innerText` restituisce `PRES.`: **non trovava
niente, e il controllo passava sempre**.

Un controllo che non fallisce mai non è un controllo, è una rassicurazione. Corretto, e verificato
che adesso legge i numeri veri:

```
colonne 2025-26 · 4 reparti, 1 testata uguale
                · presenze più alte {"P":50,"D":49,"C":46,"A":41}
```

Coi totali di carriera sarebbe stato 268, e si sarebbe fermato.

## 6 · Il collaudo

Due controlli nuovi:

- **le quattro testate devono essere identiche** — se un reparto ha colonne diverse, le tabelle non
  si allineano e si ferma
- **le presenze devono stare dentro una stagione** — il controllo del punto 5

Collaudo sito: nessun problema. Collaudo area: nessun problema.

## Ancora da fare

1. **«La mia rosa»: stato attuale, poi lo storico** — questa è la metà «attuale». Lo storico adesso
   sta nella scheda del calciatore e nelle due classifiche in fondo alla pagina; una vista dedicata
   è la prossima cosa.
2. **19 omonimi** nelle altre nove stagioni
3. **Lauriente** — scambio o refuso *(tua)*
4. Il file **Statistiche Serie A 2025-26**
5. Il **2024-25**

## File toccati

- `src/pages/area/sezioni.jsx` — i numeri della stagione, le 19 colonne, MV e FM separate
- `src/pages/area/sezioni.css` — cartellini, colonne che scorrono
- `src/lib/archivio.js` — `carrieraSocieta` porta anche rigori sbagliati, parati e autogol
- `collaudo/collaudo-area.mjs` — i due controlli nuovi
- migrazione `caprera_rose_omonimi_2025_26`
