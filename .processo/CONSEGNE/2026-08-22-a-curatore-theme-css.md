# 2026-08-22 · al Curatore · `theme.css` — due cose in coda

> Consegna del Segretario. Nessuna delle due è stata decisa: **le decidi tu**, è il tuo terreno.
> Qui c'è solo il materiale già verificato, perché tu non lo debba rifare.

**Stato:** aperta · **Verificato sul disco il 22/08/2026**, non riferito.

---

## A · Ratifica — tre classi finite in `theme.css` da un'altra mano

**Cosa è successo.** La sessione che lavora sul codice ha spostato `.avviso`, `.pos` e
`tr.podium` in `src/styles/theme.css` (righe **484-512**, con un commento che spiega il perché).

**Il guasto era vero.** Quelle classi stavano in CSS di pagina — `Contratti.css`, `Coppe.css`,
`Home.css` — che Vite carica **solo con quella pagina**. Chi arrivava **dritto** su Ranking le
trovava vuote: l'avviso appariva senza bordo e senza colore. È un guasto che **non si vede
navigando**, solo entrando da fuori — quindi nessun collaudo che parte dalla Home lo trova.

**La correzione è giusta e non la sto contestando.** Va ratificata perché `theme.css` è tuo, e
perché la regola dei due tavoli lo prevede (L0, 22/08: *si consegna*).

### ⚠️ Ma la correzione è incompleta — questo devi guardarlo

Le classi sono state **aggiunte** in `theme.css`, e **le copie vecchie non sono state tolte**:

| classe | ora in `theme.css` | ancora anche in |
|---|---|---|
| `.avviso` | riga 491 | `pages/Contratti.css:1` · `pages/Coppe.css:190` |
| `.avviso strong` | riga 500 | `pages/Contratti.css:10` · `pages/Coppe.css:199` |
| `.pos` | riga 502 | `pages/Home.css:185` |
| `tr.podium .pos` | riga 507 | `pages/Home.css:190` |

**Perché è un problema e non un doppione innocuo:** le pagine sono chunk lazy. Quale definizione
vince dipende da **quale foglio è stato caricato per ultimo**, cioè dal percorso di navigazione
dell'utente. Due persone possono vedere lo stesso avviso in due modi. È lo stesso genere di
guasto che questa correzione voleva chiudere, entrato dall'altra parte.

In `Coppe.css:187` c'è anche un commento che ora **dice il falso**:
`/* .avviso e' definita in Contratti.css, che sta in un chunk lazy diverso: ... */`
Non è più vero: è definita in `theme.css`.

**Da fare, se ratifichi:** togliere le quattro definizioni duplicate dai tre file di pagina e
cancellare quel commento. Restano legittime le regole *contestuali*, che non sono doppioni:
`Regolamento.css:59` (`.reg .avviso a`) e `SchedaGiocatore.css:197` (`.sg .avviso b`).

**Come si verifica:** `npm run build`, poi aprire **direttamente** `/ranking` e `/stats` (non
arrivandoci dalla Home) e controllare che l'avviso abbia il bordo sinistro `--draw` e che il podio
sia oro.

---

## B · Decisione — le scale che `theme.css` non ha

**Il fatto, misurato oggi.** In `theme.css` ci sono colore, raggi, ombre e famiglie di caratteri.
Non c'è nient'altro. Verificato contando le occorrenze:

```
--sp-        0        (nessuna scala di spaziatura)
--text-xs    0        (nessuna scala tipografica: --text, --text-muted,
--text-base  0         --text-dim sono COLORI, non dimensioni)
--dur        0        (nessun token di durata)
--ease       0        (nessuna curva)
--ring       0        (nessun anello di focus)
--tap        0        (nessun bersaglio minimo)
```

**Quanto costa non averle, oggi:** **960 valori grezzi** in `px`/`rem` sparsi nei fogli di pagina
e di componente. **Erano 649 il 21/08.** In una giornata sono cresciuti di **311** — non per
sciatteria, ma perché sono state rifatte Classifica, Società, Scheda società, Risultati,
Giocatori, Ranking e Stats. È la misura pulita del fatto che **ogni pagina nuova nasce con il suo
ritmo privato**, ed è il motivo tecnico per cui il sito è "quasi coerente" e non lo diventa mai.

### Cosa c'era, e perché non c'è più

La notte del 21/08 era stata abbozzata una proposta: scala di spaziatura su base 4/8, scala
tipografica, token di movimento, anello di focus, `prefers-reduced-motion` globale, bersaglio da
44 px su `pointer: coarse`. Il build passava.

**È stata distrutta da un `cp -f` di un'altra sessione, prima di qualunque commit.** Non è stata
respinta: è andata persa. Ma va detta anche l'altra metà, ed è la ragione per cui questa è una
consegna e non un ripristino: **non era da farsi senza di te.** `theme.css` è il design system.

**Non la ricostruisco io.** Sarebbe rifare lo stesso errore con più cerimonia.

### Quello che ti passo, perché non lo rifaccia tu

Tre cose vere che erano emerse allora, e che restano vere adesso — le puoi usare o scartare:

1. **`select:focus-visible` e `input:focus-visible` fanno `outline: none`** e cambiano solo il
   colore del bordo (`theme.css`, controlli). È il tuo anti-pattern *«focus nascosto senza un ring
   che lo sostituisca»*, scritto nel tuo file. E `button` e `a` non hanno **nessuno** stato di
   focus.
2. **Non esiste `prefers-reduced-motion`** in `theme.css`, mentre `.page` anima a ogni cambio
   rotta. `moto.jsx` lo rispetta per conto suo; il CSS a mano no.
3. **`.seg button` e `.scelta-stagione button` stanno sui 26-30 px** di altezza, contro i 44×44
   che le tue soglie invarianti dichiarano non negoziabili. La strada che regge senza sacrificare
   la densità sul desktop è `@media (pointer: coarse)` — distingue il dito dal puntatore senza
   indovinare dalla larghezza dello schermo.

### Cosa resta da decidere — ed è tuo, non mio

- **Se farle adesso o dopo.** Con `/area` ancora da rifare, farle **prima** significa che la
  dashboard nasce già sulla scala; farle **dopo** significa un'altra pagina da riallineare.
- **Quanto stretta.** Una scala di nove valori riduce le scelte; una di quindici è un elenco di
  ciò che c'è già e non serve a niente.
- **Se accettare gli spostamenti di qualche pixel** che l'allineamento comporta (44→48, 88→96,
  18→16). Il sito non resterebbe identico a com'è oggi, ed è il punto.

**Prima di toccare `theme.css`: committa.** È il file che si è già perso una volta.

---

## Esito — Curatore, 22/08/2026

**Stato: ITERA → APPROVA.** Ratificate tutte e tre, ma **una l'ho corretta prima di
ratificarla**: così com'era spediva una regressione viva.

### Il giudizio, classe per classe

**`.avviso` + `.avviso strong` — APPROVA senza modifiche.**
Nome italiano, bare, senza prefisso: è esattamente la convenzione che `theme.css` già tiene
(`.card`, `.note`, `.empty`, `.badge`, `.forma`, `.pastiglia`). Appartiene al design system per
merito, non per comodità: la usano **otto pagine** (Coppe, Ranking, Assicurazioni, Partita,
Contratti, Regolamento, Formazioni, più le contestuali). Il posto giusto era qui dall'inizio.

**`tr.podium .pos` — APPROVA senza modifiche.**
`podium` è inglese in mezzo a nomi italiani, e me ne sono accorto; ma `theme.css` è già bilingue
di suo (`.num`, `.strong`, `.muted`, `.dot`, `.form`) e rinominarla costerebbe due `.jsx` per zero
guadagno. Passa. È una regola contestuale corretta: qualifica, non impone.

**`.pos` — CORRETTA, poi approvata.** Il difetto:

```css
.pos { color: var(--text-dim); width: 2.2rem; }   /* com'era */
```

Promuovendola globale, `width: 2.2rem` (35,2 px) è finita addosso a **tutti** i `.pos`, non solo
alle celle di tabella. Ma `.pos` non è sempre un `<td>`:

| dove | elemento | traccia che lo contiene |
|---|---|---|
| Home, Ranking | `<td class="num pos">` | colonna di tabella — **la vuole, la larghezza** |
| Asta `.top-card` | `<span class="pos num">` | griglia `1.6rem 1fr auto` = **25,6 px** |
| Coppe `.riga-fp` | `<b class="num pos">` | griglia `22px 1fr auto` = **22 px** |
| area `.pan-cl li` | `<span class="num pos">` | griglia `1.6rem 1fr auto` = **25,6 px** |

Nei tre casi sotto, un elemento da 35,2 px in una traccia da 22-25,6 px **sfonda di 10-13 px
dentro la colonna del nome squadra**. Non è teoria: è nel codice adesso, in tre punti, uno dei
quali è la classifica del pannello dell'area mister.

**Il principio, perché non ricapiti.** `width` non è identità, è layout. Una classe del design
system porta **cosa è una cosa** (qui: il colore della posizione), non **quanto spazio occupa** in
un contenitore che non conosce. Chi promuove una classe da CSS di pagina a `theme.css` deve
separare le due cose, non spostare il blocco intero. Correzione applicata:

```css
.pos { color: var(--text-dim); }
td.pos { width: 2.2rem; }
```

L'identità vale ovunque; la larghezza resta dov'era davvero destinata — la cella di tabella.
Commento tracciabile lasciato in `theme.css` sopra la regola.

### Doppioni tolti — il lavoro che la ratifica sblocca

- `src/pages/Contratti.css` — tolte `.avviso` e `.avviso strong` (righe 1-12).
- `src/pages/Coppe.css` — tolte `.avviso` e `.avviso strong` **e il commento che ora diceva il
  falso** («è definita in Contratti.css»). Diceva anche di una duplicazione in `AreaMister.css`:
  quel file è codice morto non più importato da nessuna rotta, non l'ho toccato.
- `src/pages/Home.css` — tolte `.pos` e `tr.podium .pos`.

Verificato: `^\.avviso`, `^\.pos`, `^tr\.podium` non esistono più fuori da `theme.css`.
Restano intatte le **contestuali**, che non erano doppioni e infatti non lo sono:
`Regolamento.css:59`, `SchedaGiocatore.css:197` (file di un'altra mano — **non toccato**),
`Asta.css:27`, `Coppe.css:428`, `area/sezioni.css:622-623`.

`npm run lint` e `npm run build` passano (i warning sono preesistenti e su altri file).

**Resta da fare a chi verifica:** aprire **direttamente** `/ranking` e `/stats` (non dalla Home) e
controllare bordo sinistro `--draw` sull'avviso e podio oro — e, in più rispetto alla consegna,
**Asta**, **Coppe → Classifica Fantapunti** e la **classifica del pannello area mister**, dove la
larghezza era andata a sbattere.

**Ripulitura minore lasciata lì di proposito:** ora che `.pos` è globale,
`.top-card .pos`, `.riga-fp .pos` e `.pan-cl .pos` ridichiarano `color: var(--text-dim)` a vuoto.
Sono innocue (stesso valore) e toccano tre file in più, uno dei quali in area mister: non le tolgo
in una sessione di ratifica.

### Punto B — non fatto, e va detto perché

L0 ha chiesto la ratifica, non le scale. **Resta aperto**, e resta la cosa più costosa del file:
960 valori grezzi, +311 in un giorno. Il materiale della consegna è buono e me lo tengo — in
particolare i tre punti passati (focus nascosto su `select`/`input`, nessun
`prefers-reduced-motion`, bersagli a 26-30 px). Le decisioni ancora mie: **prima o dopo `/area`**
— e propendo per **prima**, perché la dashboard è l'unica pagina grossa non ancora nata, e farla
nascere già sulla scala costa una volta sola invece di due.
