# 2026-08-26 · segretario · La formula dei crediti è tutta nel foglio di Guido

> Terza prova del livello 1. Fonte: `06_caprera_project/Pagamenti - Vincite - Crediti.xlsx`,
> otto fogli, sei stagioni. **Non ho scritto niente nel database né in `SUPABASE/`.**

**Stato:** la formula è **chiusa e verificata 10/10 su tre stagioni** · restano due scarti da portare a L0

---

## La formula

```
crediti(N+1) = 250
             + ceil( crediti_non_spesi(N) / 2 )      ← il carry-over «50%»
             + vincite(N)                            ← la somma dei premi
             + assicurazioni(N)                      ← rimborsi e trattenute
             + assicurazione_obbligatoria(N)         ← −2 a testa, nuova dal 2025-26
```

dove

```
vincite = diritti-tv + serie-a-awards + premi-caprera + giochi + penalita + classifiche
```

**Verificata su 2025-26 → 2026-27: dieci società su dieci, a ogni passaggio.** Le sei componenti
sommano al totale dichiarato (10/10), il totale ricostruisce i crediti (10/10), e le due colonne di
assicurazione portano al numero finale (10/10).

### Il carry-over si arrotonda **per eccesso**

Il regolamento dice «50%» e si ferma lì. Il foglio dice cosa succede al mezzo credito:

| non spesi | metà | carry di Guido |
|---:|---:|---:|
| 9 | 4,5 | **5** |
| 7 | 3,5 | **4** |
| 1 | 0,5 | **1** |
| 5 | 2,5 | **3** |

`ceil`, senza eccezioni, su **tutte e tre** le stagioni che portano la colonna (2023-24, 2024-25,
2025-26 — trenta casi). Il dispari va sempre alla società.

> È un **silenzio del regolamento riempito dalla pratica**, e va scritto: oggi vive solo in una
> formula di Excel.

## Il registro è già dentro, e combacia

`caprera.movimenti` (434 righe) **è** questo foglio. Sommando per società, escluse le
compravendite di calciatori (`categoria='mercato'`) e le assicurazioni:

| stagione | vincite calcolate dal database vs colonna «Total» di Guido |
|---|---|
| 2024-25 | **10 su 10** |
| 2025-26 | **10 su 10** |

Le assicurazioni vanno tenute fuori perché Guido le mette in **colonna separata**, dopo il totale.
Includerle dava Smit 23 invece di 15: l'unico scarto, e spiegava sé stesso.

## I crediti d'asta 2026-27

`caprera.finanze` ha solo 2024-25 e 2025-26: **la stagione che sta per cominciare non c'è.** Ecco
il calcolo, dalla formula qui sopra sui dati 2025-26.

| società | non spesi | carry | vincite | +assic. | −obbl. | **crediti 2026-27** |
|---|---:|---:|---:|---:|---:|---:|
| Smit | 1 | 1 | 15 | +8 | −2 | **272** |
| Real Monghi | 5 | 3 | 19 | | −2 | **270** |
| Prosecco | 2 | 1 | 13 | | −2 | **262** |
| Sporting Mangiapreti | 7 | 4 | 7 | | −2 | **259** |
| Armata Rossa | 9 | 5 | 5 | | −2 | **258** |
| Aston Ville | 9 | 5 | 4 | | −2 | **257** |
| Subbuteo | 1 | 1 | 6 | | −2 | **255** |
| Sanguemisto | 2 | 1 | 6 | | −2 | **255** |
| Disperata | 2 | 1 | 6 | | −2 | **255** |
| Roburro | 0 | 0 | −6 | | −2 | **242** |

Trenta crediti fra la prima e l'ultima. Il −10 «Omicido» a Roburro vale da solo un terzo di quella
distanza.

---

## Due scarti, e non li risolvo io

### 1 · Smit 2025-26: il database dice 257, il foglio dice 252

Il `−5` di *Solet Accusa Stupro* sta **due volte** nel foglio 2024-25: dentro il sottototale
«Penalita' e FFP» (`+2` FFP `−5` Solet = `−3`, che entra nel Total 7), **e di nuovo** nella colonna
«Assicurazioni» (`−5`), che porta 257 a 252.

Nel database sta una volta sola, in `penalita` — perciò `finanze.iniziali` per Smit 2025-26 è **257**.

**O Guido l'ha contato due volte, o sono due `−5` distinti** (la penalità e il mancato rimborso
assicurativo per lo stesso giocatore, che è una lettura sensata). **Non lo decido io.** Se sono due,
manca una riga in `movimenti`; se è uno, il foglio ha un errore di cinque crediti che si trascina.

> **La sentenza non è ancora uscita** — L0, 27/08/2026. Finché non esce, i due numeri restano
> tutti e due come stanno: 257 nel database, 252 nel foglio. **Non si allineano d'ufficio.** Segnata
> in `regole-caprera.json → da_chiarire`.

### 2 · «Crediti non spesi» — due diagnosi ritirate, la terza è di L0

> Questa sezione l'ho sbagliata **due volte**. Le lascio dichiarate invece di sostituirle in
> silenzio: la storia degli errori è la parte utile.
>
> **Prima versione (26/08):** *«`mercato` registra chi incassa, non chi paga»*. Falsa. Nata da una
> frase vera **per sei righe** — «il foglio nomina chi perde il giocatore» — che ho esteso a tutte
> e 173 senza rimisurare.
>
> **Seconda versione (27/08):** *«sono esborsi di chi compra, e il segno è incoerente: va
> normalizzato»*. Falsa anche questa, e **più pericolosa della prima**, perché proponeva di
> modificare i dati.

**La misura giusta è di L0.** Nella stessa colonna ci sono **due cose**, e il discriminante non è il
segno: è **se il giocatore entra o esce dalla rosa**.

| | righe | importo | cos'è |
|---|---:|---|---|
| **positive** | 111 | sempre **metà** del costo di settembre (57/57 dove metà e pieno si distinguono, costo ≥ 3) · **zero** a prezzo pieno | lo **svincolo** del Regolamento |
| **negative** | 62 | sempre il **pieno** (37/37) · **zero** a metà | due cose diverse ↓ |
| ↳ non c'era a settembre, c'è a maggio | 16 | pieno | **acquisti** |
| ↳ c'era a settembre, non c'è a maggio | 37 | pieno | **uscite** |

Lukaku **−118** al Prosecco nel 2022-23, che a maggio è dell'Armata Rossa. Nel 2024-25 la coppia fa
**−36 e −36**, simmetrica: è lo scambio col contratto del 13.09.2024.

> **Il segno non va normalizzato.** Non è incoerente: è **la cosa più regolare della tabella** — `+`
> è sempre la metà, `−` è sempre il pieno, mai una volta il contrario in cinque stagioni.

Ribaltare i 62 avrebbe fatto **due danni opposti insieme**: cancellato sedici acquisti veri e creato
118 crediti per un Lukaku che il Prosecco ha *perso*. E i miei stessi due esempi lo dicevano —
Lookman 26 → **13** e Castellanos 43 → **21** sono **metà**. Un esborso sarebbe stato 26 e 43. Avevo
sotto gli occhi la smentita e l'ho citata come prova.

**Il verso è già scritto. Il collaudo va rifatto contro quello, non contro il segno.**

### `riportati` — la mia frase era ambigua, e le due misure sono tutte e due giuste

Avevo scritto *«`riportati(N+1)` è `ceil(non_spesi(N)/2)`, dieci su dieci»* senza dire **quale**
`non_spesi`. L0 l'ha letta come `finanze.residui` e ottiene **2 su 10** — giustamente.

Verificato adesso, esplicitando la grandezza:

| il `non_spesi` di... | esito |
|---|---|
| **la colonna di Guido nel foglio xlsx** | **10/10** ✅ |
| `finanze.residui` | 2/10 |

Sono due quantità diverse e nessuno aveva torto: **il difetto era nella mia scrittura**, che non
nominava la fonte. *(E L0 ne ha misurata una terza che torna: `iniziali = 250 + riportati + bonus +
ffp`, 20 su 20.)*

**La conclusione strutturale non cambia:** il `riportati` del 2026-27 non si deduce da dentro
l'archivio.

### Le 173 righe NON spariscono — ritiro anche questa

Avevo scritto che nessuno script le produce e che «al primo ricaricamento spariscono». **Falso.**
Stanno in `supabase_migrations` col corpo SQL dentro — `lavoro_registro_mercato`, 11.205 caratteri,
più altre sei. A un reset **si rigiocano**. Non è la famiglia del `carica.sh` che cancellava le
tessere.

Il grep che avevo fatto guardava `SUPABASE/*.sql` e non le migrazioni: **ho cercato nel posto
sbagliato**, di nuovo.

**Ma metà dell'osservazione resta, ed è più grande di come l'avevo scritta:** non stanno nel
repository, e **non ci sta nessuna delle ~104**. Il repo non aveva proprio `supabase/`. Ora c'è, con
`scripts/esporta-migrazioni.py` che le tira giù.

---

## Cosa se ne ricava

**Il livello 1 ha la sua terza voce, ed è la più grossa: non un premio, ma il numero che apre
l'asta.** Diritti TV e formazione non data erano pezzi; questa è la somma che li contiene tutti.

E vale ancora il pattern delle ultime settimane — **un calcolo che riproduce un registro è insieme
una funzione e un collaudo.** Qui ha riprodotto sessanta numeri e ne ha contestati due.

## Il pattern, di nuovo, ed è sempre lo stesso

La §2 è stata sbagliata **due volte di fila**, e le due versioni hanno la stessa forma: ho preso
una frase vera in un perimetro stretto e l'ho estesa a uno largo senza rimisurare. Prima la regola
delle sei righe applicata a 173; poi il segno letto come semantica. La seconda volta avevo **la
smentita sotto gli occhi** — Lookman a 13 e Castellanos a 21 sono metà, non pieno — e l'ho citata
come prova.

È il quinto errore identico in una settimana — `lega_id` cercato col nome sbagliato, il gol vittoria
misurato sulla partita sbagliata, l'audit fatto sul JSON invece che sul PDF, la formazione non data
cercata come un'assenza. **Ogni volta il dato c'era, e la domanda era storta.**

Con una differenza che conta: le altre le ho corrette io. **Questa l'ha corretta il Magazziniere**,
perché la consegna gli diceva di fermarsi se il collaudo non passava, invece di far tornare i conti.
Il collaudo ha fatto il suo mestiere contro chi l'aveva scritto.

## Handoff

- **CHIUSO da L0 il 27/08** → la semantica di `categoria='mercato'`: `+` svincolo a metà, `−` pieno,
  e dentro i negativi 16 acquisti e 37 uscite. **Il segno non si tocca.** Il collaudo va rifatto
  contro il verso vero.
- **APERTO, e non si indovina** → **perché le 37 uscite sono addebitate a prezzo pieno.** Nessuna
  riga di regolamento lo spiega, e L0 non lo sa. Restano marcate `uscita` e **ferme**. Se salta fuori
  il DPCM che lo spiega, si chiude; finché non salta fuori, **quel numero non si tocca**.
- **L0** → resta lo Smit da cinque crediti: sentenza non uscita.
- **repo** → il disallineamento vero non sono le 173 righe (che sono in `supabase_migrations` e si
  rigiocano): è che **1 migrazione su 104** sta nel repository. Il controllo è
  `python3 scripts/esporta-migrazioni.py --controlla`.
- **poi** → `v_crediti_stagione` e la riga `2026-27`. Il carry è `ceil(non_spesi::numeric / 2)`; le
  assicurazioni restano **fuori** dalle vincite.
- **regolamento** → l'arrotondamento per eccesso del carry-over va in `regole-caprera.json`
  (`crediti.carry_over.arrotondamento: "eccesso"`) e segnalato come **silenzio del PDF colmato dalla
  pratica**, non come regola scritta.
