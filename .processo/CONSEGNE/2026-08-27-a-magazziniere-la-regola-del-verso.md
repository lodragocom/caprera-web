# 2026-08-27 · al Magazziniere · La regola dei crediti si legge dal verso

> **Sostituisce la consegna del 26/08** (`2026-08-26-a-magazziniere-esborsi-di-mercato.md`), la cui
> premessa era sbagliata. Avevi ragione a fermarti: il collaudo a 3/20 ha fatto il suo mestiere.
>
> **Regola decisa da L0 il 27/08.** Non è una mia deduzione. Verificata da me sul database vivo
> prima di scrivertela.

**Stato:** aperta · **Sblocca:** i crediti d'asta 2026-27

---

## Cosa era sbagliato nella consegna precedente

Ti avevo scritto che `categoria='mercato'` registra chi incassa e non chi paga, e che il segno era
incoerente e andava normalizzato. **Falso tutte e due le volte.** Ribaltare i 62 negativi avrebbe
cancellato sedici acquisti veri e creato 118 crediti per un Lukaku che il Prosecco aveva *perso*.

Nella stessa colonna ci sono **due fatti diversi**, e il discriminante non è il segno: è **`verso`**.

## La regola — tre righe

```
verso = 'entrata'                    → CONTA
verso = 'uscita'  e  crediti > 0     → CONTA
verso = 'uscita'  e  crediti < 0     → NON CONTA
verso IS NULL                        → fuori dal conto, si guardano a mano
```

**Perché, una per una:**

- **`entrata` (16 righe).** Sono gli acquisti a mercato aperto: a settembre non c'erano, quindi nella
  rosa d'asta non ci sono, quindi è **spesa nuova**.
- **`uscita` con crediti > 0 (101 righe).** È il **rimborso** — metà per lo svincolo, `+1` per gli
  scambi. È **l'unico fatto nuovo** che produce un'uscita.
- **`uscita` con crediti < 0 (37 righe).** **Ripete la rosa d'asta.** Quei crediti erano già stati
  spesi all'asta: contarli di nuovo li conterebbe due volte. ⚠️ **Non si cancellano dal registro** —
  sono la trascrizione fedele del foglio — **si saltano nel conto**, come si salta uno storno che
  ripete una posta già scritta.

**Vale per tutte le stagioni, senza eccezioni.** Le uscite negative sono 35 nel 2022-23 e **due in
tutto** altrove — Baldanzi e De Winter, cessioni sotto contratto senza rimborso, e anche lì saltarle
è giusto: quei crediti erano già spesi all'asta e non sono tornati indietro.

> Non è «una domanda aperta sul 2022-23». È **una regola sola che si applica ovunque**, e il 2022-23
> è solo la stagione dove il foglio è più esplicito.

Verificato da me sul database vivo il 27/08: `entrata` 16 (tutte negative) · `uscita` 138 (101
positive, 37 negative) · `verso IS NULL` 19.

## Cosa chiedo

1. **Rifai il collaudo** con questa regola al posto di `residui ± movimenti`:
   ```sql
   sum(crediti) filter (where verso = 'entrata' or (verso = 'uscita' and crediti > 0))
   ```
   contro la colonna «Crediti non spesi» di Guido in
   `06_caprera_project/Pagamenti - Vincite - Crediti.xlsx`. `finanze` ha **solo due stagioni**:
   sono venti confronti, non sessanta. Dillo nel risultato.
2. **Le 19 righe con `verso` nullo**: elencale con nome, stagione, società e importo. Non
   assegnare tu il verso — servono a L0 per guardarle a mano. Ce ne sono di simmetriche (Zapata
   −35/+81, Immobile −43/+120, Lukaku e Vlahović −36/−36) che sembrano scambi, ma **sembrare non
   basta**.
3. **Se il collaudo passa**, `v_crediti_stagione` e la riga `2026-27` in `finanze`.

⚠️ **Se non passa, fermati e dillo** — come hai fatto la volta scorsa, ed era la cosa giusta. Non
aggiustare i dati per far tornare i conti.

⚠️ **Non toccare le 37 righe negative.** Si saltano nel calcolo, non si modificano nel registro.

⚠️ **Il carry è `ceil(non_spesi::numeric/2)`.** Confermato: `ceil` della colonna di Guido riproduce
`finanze.riportati` dell'anno dopo **10/10**. Attenzione: **contro `finanze.residui` fa 2/10** —
sono due grandezze diverse, e la frase ambigua era mia. Il `non_spesi` che conta è quello di Guido.

⚠️ **Le assicurazioni stanno FUORI dalle vincite.**

⚠️ **Smit: la sentenza non è ancora uscita** (257 nel database, 252 nel foglio). Non toccare né
l'uno né l'altro. Se il collaudo inciampa lì, è atteso.

## Sul repository, che è cosa tua e non dipende da questo

Avevo scritto che le 173 righe «spariscono al primo ricaricamento». **Ritirata:** stanno in
`supabase_migrations` col corpo SQL dentro e si rigiocano. Avevo fatto il grep su `SUPABASE/*.sql`
invece che sulle migrazioni.

Resta però il fatto vero, più grande: **1 migrazione su 104 sta nel repository.** Il controllo è
`python3 scripts/esporta-migrazioni.py --controlla`, che esce `1` finché il repo è indietro. Si può
fare subito, non aspetta nessuna decisione.

---

## Esito — RESTA APERTA, lavorata il 27/08/2026 (magazziniere)

**Il collaudo non passa: 2 su 20.** Mi fermo, come la consegna prescrive.
`v_crediti_stagione` e la riga `2026-27` di `finanze` **non sono state scritte**. Al database vivo
non ho applicato niente: **solo `SELECT`**, nessuna migrazione, nessun `carica.sh`. Le 37 righe
`uscita` negative **non sono state toccate**.

Materiale: **`caprera-dati/SUPABASE/12-la-regola-del-verso-collaudo.sql`** — sola lettura, con le
tre interrogazioni e i numeri stampati dentro.

### 0 · La forma del registro è esattamente quella descritta

Riprodotta sul database vivo, riga per riga: `entrata` **16** (tutte negative, somma −99) ·
`uscita` **138** = **101** positive (+554) e **37** negative (−337) · `verso IS NULL` **19** (9
negative −212, 10 positive +367). **Su questo la consegna è giusta al numero.**

### 1 · Il collaudo, numero per numero — venti confronti, non sessanta

`caprera.finanze` ha **solo 2024-25 e 2025-26**. Le sei stagioni del foglio non sono confrontabili:
due lo sono. Colonna di Guido: «Crediti non spesi» (colonna N) dei fogli *Vincite 2024-25* e
*Vincite 2025-26*, letta con python3+zipfile.

`regola` = `sum(crediti) filter (where verso='entrata' or (verso='uscita' and crediti>0))`.

| 2024-25 | Guido | `residui` | `regola` | `residui+regola` | |
|---|---:|---:|---:|---:|:--:|
| armata-rossa | 5 | 8 | 0 | 8 | ✗ |
| aston-ville | 3 | 3 | 0 | **3** | ✅ |
| disperata | 11 | 15 | 32 | 47 | ✗ |
| prosecco | 31 | 4 | 24 | 28 | ✗ |
| real-monghi | 24 | 12 | 17 | 29 | ✗ |
| roburro | 3 | 3 | 0 | **3** | ✅ |
| sanguemisto | 26 | 19 | 9 | 28 | ✗ |
| smit | 0 | 6 | 0 | 6 | ✗ |
| sporting-mangiapreti | 10 | 13 | 44 | 57 | ✗ |
| subbuteo | 35 | 4 | 33 | 37 | ✗ |

| 2025-26 | Guido | `residui` | `regola` | `residui+regola` | |
|---|---:|---:|---:|---:|:--:|
| armata-rossa | 9 | 0 | 20 | 20 | ✗ |
| aston-ville | 9 | 4 | 8 | 12 | ✗ |
| disperata | 2 | 4 | 10 | 14 | ✗ |
| prosecco | 2 | 8 | 13 | 21 | ✗ |
| real-monghi | 5 | 4 | 32 | 36 | ✗ |
| roburro | 0 | 3 | 7 | 10 | ✗ |
| sanguemisto | 2 | 31 | 19 | 50 | ✗ |
| smit | 1 | 6 | 7 | 13 | ✗ |
| sporting-mangiapreti | 7 | 0 | 41 | 41 | ✗ |
| subbuteo | 1 | 1 | 1 | 2 | ✗ |

**2024-25: 2/10 · 2025-26: 0/10 · totale 2/20.**

Non mi sono fermato alla prima lettura: ho provato anche `regola` da sola (**2/20**),
`iniziali − spesi + regola` (**2/20**) e la vecchia `residui + tutti i movimenti` (**3/20**).
**Nessuna arriva a metà.**

⚠️ **Smit non c'entra.** Lo scarto 257/252 è sospeso e non l'ho toccato — né il database né il
foglio. Smit sbaglia qui per un'altra ragione: `residui` 6 contro Guido 0 nel 2024-25, e la regola
non lo muove (`regola` = 0).

### 2 · Cosa dicono gli scarti — e non è «manca un pezzo»

Nel **2025-26 gli scarti sono tutti positivi**, da +1 a +48, e crescono con la `regola`: le società
con più rimborsi sbagliano di più (sanguemisto +48 con regola 19, sporting +34 con regola 41).
Guido nel 2025-26 ha «non spesi» fra **0 e 9** su tutte e dieci; il registro ne aggiunge fino a 41.

Detto in modo misurabile e non interpretativo: **il rimborso `uscita > 0` non entra nei «crediti non
spesi» di Guido**, o non entra in quella colonna. Nel 2024-25 il verso stesso non basta a spiegare
niente — le due righe che tornano (aston-ville, roburro) sono **le due con `regola = 0`**, cioè
quelle dove la regola non cambia nulla rispetto a `residui`. Le quattro società 2024-25 con `regola = 0`
sono armata-rossa, aston-ville, roburro e smit: **due su quattro tornano, e nessuna delle sedici
righe con regola diversa da zero torna mai.** Il predicato non aggiunge accuratezza: la toglie.

**Non ho cercato una formula che facesse tornare i conti**, e non ho toccato nessun dato per
avvicinarli.

### 3 · Le 19 righe con `verso` nullo — elencate, non assegnate

| id | stagione | società | voce | crediti | finestra |
|---:|---|---|---|---:|---|
| 434 | 2021-22 | prosecco | Cabral lazio | −1 | gennaio |
| 431 | 2021-22 | smit | Immobile | **+120** | |
| 425 | 2021-22 | smit | Immobile | −43 | |
| 282 | 2021-22 | prosecco | Kean | +1 | gennaio |
| 419 | 2022-23 | prosecco | Kean | −10 | |
| 430 | 2022-23 | prosecco | Kean | +14 | |
| 433 | 2025-26 | disperata | L. Martinez | +66 | |
| 388 | 2024-25 | armata-rossa | Lukaku | +1 | |
| 421 | 2024-25 | prosecco | Lukaku | −36 | |
| 422 | 2022-23 | roburro | Muriel | −33 | |
| 420 | 2022-23 | roburro | Muriel | +52 | |
| 428 | 2025-26 | roburro | Pinamonti | +15 | |
| 432 | 2024-25 | armata-rossa | Raspadori | −17 | |
| 427 | 2024-25 | armata-rossa | Vlahovic | −36 | |
| 381 | 2024-25 | prosecco | Vlahovic | +1 | |
| 423 | 2022-23 | prosecco | Zalewski | +16 | |
| 429 | 2022-23 | prosecco | Zalewski | −1 | |
| 426 | 2021-22 | prosecco | Zapata | **+81** | |
| 424 | 2021-22 | prosecco | Zapata | −35 | |

Tutte e diciannove hanno `fonte='foglio rose'`. **Non ho assegnato nessun verso.** Una correzione
di misura alla consegna, perché cambia cosa L0 guarda:

- **Zapata (−35/+81) e Immobile (−43/+120) non sono scambi fra due società**: le due righe stanno
  sulla **stessa** società (prosecco, smit). Stesso caso per Kean 2022-23 (−10/+14, prosecco),
  Muriel (−33/+52, roburro) e Zalewski (−1/+16, prosecco). Sono coppie **interne**, e l'importo
  positivo è molto più grande del negativo.
- **L'unico incrocio vero fra due società è Lukaku/Vlahović 2024-25**: prosecco −36 (Lukaku) e +1
  (Vlahović), armata-rossa −36 (Vlahović) e +1 (Lukaku). È **−36/−36 con un +1 per parte** — la
  forma dello scambio col `+1` che la regola del verso descrive, ma con il verso non assegnato.
- **Spaiate**: Cabral lazio −1, L. Martinez +66, Pinamonti +15, Raspadori −17.

### Cosa ho verificato con i miei occhi · cosa no

**Con i miei occhi**, sul database vivo del 27/08 e sul foglio:
- i conteggi di `verso` e segno su `categoria='mercato'` (18 righe di aggregato);
- `caprera.finanze`, tutte e **20** le righe — due sole stagioni, confermato;
- le due colonne «Crediti non spesi» dei fogli *Vincite 2024-25* e *Vincite 2025-26*, lette con
  python3+zipfile dall'XML di `Pagamenti - Vincite - Crediti.xlsx`;
- le 19 righe a verso nullo, una per una.

**Dedotto, non verificato**: che il rimborso non entri nella colonna di Guido — è la lettura più
economica degli scarti, **non l'ho provata** e non è mia da decidere.

**Non fatto**: nessuna scrittura, nessuna migrazione, nessun `carica.sh`, nessuna vista.
`v_crediti_stagione` non esiste ancora. Non ho toccato `caprera-web/src/` né `collaudo/`.
Il carry `ceil(non_spesi::numeric/2)` sulla colonna di Guido **non l'ho ri-misurato**: era già
10/10 e non è ciò che il collaudo metteva alla prova.

### Cosa serve per riaprirla

1. **A L0** — il predicato del verso non riproduce «Crediti non spesi». Le domande misurate sono
   due: *il rimborso `uscita>0` entra in quella colonna?* (nel 2025-26 sembra di no su dieci
   società su dieci) e *`finanze.residui` è la base giusta?* (2024-25 sbaglia anche dove la regola
   vale zero).
2. **A L0** — le 19 righe nulle, con la correzione qui sopra: cinque coppie sono **interne a una
   società**, non scambi.
3. **Resta sospeso** — Smit 257/252, non toccato.


---

## CHIUSA il 2026-08-29 — non dal verso, dalla fonte

**Il predicato del verso resta bocciato** (2/20, misurato dal Magazziniere il 27/08: la sua
lettura era giusta). Ma la consegna è chiusa perché **la domanda a monte è stata risolta altrove**,
la sera stessa, caricando la fonte invece di dedurla.

**Ratifica di L0, 29/08:** i «crediti non spesi» si leggono da **Fantapazz**; per l'anno dopo vale
la **metà**. Ora in `REGOLE/regole-caprera.json` → `crediti.non_spesi_fine_stagione`.

`caprera.finanze` è riallineata al foglio di Guido su tutte le stagioni, la riga **2026-27 esiste
ed è verificata 10/10** su tre controlli indipendenti. `finanze.residui` **è** oggi il residuo di
fine stagione: la frase che diceva il contrario non vale più.

⚠️ **Resta al Magazziniere, e non dipendeva da questo:** le **103 migrazioni su 104 fuori dal
repository**. Controllo: `python3 scripts/esporta-migrazioni.py --controlla`.

⚠️ **Resta a L0:** le 19 righe a `verso` nullo. Non bloccano più i crediti.

Rapporto: `../RAPPORTI/2026-08-29-segretario-i-non-spesi-erano-gia-in-produzione.md`.
