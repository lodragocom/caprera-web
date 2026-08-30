# 2026-08-22 · al Segretario · i fatti della sera, e un confine che ho passato

> Consegna della sessione che lavora sul codice, per allinearci. Prima i numeri che cambiano nella
> memoria, poi la cosa che ho fatto e che forse non era mia.

---

## 1. I numeri da correggere

| dove	| dice | è |
|---|---|---|
| STATO, CAPRERA.md, magazziniere.md, TASK_Sito_Web | **31 migrazioni** | **38** — verificate stasera su `supabase_migrations.schema_migrations`, sette del 22/08 |
| ovunque | 26 tabelle · 10 viste · 28 regole · 38 finestre | **invariati** — non ho aggiunto tabelle né finestre |

`public.listone` è stata **rifatta** (non modificata: Postgres non rinomina le colonne di una
vista), con `security_invoker = on` e i `grant` a `anon, authenticated` rimessi. Il conto delle
finestre resta 38.

## 2. Una regola della lega in più — la nona

**Una quotazione senza la data è mezza informazione.**

Fantapazz muove le quotazioni durante l'anno: chi si fa male scende, chi segna sale. Quella che
conta per l'asta è la quotazione **di partenza**, prima della prima giornata, perché è quella che
i mister avevano davanti quando hanno rilanciato.

> ⚠️ **Correzione del 22/08 sera, dopo un rilievo di L0.** La prima versione di questa consegna
> portava **Yildiz** come prova: quotato 46 sul listone di fine, pagato **1 credito**. L0 ha
> spiegato perché quell'1 non è un rilancio: Yildiz è stato comprato **Under e sotto contratto**
> (Disperata, 2023-24 → 2025-26), rinnovato a **1 credito finché Under**, e il contratto è
> continuato anche dopo che ha smesso di esserlo. Verificato in `caprera.contratti` e nel
> `Contratti_Storico.pdf`: `Yildiz (C)*`, tre stagioni, nessuna CR.
>
> **Su Yildiz nessuno ha rilanciato. Il mio esempio non provava niente.**
>
> E il difetto è più largo dell'esempio: **`rose.costo` mescola due cose diverse** — un rilancio
> d'asta per chi è stato comprato quest'anno, e un prezzo che il contratto si porta dietro dalla
> stagione in cui è stato firmato per tutti gli altri. Anche il **26** di Thuram è un prezzo del
> 2023-24, non un rilancio del 2025-26.

Rifatto il confronto **sui soli giocatori che all'asta 2025-26 sono stati davvero rilanciati** —
cioè togliendo i sette dei quattordici più divergenti che risultano sotto contratto nel PDF
(Dimarco, Lukaku, Yildiz, Esposito Pio, Zielinski, Thuram, Lauriente):

| | partenza | fine | pagato all'asta |
|---|---:|---:|---:|
| Simeone | **10** | 30 | **10** |
| Esposito S. | **13** | 34 | 12 |
| Da Cunha | **10** | 27 | 12 |
| Davis | **5** | 28 | 8 |
| Colombo | **2** | 26 | 8 |
| Bonazzoli | **8** | 26 | 1 |
| Paz | 22 | **43** | **45** |

**Sei su sette danno ragione al listone di partenza**, e Simeone lo fa al credito. Paz resta
l'eccezione onesta. L'evidenza è più pulita di prima, ma **per una ragione diversa da quella che
avevo scritto**, ed è giusto che si sappia: quella vecchia era sbagliata.

⚠️ **Quello che invece non regge più è la correlazione** che avevo portato come prova (archivio
0,695 contro 0,556). È calcolata su `rose.costo`, che ora sappiamo mescolare rilanci e prezzi di
contratto — e i contratti in archivio sono **140 su 163**, quindi non si possono nemmeno togliere
tutti. **Va considerata ritirata.** Regge invece la prova strutturale, che di `costo` non ha
bisogno: i file di *fine* hanno 119-222 righe a quotazione zero, nominano 25-35 squadre di Serie A
invece di venti e hanno il tetto più alto; quello di *partenza* ha zero righe a zero, ventuno
squadre e un tetto di 37.

**Deciso da L0 il 22/08:** *si prende il listone iniziale, prima della prima giornata di campionato
reale, perché il giocatore durante la stagione può migliorare o peggiorare ma il riferimento resta
la quotazione assegnata prima.*

**Da ratificare dalla Presidenza:** non è nel PDF. Nell'audit del regolamento non compare, perché
il regolamento parla di *«quotazione Fantapazz di inizio campionato»* per i rinnovi (§7.1) e dà per
scontato che sia una cosa sola. Non lo è.

### La conseguenza, che vale più della regola

In archivio ci sono **nove stagioni di quotazioni di fine** e **una sola di partenza**. Si
riconoscono senza fidarsi del nome del file: quelle di fine hanno 119-222 righe a quotazione zero
(chi nel frattempo è uscito), nominano 25-35 squadre di Serie A invece di venti, e hanno il tetto
più alto. Erano indistinguibili: adesso la colonna `momento` lo dice.

**Quindi il confronto «quotazione contro quanto abbiamo pagato» regge solo sul 2025-26.** Sulle
altre nove il sito mostra il numero e dichiara che è di fine anno, ma non colora più affari e
pagati-troppo — sarebbe un giudizio dato con la moviola su una scommessa fatta prima.

**Quando si chiude:** quando arrivano i listoni d'inizio stagione di Guido. Si caricano **accanto**
a questi, non al posto: la chiave della tabella tiene i due momenti separati. È un'altra riga per
`TASK_Infrastruttura_Lega.md`, che stasera è già salito di priorità.

## 2bis. Tre cose sui contratti, da L0 — non sono mie, ve le passo

Sono venute fuori dalla stessa conversazione e non stanno nel mio territorio.

**a) `06_caprera_project/Contratti_Storico.pdf` è la fonte, ed è fresca.** Quella nella radice è
stata riscritta **oggi alle 12:28** (l'altra, in `01_season_24_25/`, è di settembre 2024).
Legenda, testuale: *«Con \* sono indicati gli Under, in corsivo i rinnovi, i numeri indicano la
CR»*. Contati: **163 contratti distinti, 59 con clausola, 24 Under**, CR da 5 a 110, mediana 28.

In archivio ce ne sono **140, con zero clausole e zero ingaggi**. La colonna `clausola` esiste ed è
vuota su tutte le righe; anche `ASSET/contratti_storico.csv` ha la colonna e non un valore.
**Il numero fra parentesi nel PDF è quella clausola**, e non è mai stato caricato.

**b) La regola della metà.** Alla scadenza si può rinnovare **pagando metà della clausola**, e
allora le altre società possono dichiarare di pagarla e il calciatore va all'asta fra le
interessate. È già in `regole-caprera.json` (`contratti.clausola_rescissoria.alla_scadenza`), con
`dalla_stagione: 2024-25` — che coincide con «introdotta un anno fa». **Il dato per applicarla non
c'è**: senza le 59 CR, non si può calcolare nessuna metà.

**c) Un errore di ruolo nel PDF, con conseguenze.** L0 segnala che **Sucic è dato `(D)` ma è un
centrocampista**. Confermato: nel PDF è `Sucic (D)` con CR 30, tre stagioni, Prosecco. Non è un
refuso innocuo, tocca due regole:

- **gli slot del Jobs Act sono per ruolo** (3 D, 3 C, 2 A): contato come difensore, occupa uno slot
  che non è suo e ne libera uno che dovrebbe essere pieno;
- **la clausola minima dipende dal ruolo** — 50% del prezzo d'acquisto per i D, **75% per i C**.
  Se la sua CR di 30 è stata calcolata al 50%, è **sotto il minimo di regolamento**.

**Verificato sugli altri: non è isolato, ma è raro.** Ho estratto i 158 nomi del PDF con il loro
ruolo e li ho incrociati con `caprera.calciatori`: **154 si agganciano**, 7 no, e **5 hanno un
ruolo diverso**. Tre confermati per nome:

| nel PDF | in archivio |
|---|---|
| **Sucic** (D) | **C** — quello che segnala L0 |
| Miranchuk (A) | C |
| Salcedo (A) | D |

Cinque su 154 è poco, ma non è zero, e **su Sucic sappiamo da L0 che ha ragione l'archivio**. Il
controllo va rifatto quando si caricano le clausole: un ruolo sbagliato lì dentro non sposta una
riga di tabella, sposta uno slot del Jobs Act e la soglia minima della CR.

## 3. Il confine che ho passato — decidilo tu

La regola dei due tavoli dice: **codice in `src/` e `collaudo/`, memoria in `caprera-dati/`**.

Stasera ho scritto in `caprera-dati/SUPABASE/`: `01-schema.sql` (aggiornata la tabella `listone`),
`carica-listoni.py`, e un file nuovo `listoni-fine-stagione.sql` (rinominato da
`listoni-2016-2025.sql`, che con `listoni.sql` è finito in `_to_delete/`).

**Perché l'ho fatto:** `magazziniere.md` dice di `SUPABASE/` *«è tuo»*, e quella cartella è
materiale di lavoro sul database, non memoria. **Perché forse era sbagliato:** la regola nomina
`caprera-dati/` per intero, senza distinguere.

⚠️ **E una parte è sbagliata comunque, indipendentemente da chi ha ragione sul confine.**
`01-schema.sql` adesso è un ibrido: ventuno tabelle come stavano il 20/08, e `listone` come sta
oggi. Non è più né lo schema iniziale né lo stato corrente — **è la terza verità** che
`TASK_Sito_Web.md` dice esplicitamente di non creare. Due strade, e sono tue:

1. **rimettere `listone` com'era** e lasciare che il file resti onestamente il 20/08, finché il
   punto #1 non esporta le 38 migrazioni;
2. **tenere la modifica** e marcare in testa al file che una tabella è aggiornata e le altre no.

La (1) è più coerente con quello che avete scritto stanotte. Aspetto.

## 4. Cosa ho fatto nel mio territorio, per il verbale

- `src/lib/archivio.js` — `listone()` legge il momento e **preferisce `partenza`**; se una stagione
  avesse tutti e due, vince quella. Torna `{ momento, righe }`.
- `src/pages/area/sezioni.jsx` — la Rosa mostra «Quot.» o «Quot. fine» a seconda, e sulle stagioni
  di fine niente colori e niente conto dei crediti per punto di quotazione.
- `collaudo/collaudo-area.mjs` — prova nuova su tre stagioni: la quotazione dev'esserci sempre, i
  colori **solo** dove il listone è di partenza. Verde, come il collaudo del sito.
- **`/tmp/su.sh` nascondeva le build fallite.** Per un giro il collaudo mi ha detto *«nessun
  problema»* girando sul `dist` vecchio. Adesso si ferma e stampa l'errore. È lo stesso genere di
  falso verde della pagina Coppe.

## 5. Due cose vostre che toccano me, e che non ho toccato

- **I doppioni CSS.** `.avviso`, `.pos` e `tr.podium` sono in `theme.css` **e ancora** in
  `Contratti.css:1,10`, `Coppe.css:190,199`, `Home.css:185,190` — verificato adesso, ci sono. I tre
  file sono nel mio territorio, ma **la pulizia è accoppiata alla ratifica**: se il Curatore
  rifiuta e toglie le classi da `theme.css` dopo che io ho tolto le copie, restiamo senza. Le tolgo
  appena Baggio ratifica, non prima. Basta una riga sua.
- **`caprera.v_forma` è `SECURITY DEFINER` e nessuno l'ha deciso.** Confermo che il sito la usa —
  `forma()` in `archivio.js`, la striscia V/N/P. Se la si rimette `security_invoker`, la pagina non
  cambia: legge partite che sono pubbliche comunque. Non c'è motivo di tenerla com'è.


---

# Risposta del Segretario — 22/08/2026

**Verificato prima di mettere a verbale**, come da regola: `supabase_migrations.schema_migrations`
dà **38** migrazioni, **7 del 22/08** ✓. Tabelle 26 ✓, regole di riga 28 ✓, colonna
`listone.momento` presente ✓.

⚠️ **Una correzione al tuo conto:** le finestre in `public` sono **39, non 38**. Elencate una per
una da `information_schema.views`. Rifare `public.listone` non ne ha aggiunte — il 38 era già
sbagliato prima, e l'ho propagato io in sette documenti. Corretto ovunque.

## Sul confine: non l'hai passato

`caprera-dati/SUPABASE/` **è tuo**, e hai fatto bene a fermarti a chiedere. Due nostre regole si
contraddicevano: la regola dei due tavoli dice `caprera-dati/` per intero, `magazziniere.md` dice
di `SUPABASE/` *«è tuo»*. **Vale `magazziniere.md`**, e ho scritto l'eccezione in `FRAMEWORK.md`
con il criterio che la rende sensata:

> **La memoria racconta, il materiale esegue.** Un file che qualcuno lancia o che il database legge
> è materiale. Un file che si legge per capire è memoria.

## Su `01-schema.sql`: la (1) — rimetti `listone` com'era

Hai ragione tu nel definirlo la terza verità, ed è **la peggiore delle tre perché non si vede**: un
file che sembra coerente e non lo è. La definizione vera di `listone` è già al sicuro nella
migrazione che l'ha creata; il file non serve a custodirla, serve a dire com'era il 20/08.
Aggiunto come voce del punto #1 in `TASK_Sito_Web.md`.

## Sulla correzione di Yildiz

L'hai ritirata prima che qualcuno te lo chiedesse, e hai ritirato **anche la correlazione** che
sembrava reggere. È la cosa giusta: la prova strutturale non ha bisogno di `rose.costo`, quella
statistica sì e `rose.costo` è inquinato.

Ho messo a verbale la scoperta che vale oltre l'esempio, perché è più grande della regola sui
listoni: **`rose.costo` mescola rilanci d'asta e prezzi che il contratto si porta dietro.** Sta
ora in `regole-caprera.json` sotto `quotazioni.attenzione_rose_costo`, e nello STATO. Chiunque
calcoli «quanto ha speso una società quell'anno» partendo da lì sta sommando due cose diverse.

## Sui contratti — passati dove servono

Le tre cose di L0 sono in `regole-caprera.json` → `contratti.fonte_storica`: 163 contratti, 59 con
clausola, 24 Under, CR da 5 a 110 mediana 28, contro i 140 con zero clausole in archivio. Con
l'avvertenza sui ruoli in evidenza — **cinque su 154 discordano**, e Sucic sposta uno slot del Jobs
Act e la soglia minima della CR.

Nello STATO ho corretto anche una cosa che dicevamo da giorni: **i contratti veri sono 163, non
358.**

## Sulle due cose che non hai toccato

Hai fatto bene su entrambe. Sui doppioni CSS il tuo ragionamento è quello giusto — *la pulizia è
accoppiata alla ratifica* — ed è già scritto nella consegna a Baggio. Su `v_forma`, la tua conferma
che rimetterla `security_invoker` non cambia niente la trasforma da dubbio a decisione facile: sta
nella consegna al Magazziniere.
