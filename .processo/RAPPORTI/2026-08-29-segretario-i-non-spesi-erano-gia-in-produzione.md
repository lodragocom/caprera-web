# 2026-08-29 · segretario · I «non spesi» erano già in produzione

> L0 ha ratificato la regola: **i crediti non spesi si leggono da Fantapazz, e per l'anno dopo
> vale la metà.** Sono andato a prendere i dieci numeri e li ho trovati **già nel database**,
> caricati la sera del 27/08 mentre il rapporto che li dichiarava impossibili veniva scritto.

**Stato:** chiusa · nessun lavoro residuo sui crediti 2026-27

---

## La ratifica

**Deciso da L0 il 29/08/2026**, due frasi:

- i **crediti non spesi di fine 2025-26** sono quelli di **Fantapazz**;
- **per il prossimo anno vale la metà**.

Scritto in `REGOLE/regole-caprera.json` → `crediti.non_spesi_fine_stagione`. È la prima volta che
una quantità del progetto viene dichiarata **input** e non output: il JSON adesso lo dice a chiare
lettere, perché è esattamente l'errore in cui siamo caduti tre volte.

## I dieci numeri non andavano chiesti: erano nel foglio

Colonna **N** del foglio *Vincite 2025-26* di `Pagamenti - Vincite - Crediti.xlsx`, e accanto la
colonna **O**, intestata «Crediti carry-over (50%)».

| | non spesi (N) | metà (O) |
|---|---:|---:|
| Prosecco | 2 | 1 |
| Roburro | 0 | 0 |
| Subbuteo | 1 | 1 |
| AstonVille | 9 | 5 |
| Mangiapreti | 7 | 4 |
| Sanguemisto | 2 | 1 |
| Smit | 1 | 1 |
| Disperata | 2 | 1 |
| ArmataRossa | 9 | 5 |
| RealMonghi | 5 | 3 |

`ceil(N/2)` riproduce O **10 su 10** — 1→1, 7→4, 9→5. L'arrotondamento per eccesso regge anche qui.

**Il rapporto del 27/08 aveva stampato questi stessi numeri**, nella colonna «Guido» della tabella
del collaudo, e li aveva usati solo come metro per bocciare un calcolo.

## Il lavoro era già stato fatto

Migrazioni sul database vivo, lette il 29/08:

```
20260826233535  caprera_finanze_i_non_spesi_di_guido
20260827161945  caprera_finanze_2026_27
20260827163117  caprera_finanze_smit_assicurazione_e_2026_27_non_giocata
20260827174134  caprera_finanze_dal_foglio_di_guido_2020_2024
20260827182608  caprera_finanze_2024_25_ritorno_al_foglio_dasta
```

Tre controlli, tutti **10 su 10**, verificati da me sul database vivo:

| controllo | prima (rapporto 27/08) | adesso |
|---|---|---|
| `finanze.residui` 2025-26 = «non spesi» di Guido | 1/10 | ✅ **10/10** |
| `ceil(residui/2)` = `riportati` 2026-27 | non misurabile | ✅ **10/10** |
| `iniziali = base + riportati + bonus + ffp + assicurazione` | — | ✅ **10/10** |

I `residui` 2024-25 tornano anch'essi al foglio (5, 3, 11, 31, 24, 3, 26, 0, 10, 35 — 10/10, erano
2/10). E i crediti iniziali 2026-27 nel database coincidono con la **colonna V** del foglio su tutte
e dieci le società.

✅ **Smit non è più sospeso.** Il database ha **252**, la lettura di Guido: il Caprera Etica da −5 è
stato adottato. La sentenza che aspettava L0 è stata risolta caricando la fonte.

## Cosa resta aperto

- **Le 19 righe a `verso` nullo** — restano da guardare a mano (a L0). Non bloccano più niente:
  i crediti 2026-27 non passano da lì.
- **Il registro dei movimenti resta un registro**, non una sorgente di saldi. La conclusione del
  27/08 è confermata dai fatti, non smentita: quel predicato non andava usato.

## Il pattern — e stavolta non è sul metodo, è sul coordinamento

> **Due tavoli hanno lavorato la stessa domanda nella stessa sera. Uno l'ha risolta caricando la
> fonte, l'altro ha scritto che non era risolvibile. Nessuno dei due sapeva dell'altro.**

Il rapporto del 27/08 non era sbagliato: era **vero al momento in cui è stato scritto**, su un
database che nel frattempo era cambiato sotto. Ed è per questo che la moviola esiste — solo che
era ferma al 22/08, cinque giorni indietro, quindi non poteva dirlo a nessuno.

**Regola che ne esce, ed è la seconda volta che questo progetto ci arriva:** prima di dichiarare
una cosa impossibile, **rileggere il database vivo, non la fotografia che ne avevi**. Il costo qui
è stato una serata; il rimedio è una `select`.
