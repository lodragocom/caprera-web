# 2026-08-22 · al Magazziniere · `v_premi_crediti` — pari merito e copertura

> Consegna del Segretario. Il difetto è verificato sul database vivo; la regola per ripararlo è
> stata decisa da L0 oggi. **Non l'ho applicata io**: le viste e lo schema sono tuoi.

**Stato:** aperta · **Verificato il 22/08/2026** interrogando il progetto, non i file.

---

## A · Il difetto — un pari merito fa sparire una penalità

**Cosa succede.** In `caprera.v_premi_crediti`, stagione **2025-26**, le posizioni marcatori sono:

```
1  smit            2  prosecco       3  real-monghi     4  subbuteo
5  sporting        6  aston-ville    7  disperata       7  sanguemisto
9  armata-rossa    9  roburro
```

Due pari merito. **Nessuno è in posizione 10**, quindi **il `-2` dell'"ultimo" non viene assegnato
a nessuno**: Armata Rossa e Roburro, appaiate in fondo, prendono entrambe il `-1` del "penultimo".

**Perché conta.** Non è una riga storta a schermo: è una **penalità prevista dal regolamento che
non viene applicata**, e i crediti finiscono nel budget d'asta della stagione dopo. È la stessa
famiglia del pari merito nel Ranking trovato la notte scorsa — con la differenza che quello
cambiava i gironi, questo cambia i soldi.

## La regola, decisa da L0 il 22/08

> **A pari merito il premio non si assegna, né in positivo né in negativo.**

Stesso principio del gol vittoria: in parità, il premio non si assegna. Scritta in
`REGOLE/regole-caprera.json` → `crediti.premi.parita`, con `vale_per: [fantapunti,
capocannoniere, ranking-caprera]`.

Applicata al 2025-26: Armata Rossa e Roburro **non prendono né −1 né −2**. Nessuna delle due paga.

⚠️ **Due cose da sapere prima di implementare:**

1. **L'estensione ai premi positivi è una mia deduzione, non una dichiarazione di L0.** Due prime
   a pari merito non prendono il `+5`: discende dal principio, ma **non gliel'ho sentito dire**.
   È segnata come `attenzione` dentro il JSON. Chiedi prima di darla per buona.
2. **Il criterio è diverso da quello del Ranking**, dove a pari coefficiente si spareggia (stagione
   più recente, poi differenza reti). Qui non si spareggia: non si assegna. **Sono due leghe nella
   stessa lega**, ed è una cosa che il Direttore Sportivo potrebbe voler uniformare. Non
   uniformarla di tua iniziativa.

**Come si verifica:** dopo la modifica, `v_premi_crediti` per il 2025-26 deve dare
`crediti_marcatori = 0` per `armata-rossa` e `roburro`, e nessuna riga deve avere `-2`.

---

## B · Il contesto — la vista copre due premi su sei, e si vede

Provando a far quadrare i premi calcolati con i `bonus` registrati (che entrano nel budget
**della stagione dopo**: si guadagna in N, si spende all'asta di N+1):

| società | premi calcolati 24-25 | `bonus` 25-26 | manca |
|---|---:|---:|---:|
| disperata | −1 | 0 | +1 |
| roburro | 7 | 9 | +2 |
| subbuteo | 0 | 3 | +3 |
| smit | 0 | 5 | +5 |
| prosecco | 1 | 7 | +6 |
| aston-ville | 0 | 7 | +7 |
| sanguemisto | 0 | 8 | +8 |
| sporting | −3 | 5 | +8 |
| armata-rossa | 4 | 14 | +10 |
| real-monghi | −5 | 18 | **+23** |

**Gli scarti sono tutti positivi**, senza eccezioni: la firma di componenti positive che l'archivio
non contiene. Real Monghi chiude il 2024-25 **ultima nei fantapunti e ultima nei marcatori** (−5) e
si presenta all'asta con **+18**.

**Non è un difetto della vista.** Le altre quattro voci non sono calcolabili:

| voce | perché no |
|---|---|
| Ranking Caprera | la tabella dei punteggi **manca dal PDF** (§10.4.13) |
| premio Paratici · premio Zdenek | il regolamento fissa l'importo (2), **non dice a chi spettano** |
| assicurazioni | dipendono da infortuni e assenze — **dati che non abbiamo** |
| penalità e Caprera Etica | sono **atti della Presidenza**, non conseguenze di partite |

L'unica voce grande abbastanza per spiegare +23 è il **rimborso assicurativo**: tetto al doppio
dell'investito, massimo 10 → **fino a 20 crediti**.

**Non chiederti di calcolarle.** Il punto di questa sezione è l'opposto: dimostra che `finanze.bonus`
come intero unico **non potrà mai tornare**, perché ci finiscono dentro cose che nessun calcolo
produce. Serve un registro di movimenti — ma quella è una decisione di scope, non tua: sta al tavolo
`TAVOLI/2026-08-21-da-lega-privata-a-prodotto.md`.

**Da fare qui:** solo il pari merito (punto A). Il resto è contesto perché tu sappia che uno scarto
fra calcolato e registrato **è atteso**, e non vada a caccia di un bug che non c'è.
