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

### Al Magazziniere (Gattuso) — **due, dopo il giro del 24/08**

| # | consegna | gravità | in una riga |
|---|---|---|---|
| 5 | [`statistiche-serie-a`](2026-08-22-a-magazziniere-statistiche-serie-a.md) | — | tabella e caricatore ci sono, **ma il caricamento è in corso**: 4 stagioni su 11, una troncata. La chiude chi la sta caricando |
| 6 | [`i-file-ritrovati`](2026-08-22-a-magazziniere-i-file-ritrovati.md) | — | §1 fatto, §2 a metà (63 clausole su 186), **§3 e §6 fermi sulle quattro domande a L0** |

> Le quattro consegne chiuse il 24/08 erano già state riparate da altre sessioni: il giro del
> Magazziniere è servito a **verificarle sul database vivo e a chiuderle**, non a rifarle. Due cose
> sono uscite da quella verifica e non erano note: `carica.sh` oggi **si ferma** su
> `statistiche_serie_a` (guardia che funziona, elenco da aggiornare — fatto), e il controllo n. 1
> della consegna sui movimenti era scritto sull'allineamento di stagione sbagliato.

### Al Curatore (Baggio) — una, con due cose dentro

| consegna | in una riga |
|---|---|
| [`theme-css`](2026-08-22-a-curatore-theme-css.md) | **A)** ratificare le tre classi finite in `theme.css` da un'altra mano — e la correzione è **incompleta**, le copie vecchie sono ancora nei CSS di pagina. **B)** decidere le scale mancanti: **960 valori grezzi**, erano 649 il 21/08 |

> ⚠️ **La A blocca lavoro altrui.** La sessione del codice ha dichiarato che **non toglie i
> doppioni CSS finché Baggio non ratifica**, e ha ragione: se li togliesse prima e il Curatore
> poi rifiutasse le classi in `theme.css`, resteremmo senza. **Basta una riga sua.**

### Chiuse

- [`carica-sh-distrugge-le-tessere`](2026-08-22-a-magazziniere-carica-sh-distrugge-le-tessere.md) —
  **24/08, magazziniere.** Riparata con l'elenco chiuso e la guardia `dipendenti_impreviste()`.
  ⚠️ La guardia ha subito trovato `statistiche_serie_a` fuori elenco: `carica.sh` si sarebbe fermato.
  Aggiunta ad `ALTRUI`. Lo script **non è stato lanciato** (database vivo).
- [`carica-py-e-il-listone`](2026-08-22-a-magazziniere-carica-py-e-il-listone.md) — **24/08,
  magazziniere.** `momento` scritto, `fine` messa da parte e rimessa. Verificato:
  `partenza 2.086 · fine 8.847`, dieci stagioni.
- [`premi-crediti`](2026-08-22-a-magazziniere-premi-crediti.md) — **24/08, magazziniere.** Il pari
  merito è nella vista e il controllo passa. ⚠️ Ma **l'estensione ai premi positivi è in esercizio
  senza che L0 l'abbia ratificata**. In più: `v_diritti_tv` scritta e pronta in
  `SUPABASE/10-diritti-tv.sql`, non applicata.
- [`il-registro-dei-movimenti`](2026-08-22-a-magazziniere-il-registro-dei-movimenti.md) — **24/08,
  magazziniere.** 261 righe caricate. Il controllo di questa consegna era scritto sull'allineamento
  sbagliato: la forma giusta è `sum(movimenti di N) = finanze(N+1).bonus + ffp`, e **torna su tutte
  e dieci le società**. Conferma anche che `ffp = 2` è il pagamento anticipato — domanda che lo
  STATO aveva aperta.
- [`regole-ferme-al-20`](2026-08-22-a-magazziniere-regole-ferme-al-20.md) — **applicata il 22/08**
  dalla sessione del codice su richiesta di L0, dichiarata come scavalcamento. `lega.regole` è al
  22/08, impronta md5 identica al file, `v_premi_crediti` invariata. ⚠️ **Ma la regola del pari
  merito è nel dato e la vista non la legge**: `premi-crediti` resta aperta.

- [`a-segretario-momento-del-listone`](2026-08-22-a-segretario-momento-del-listone.md) — risposta
  in fondo al file: numeri verificati (con una correzione, 39 finestre e non 38), il confine di
  `SUPABASE/` chiarito, e la decisione su `01-schema.sql`.
