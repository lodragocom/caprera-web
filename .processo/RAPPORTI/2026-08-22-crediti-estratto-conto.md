# 2026-08-22 · le due pagine dei crediti sono rifatte

> Sessione che lavora sul codice. Segue `2026-08-22-movimenti-in-produzione.md`:
> con i 261 movimenti in archivio, `/area/crediti` e la scheda pubblica di una società
> non hanno più bisogno di dire «Premi e penalità: 13» e fermarsi lì.

**Stato:** fatto e provato. Collaudo sito e collaudo area passano, con due controlli in più.

---

## La cosa che si può finalmente dire

Il registro **paga con un anno di ritardo**: i premi guadagnati in una stagione entrano nel budget
di quella dopo. Il `bonus` che il mister vede nel 2025-26 è la somma dei movimenti del **2024-25**,
e questo è vero su tutte e dieci le società.

Non era scritto da nessuna parte. Adesso è la struttura di una pagina:

- **quello che hai già in cassa** — i movimenti dell'anno prima, che fanno il `bonus` di adesso;
- **quello che stai maturando** — i movimenti di quest'anno, che andranno nella prossima asta.

Prosecco: i **+7** del budget 2025-26 sono `+1 classifiche, +3 diritti TV, +3 Serie A Awards,
+2 premi Caprera, −1 giochi, −1 penalità`. E i **+13** che sta maturando sono il numero della
consegna, adesso scomposto in undici voci.

## Il riscontro, in pagina

Sotto l'estratto conto c'è una riga verde: *«la somma fa esattamente i +7 crediti di premi e
penalità del bilancio»*. I due numeri vengono da due posti diversi — `finanze.bonus`, caricato
tempo fa, e il registro di Guido, caricato stasera — e non si sono mai parlati.

Quando **non** combaciano la riga diventa ambrata e dice di quanto. `finanze.bonus` è diventato
quello che doveva essere: **una verifica, non una fonte.**

## Il confine, sul pubblico

Due viste, non una — migrazione `caprera_finestre_sui_movimenti`, la 41ª, file
`caprera-dati/SUPABASE/05-finestre-movimenti.sql`:

| | chi legge | cosa esce |
|---|---|---|
| `movimenti_miei` | il mister, la Presidenza | **tutto** il suo, penalità comprese |
| `premi_pubblici` | chiunque | **215 righe su 261**: solo i premi |

Fuori dalla finestra pubblica restano **penalità** e **assicurazioni**. Le assicurazioni perché
sono soldi. Le penalità perché le voci del Caprera Etica nominano fatti veri di persone vere, e
«Roburro −10, Omicido» su una pagina aperta a chiunque è un'altra cosa rispetto allo stesso numero
nell'area del mister.

**Questa è una scelta prudente, ed è tua da ribaltare.** Se la Presidenza decide che le penalità
sono pubbliche come i premi, si cambia una riga nella vista — la lista delle categorie — e il sito
le mostra senza toccare altro.

Provato con `set role anon` sulla produzione:

```
premi_pubblici     → 215 righe
movimenti_miei     → permission denied
caprera.movimenti  → permission denied
```

## I due controlli nuovi nel collaudo

In `collaudo/collaudo-area.mjs`:

1. **I conti sommano.** Ogni gruppo dell'estratto deve fare la somma delle sue voci, e i gruppi
   devono fare il totale. Se un giorno un filtro sbaglia, la pagina non mostra un numero
   plausibile: il collaudo si ferma.
2. **La finestra non perde.** Apre la scheda pubblica di Roburro, Smit e Prosecco e cerca dentro le
   voci le sette parole che non devono uscirne. Se qualcuno allarga `premi_pubblici`, qui si rompe.

## Una cosa che ho corretto, non nel dato

Nel registro le Panchine d'Oro mensili sono scritte `Panchina d'Oro 09`, `Panchina d'Oro 2`. Chi
tiene il registro sa che sono settembre e febbraio; chiunque altro legge un numero. In pagina
diventano **«Panchina d'Oro · settembre»**, e i piazzamenti restano riconoscibili perché hanno la
o: `1o` è il primo, `1` è gennaio.

Sta in `src/lib/core.js`, funzione `nomeVoce`. **Il registro non è stato toccato** — è cambiato
solo come lo mostriamo.

## File toccati

- `src/lib/archivio.js` — `mieiMovimenti`, `premiPubblici`
- `src/lib/core.js` — `nomeVoce`
- `src/pages/area/sezioni.jsx` + `.css` — l'estratto conto, e «Voci accessorie» spostato prima
  della spiegazione (prima quanto, poi perché)
- `src/components/CreditiSocieta.jsx` + `.css` — la sezione pubblica, riscritta
- `src/styles/theme.css` — `.cr` (verde/rosso/spento) era scritta in due fogli, adesso in uno.
  Territorio del Curatore: **aggiunta in fondo, niente riscritto.**
- `collaudo/collaudo-area.mjs` — i due controlli
- `caprera-dati/SUPABASE/05-finestre-movimenti.sql` — nuovo

## Quello che il pannello pubblico ha smesso di fare

Prima **calcolava** i premi: leggeva i piazzamenti e ci applicava il regolamento. Bella idea, e
diceva quanto una società *avrebbe dovuto* prendere — sapendo solo di Fantapunti e capocannoniere.
Adesso legge il registro, che dice quanto ha *preso*, e sa anche di diritti TV, Serie A Awards,
Panchina d'Oro, Ranking e Giochi.

`v_premi_crediti` **non è stata toccata**: resta in archivio, e da domani è il controllo incrociato
naturale — «il regolamento prometteva questo, la Presidenza ha pagato quest'altro».
