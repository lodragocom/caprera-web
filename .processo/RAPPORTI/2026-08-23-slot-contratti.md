# 2026-08-23 · Gli slot tornano su tutte e dieci

> **3 difensori, 3 centrocampisti, 2 attaccanti.** Il tetto regge su dieci società su dieci — e il
> modo in cui regge dice che sia il registro sia la regola sono letti giusti.

---

## 1 · «1 Sotto contratto su 31» era un numero rotto

Il conto diceva: *sotto contratto = chi ha un contratto che finisce nella stagione più lontana
presente in archivio.* Era giusto **per caso**, finché tutti i contratti finivano entro l'ultima
stagione giocata.

Col registro vero non è più così: ci sono contratti fino al **2027-28**. E il Prosecco risultava
con **un** solo contratto — Sucic, l'unico che arriva al 2027-28 — invece di sette.

Adesso è quello che dev'essere: *chi ha un contratto che **copre** la stagione in corso*.

## 2 · Il tetto, e come si conta

**Gli slot si contano sulla rosa d'asta, non su quella di maggio.** È lì che la regola si verifica:
quando la squadra si costruisce.

Non è una sottigliezza. Lo Sporting Mangiapreti a gennaio ha venduto **Coco, Lang e Castellanos**,
tutti e tre sotto contratto: contando maggio risulterebbe con **un** contratto su sei. Contando
settembre ne risulta con quattro, che è quello che aveva.

| società | D | C | A | | società | D | C | A |
|---|---|---|---|---|---|---|---|---|
| Prosecco | 1 | 3 | 2 | | Sanguemisto | 2 | 3 | 2 |
| Smit | 1 | 2 | 2 | | Armata Rossa | 2 | 1 | 2 |
| Real Monghi | 1 | 3 | 1 | | Subbuteo | 2 | 3 | 2 |
| Mangiapreti | 1 | 1 | 2 | | Aston Ville | 3 | 1 | 1 |
| Roburro | 1 | 3 | 1 | | Disperata | 2 | 2 | 2 |

**Tetto 3-3-2: nessuno lo sfonda.** Il Prosecco è pieno a centrocampo e in attacco.

### Perché questo conta più di quanto sembri

Contando **tutti** i contratti attivi, tre società sfondano: Armata Rossa 3 attaccanti, Smit e
Subbuteo 4 centrocampisti. E in tutti e tre i casi l'eccedenza è **esattamente** uno che ha
lasciato la Serie A — Gonzalez N., Pafundi, F. Anderson.

Quando una regola torna solo se la applichi nel modo giusto, e torna su **dieci casi su dieci**,
non è una coincidenza: vuol dire che il registro è letto bene *e* che la regola è capita bene. È il
riscontro più forte che abbiamo avuto sui contratti.

## 3 · Chi resta fuori, e perché — tre cose diverse

Prima li mettevo tutti in un mucchio. Sono tre situazioni, e confonderle fa sembrare un errore
quello che non lo è:

- **ha lasciato la Serie A** — il contratto corre su un giocatore che non è più giocabile. Sono la
  maggior parte: Bijol, Chiesa, Douglas Luiz, Kayode, Pafundi, Colpani, Tchatchoua, Hernandez,
  Mbangula, Gonzalez N., F. Anderson.
- **gioca in un'altra società — da verificare** — il contratto dice una cosa, la rosa un'altra.
  Ce n'è **uno solo**: **Lauriente**, contratto allo Sporting Mangiapreti, in campo col Subbuteo.
- **è in rosa a maggio ma non era all'asta** — arrivato a gennaio.

Sul Prosecco: *«Bijol — ha lasciato la Serie A — fino al 2025-26.»*

## 4 · Il collaudo, su tutte e dieci

Il controllo nuovo apre la pagina Contratti di **ogni** società e verifica il tetto:

```
prosecco    D1 C3 A2 (+1 fuori rosa)     sanguemisto  D2 C3 A2
smit        D1 C2 A2 (+3 fuori rosa)     armata-rossa D2 C1 A2 (+1)
real-monghi D1 C3 A1 (+2 fuori rosa)     subbuteo     D2 C3 A2 (+1)
mangiapreti D1 C1 A2 (+2 fuori rosa)     aston-ville  D3 C1 A1 (+2)
roburro     D1 C3 A1 (+1 fuori rosa)     disperata    D2 C2 A2 (+1)
```

Se un giorno una società sfora, si ferma. E siccome il conto passa dalla rosa d'asta e dal
registro, un errore in uno dei due lo fa sfondare: **il tetto è la sentinella dei contratti**.

Collaudo sito: nessun problema. Collaudo area: nessun problema.

## 5 · Il 2025-26, adesso

Quattro caselle piene e verificate:

| | inizio | fine |
|---|---|---|
| **listone** | 680 quotazioni | 839 quotazioni |
| **rose** | 310 (6-9-9-7 su tutte e dieci) | 310 |

più **69 contratti attivi**, di cui 51 nella rosa d'asta, e il tetto 3-3-2 rispettato da tutti.
Tutte le pagine mostrano gli stessi numeri per tutte e dieci le società.

## Resta aperto

1. **Lauriente** — scambio o refuso *(tua)*
2. **19 omonimi** nelle altre nove stagioni
3. **Presenze divise per competizione**, se le vuoi separate
4. **«La mia rosa»: attuale e storico** affiancati
5. Il file **Statistiche Serie A 2025-26**
6. Il **2024-25**

## File toccati

- `src/pages/area/sezioni.jsx` — contratti attivi sulla stagione in corso, slot sulla rosa d'asta,
  il perché di ogni contratto fuori
- `src/pages/area/sezioni.css` — la riga dei contratti fuori rosa
- `collaudo/collaudo-area.mjs` — il tetto su tutte e dieci
