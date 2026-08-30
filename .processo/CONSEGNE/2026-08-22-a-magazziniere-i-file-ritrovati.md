# 2026-08-22 · al Magazziniere · i file ritrovati da L0

> Consegna della sessione che lavora sul codice. L0 ha recuperato da Google Drive cinque cartelle
> di stagione in `06_caprera_project`. Le ho aperte tutte e verificate. **Non ho caricato niente.**

**Stato:** aperta · **Contiene la cosa più importante trovata oggi.**

---

## 1. ⭐ Tre listoni **di partenza**, non uno

Stamattina in archivio c'era **una sola** quotazione di partenza, il 2025-26. Adesso ce ne sono
tre, e le altre due sono **migliori** di quella che avevamo.

| file | righe | righe a zero | club | max | verdetto |
|---|---:|---:|---:|---:|---|
| `Caprera 20-21/Listone_Fantapazz.xlsx` | 691 | **0** | **20** | 53 | **partenza 2020-21** |
| `01_season_24_25/Listone_Fantapazz.csv` | 715 | **0** | **20** | 39 | **partenza 2024-25** |
| `Listone_Fantapazz.csv` (già caricato) | 680 | 0 | 21 | 37 | partenza 2025-26 |
| *per confronto:* `Listoni/…20:21.csv` | 881 | 152 | 30 | 47 | fine stagione |

**Perché sono migliori: hanno il club giusto di quella stagione.** Il 2020-21 elenca Benevento,
Crotone e Spezia — le tre promosse di quell'anno — e non nomina nessuna squadra che in Serie A non
c'era. Il 2024-25 elenca Como, Parma e Venezia. È l'opposto della colonna `Squadra` dei file in
`Listoni/`, che guarda al presente.

**Quindi qui la squadra si può caricare**, a differenza di quanto scritto in `carica-listoni.py`.
Ma **solo per questi due file**: la regola generale resta, e va scritta caso per caso.

Il formato del `.xlsx` è lo stesso del `.csv` (`Ruolo · Calciatore · Squadra · Quotazione`), solo
con i nomi di club per esteso invece delle sigle.

**Due duplicati da ignorare:** `WhatsApp Chat/00048019-Listone_Fantapazz.xlsx` è lo stesso file del
2024-25 (715 righe identiche); `Fantacalcio/Listone_Fantapazz_Prosecco copy.xlsx` è un 2024-25
parziale (661 righe) con appunti del Prosecco in colonne laterali — **non è una fonte**.

## 2. ⭐ `Caprera 25-26/Riscatti_Contratti.xlsx` — le clausole, con la regola della metà

Un foglio per società, colonne:
`Squadra · Calciatore · Ruolo · Club · Anni · Contract End · CR · Valore FP · Costo · Rinnovo · Rinnovo CR`

**`CR` è la clausola rescissoria** — quella che nel `Contratti_Storico.pdf` è il numero fra
parentesi. **`Rinnovo CR` è esattamente la metà**, e conferma la regola che L0 ha descritto:

| | CR | Rinnovo CR |
|---|---:|---:|
| Mancini | 10 | 5 |
| Pinamonti | 30 | 15 |
| Martinez L. | 110 | **55** |

### E una regola che il JSON non ha per intero

`contratti.rinnovi.sconto` dice `D 0.5, C 0.25`. Il foglio dice **tre** cose, e due non sono scritte:

1. **I difensori pagano il 50% del Valore FP, i centrocampisti il 75%, gli attaccanti il 100%.**
   Sugli attaccanti non c'è sconto: Lucca 20→20, Dybala 25→25, Scamacca 20→20, Leao 25→25,
   Lukaku 32→32, Zapata 18→18, Krstovic 24→24, Ngonge 10→10. **Otto casi, nessuna eccezione.**
2. **Si arrotonda per eccesso.** Bremer (D) 13 → 6,5 → **7**. Carlos Augusto (D) 9 → 4,5 → **5**.
   Posch (D) 3 → 1,5 → **2**. Asllani (C) 10 → 7,5 → **8**. Calhanoglu (C) 22 → 16,5 → **17**.
   Koopmeiners (C) 11 → 8,25 → **9**. **Quindici casi verificati, sempre verso l'alto.**
3. `Valore FP` è la quotazione su cui si calcola, e `Costo` è quello che risulta poi in rosa.

⚠️ **Attenzione: questo risponde solo a metà della lacuna #12** delle correzioni al regolamento.
Qui l'arrotondamento è quello dei **rinnovi**. Quello dei **risparmi riportati** — Subbuteo che
chiude con 7 residui — resta aperto, ed è un'altra regola.

## 3. Le due fonti di crediti che l'audit dava per perse

L'audit del regolamento diceva che Grigliata Serie A e Mr Champions *«vivono fuori dall'archivio»*.
**Vivono in questi file:**

- `Caprera 25-26/CAPRERA GRIGLIA 25-26.xlsx` e `SERIE A GRIGLIA 25-26.xlsx` — le griglie dei
  pronostici, una colonna per società (748 righe × 35 colonne: dentro c'è più di una griglia).
- `Caprera 24-25/CAPRERA GRIGLIA 24-25.xlsx`, `SERIE A GRIGLIA 24-25.xlsx`,
  `Serie A - Mr Champions - 24-25.xlsx`.
- `Caprera 25-26/Mr Champions -Serie A - 25-26.xlsx` — **attenzione al nome**: ha uno spazio prima
  del trattino e la stage dei file ci si è rotta sopra. Va rinominato o gestito con le virgolette.
- `Caprera 25-26/Assicurazioni.png` — le assicurazioni sono un'immagine, non una tabella.

Non le ho aperte a fondo: sono fogli di gioco, non esportazioni, e il formato va guardato con L0
prima di dedurlo. Ma **la frase «non calcolabile» adesso è sbagliata**: il dato c'è, è solo fuori
dal database.

## 4. Le rose **all'asta**, non di giugno

- `Caprera 20-21/ROSE ASTA INIZIALE/` — dieci file, uno per società, più `Asta_FantaCaprera.xlsx`.
- `Caprera 24-25/Liste 09.24/` — dieci file `Rose_Caprera_2024-25_<Societa>.xlsx`.
- `Caprera 22-23/` — dieci `Rosa_<Societa>_22-23.xlsx`.

**È il rimedio a un difetto noto e serio:** `rose` è una fotografia di fine stagione, e chi viene
ceduto a gennaio sparisce pur avendo giocato mezzo campionato — fra 20 e 74 giocatori a stagione.
Queste sono le rose **di settembre**. Con tutte e due si sa chi c'era all'inizio e chi alla fine,
cioè si ricostruisce il mercato di gennaio senza inventarlo.

## 5. Il resto, per inventario

- `Caprera 20-21/Svincolati 12-2020.xlsx` e `svincolati squadre Dicembre/` · `Caprera
  24-25/tabella_svincolati_27.08.xlsx` — le sessioni di svincolo.
- `Caprera 24-25/pagamenti/` — tre bonifici in PDF. Sono le **vincite in euro** (§6), non crediti.
- `Caprera 25-26/old/Rose_Caprera_2025-26_backup.xlsx` e `Caprera 24-25/Rose_Caprera_2024-25_XXX.xlsx`
  — copie di sicurezza, da non caricare senza confrontarle.
- `2026:2027/Teams Loghi 2026/` — i dieci loghi 2026 già in PNG, più gli `.ai` e gli `.svg`.

## Cosa proporrei, in ordine

1. **I due listoni di partenza**, che è mezz'ora e chiude una lacuna di dieci anni:
   `python3 carica-listoni.py --momento partenza …`, dopo aver insegnato allo script a leggere
   l'`.xlsx` e a caricare la `Squadra` quando i club sono venti e giusti.
2. **Le clausole** da `Riscatti_Contratti.xlsx` in `contratti.clausola` — il campo esiste ed è
   vuoto su tutte e 140 le righe. Ricordati il controllo dei ruoli (consegna
   `momento-del-listone`, §2bis c: Sucic e altri quattro).
3. Le rose d'asta: ma prima serve una decisione di scope — è una **tabella nuova**, non una colonna
   in più, e cambia cosa vuol dire «rosa». Non è tua da solo.

---

## 6. Aggiunta — ho aperto Grigliata e Mr Champions

Nella §3 avevo scritto che non le avevo aperte a fondo. L'ho fatto. **Sono più pronte di così:
i punteggi sono già calcolati dentro i fogli**, società per società, con la classifica finale.

### Mr Champions — è già in crediti

`MrChampions_24-25.xlsx` e `MrChampions_25-26.xlsx` (copie con un nome pulito: l'originale ha
**due spazi** prima di `25-26` e la stage ci si rompe sopra).

Struttura: una colonna per società, le squadre scelte per fascia, e accanto a ciascuna il suo
**±1 già assegnato**. In fondo una riga `Tot`. Nel 24-25 si sceglievano **3** allenatori (uno per
fascia), nel 25-26 **6** (due per fascia) — il regolamento dice sei, quindi il 24-25 girava con una
regola diversa. Le regole e i premi sono scritti dentro il foglio stesso, e coincidono col
`regole-caprera.json`.

**Siccome ogni evento vale un credito, `Tot` è già il credito:**

| | 2024-25 | 2025-26 |
|---|---:|---:|
| smit | 3 | 4 |
| prosecco | −1 | 4 |
| armata-rossa | 3 | 2 |
| real-monghi | 3 | 2 |
| disperata | 2 | 0 |
| sanguemisto | 3 | 2 |
| sporting-mangiapreti | 3 | −1 |
| aston-ville | 4 | 0 |
| subbuteo | 2 | 4 |
| roburro | −1 | 2 |

⚠️ Nel file 24-25 la prima società **non ha l'intestazione** (la cella dice `#`): è Smit, dedotto
dalla posizione. Da confermare con L0 prima di caricare.

### Grigliata — due giochi, non uno

- **`SERIE A GRIGLIA`** è la Grigliata del regolamento: si ordinano i venti club, più Coppa Italia
  e capocannoniere. Vince il punteggio più basso. Nel 25-26: Disperata −44 (migliore), Aston Ville
  −68 (peggiore); c'è anche un `TOTALE` più in basso che include Coppa Italia e capocannoniere e dà
  numeri diversi (Armata −55, Prosecco −139). **Quale dei due conti vale, lo sa solo chi l'ha
  scritto.**
- **`CAPRERA GRIGLIA`** è un **secondo gioco**: si pronostica la classifica della *Caprera*, non
  della Serie A. **Nel regolamento non c'è.** Il `regole-caprera.json` descrive solo la Grigliata
  Serie A. È una regola in più che la lega gioca e che non è scritta da nessuna parte.

Il file 24-25 della Caprera griglia ha già **la classifica finale**, ed è pronta da trasformare in
crediti con la tabella del regolamento (1° +2, 2° +1, 10° −1, chi non partecipa −1):

```
1  REAL MONGHI  −16      5  SANGUEMISTO −22      8  DISPERATA   −100
2  PROSECCO     −18      6  ARMATA ROSSA −26     8  MANGIAPRETI −100
2  ASTONVILLE   −18      7  SUBBUTEO    −32      8  ROBURRO     −100
4  SMIT         −20
```

**Due cose che saltano all'occhio, e sono tutte e due regole:**

1. **`−100` è il marcatore di chi non ha partecipato**, e sono tre. Il regolamento dà −1 a chi non
   partecipa: quindi tre società pagano −1 e **il −1 del decimo non lo prende nessuno**, perché
   nessuno è decimo. È lo stesso buco del capocannoniere.
2. **Prosecco e Aston Ville sono pari merito al secondo posto** (−18). Con la regola decisa da L0
   il 22/08 — *a pari merito il premio non si assegna* — **nessuna delle due prende il +1**. È il
   primo caso reale in cui quella regola cambia dei crediti veri.

⚠️ Ma su Roburro il foglio si contraddice: nella riga dei punteggi ha **−28**, nella classifica
**−100**. O ha consegnato in ritardo, o incompleto, o è un residuo. **Non l'ho interpretato**: un
foglio di lavoro ha convenzioni che conosce solo chi l'ha scritto, e indovinarle qui vorrebbe dire
assegnare crediti veri su una supposizione.

### Cosa serve da L0 prima di caricare

1. La società senza intestazione nel Mr Champions 24-25 è Smit?
2. Nella Serie A Griglia, il totale che conta è quello delle sole posizioni o quello che include
   Coppa Italia e capocannoniere?
3. Roburro nella Caprera Griglia 24-25: ha partecipato (−28) o no (−100)?
4. La **Caprera Griglia** dà crediti come la Grigliata Serie A, o è un gioco senza premi?

---

## Stato al 24/08/2026 (magazziniere) — **resta aperta**, ma tre quarti sono fatti

Verificato sul database vivo, non sui file.

- **§1 · i listoni di partenza — FATTO.** `caprera.listone` ha oggi **2.086** righe `partenza` su
  tre stagioni: 2020-21 **691**, 2024-25 **715**, 2025-26 **680** — esattamente i conteggi di questa
  consegna. In piu' e' entrato anche il 2025-26 di `fine` (839), quindi le dieci stagioni di fine ci
  sono tutte. Materiale: `SUPABASE/06-listone-momenti.sql`, caricatore `carica-listoni.py`.
- **§2 · le clausole — a meta'.** `caprera.contratti` e' passata da 140 a **186** righe e
  **63 hanno la clausola** (erano zero). Materiale: `SUPABASE/08-contratti.sql` e
  `dati-contratti.sql`. Le altre 123 restano vuote.
- **§4 · le rose d'asta — cominciato, e la decisione di scope e' stata presa da qualcun altro.**
  `caprera.rose` ha una colonna `momento` (`07-rose-partenza-o-fine.sql`) con **620 righe
  `partenza`** contro 2.999 `fine`. Questa consegna diceva *«e' una tabella nuova, non una colonna
  in piu': non e' tua da solo»*, ed e' stata risolta come **colonna**. Non la ribalto — ma va
  saputo che una decisione di scope e' stata presa nei fatti, e che 620 righe sono due stagioni
  scarse delle tre disponibili.
- **§3 e §6 · Grigliata e Mr Champions — NON caricati, e non li carico.** I punteggi ci sono, ma le
  **quattro domande a L0 in fondo a questa consegna non hanno risposta**: la societa' senza
  intestazione nel Mr Champions 24-25, quale totale conti nella Serie A Griglia, Roburro a −28 o
  −100, e se la Caprera Griglia dia crediti. Sono crediti veri assegnati su una supposizione: dove
  esiste un registro di cio' che e' stato deciso la regola si legge, non si deduce. **Servono le
  quattro risposte.**

**Quindi la consegna resta aperta su §2 (le altre 123 clausole) e su §3/§6 (le quattro domande).**
