# Consegne — quando il lavoro sta nel tavolo di un altro

La regola dei due tavoli (`../FRAMEWORK.md`) dice che **se il guasto si ripara solo nel tavolo
dell'altro, si consegna**. Le consegne stanno qui.

Una consegna **non è una segnalazione**. È pronta da applicare:

1. **cosa** — file e righe esatte;
2. **perché** — il guasto vero, non «andrebbe sistemato»;
3. **come si verifica** — il comando o il gesto che dice se ha funzionato;
4. **cosa resta da decidere**, se qualcosa resta: quello è di chi riceve, e non si decide qui.

Chi riceve deve poter **incollare e verificare, non indagare**. È il vincolo che rende il confine
sostenibile: se consegnare costa più che fare, la regola salta al primo lunedì.

Formato: `AAAA-MM-GG-a-<ruolo>-<tema>.md`. Quando è applicata, chi l'ha applicata la chiude
scrivendo l'esito in fondo — e la moviola di quella sessione la cita.

---

## Aperte — al 22/08/2026

Ordinate per urgenza, non per data. **Chi le applica scrive l'esito in fondo al file** e la moviola
di quella sessione le cita.

### Al Magazziniere (Gattuso) — cinque

| # | consegna | gravità | in una riga |
|---|---|---|---|
| 2 | [`carica-sh-distrugge-le-tessere`](2026-08-22-a-magazziniere-carica-sh-distrugge-le-tessere.md) | **alta** | `truncate … cascade` porta via `tessere` e `misteri`: chi lancia lo script si toglie l'accesso all'area |
| 3 | [`carica-py-e-il-listone`](2026-08-22-a-magazziniere-carica-py-e-il-listone.md) | media | la colonna `momento` non viene scritta, l'insert fallisce; e il truncate porta via 8.688 righe per ricaricarne 680 |
| 4 | [`premi-crediti`](2026-08-22-a-magazziniere-premi-crediti.md) | media | il pari merito fa sparire una penalità: due società appaiate ultime non pagano il −2 |
| 5 | [`statistiche-serie-a`](2026-08-22-a-magazziniere-statistiche-serie-a.md) | — | materiale buono che non si aggancia come sembra |
| 6 | [`i-file-ritrovati`](2026-08-22-a-magazziniere-i-file-ritrovati.md) | — | due listoni di partenza nuovi, le clausole in `Riscatti_Contratti.xlsx`, le rose d'asta di settembre |

> **1, 2 e 3 sono lo stesso file** (`carica.py`/`carica.sh`) e la stessa famiglia: uno script
> scritto il 20/08 alle 16:25 e mai riletto dopo che lo schema è cambiato sette volte. Conviene
> aprirle insieme. Ma la **1 non aspetta le altre due**: è un `update`, non tocca lo script.

### Al Curatore (Baggio) — una, con due cose dentro

| consegna | in una riga |
|---|---|
| [`theme-css`](2026-08-22-a-curatore-theme-css.md) | **A)** ratificare le tre classi finite in `theme.css` da un'altra mano — e la correzione è **incompleta**, le copie vecchie sono ancora nei CSS di pagina. **B)** decidere le scale mancanti: **960 valori grezzi**, erano 649 il 21/08 |

> ⚠️ **La A blocca lavoro altrui.** La sessione del codice ha dichiarato che **non toglie i
> doppioni CSS finché Baggio non ratifica**, e ha ragione: se li togliesse prima e il Curatore
> poi rifiutasse le classi in `theme.css`, resteremmo senza. **Basta una riga sua.**

### Chiuse

- [`regole-ferme-al-20`](2026-08-22-a-magazziniere-regole-ferme-al-20.md) — **applicata il 22/08**
  dalla sessione del codice su richiesta di L0, dichiarata come scavalcamento. `lega.regole` è al
  22/08, impronta md5 identica al file, `v_premi_crediti` invariata. ⚠️ **Ma la regola del pari
  merito è nel dato e la vista non la legge**: `premi-crediti` resta aperta.

- [`a-segretario-momento-del-listone`](2026-08-22-a-segretario-momento-del-listone.md) — risposta
  in fondo al file: numeri verificati (con una correzione, 39 finestre e non 38), il confine di
  `SUPABASE/` chiarito, e la decisione su `01-schema.sql`.
