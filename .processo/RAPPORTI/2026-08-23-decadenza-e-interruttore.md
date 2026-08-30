# 2026-08-23 · Il contratto decade, e l'interruttore

> **Un contratto decade quando il giocatore lascia la Serie A.** Non era un errore d'archivio:
> era una regola che non conoscevo.

---

## 1 · Lauriente non era un difetto

Avevo lasciato una domanda aperta: *«Lauriente risulta al Mangiapreti e gioca nel Subbuteo — da
verificare.»* La risposta è la regola, e spiega **tutti e diciotto** i casi che non tornavano:

- **Lauriente** è sceso in Serie B → il contratto col Mangiapreti è decaduto → è risalito in A e il
  Subbuteo se l'è preso all'asta, da libero.
- **Lang e Castellanos** sono partiti dall'Italia a gennaio → decaduti.
- **Bijol** è andato via nel 2024-25, con un contratto che sulla carta arrivava al 2025-26 →
  decaduto un anno prima della scadenza scritta.

La pagina adesso lo dice invece di chiederlo:

> **Decaduti** — *Un contratto decade quando il giocatore lascia la Serie A. Non è sospeso e non
> aspetta: è finito. Se un giorno rientra, rientra libero, e chi lo vuole se lo ricompra all'asta.
> Non occupano nessuno slot.*

E per chi è rientrato con un'altra maglia lo dice per esteso: *«uscito dalla Serie A, rientrato col
Subbuteo»*. Niente più «da verificare».

**Nota di metodo.** Per due giorni ho trattato questi diciotto casi come un problema di dati. Non lo
erano: mancava una regola. Quando i dati «non tornano» in modo così regolare — sempre gli stessi,
sempre nella stessa direzione — la spiegazione più probabile non è che il registro sia sbagliato, è
che manchi una regola a chi lo legge.

## 2 · L'interruttore: stagione o carriera

Le **stesse diciannove colonne**, due contenuti. In cima alla rosa:

```
Numeri   [ Stagione 2025-26 ]  [ Da quando è qui ]
```

| Barella | Pres. | MV | FM | Gol | Assist | Amm. |
|---|---|---|---|---|---|---|
| 2025-26 | 44 | 6,40 | 6,65 | 4 | 11 | 10 |
| da quando è qui | **268** | 6,33 | 6,68 | **26** | **48** | **44** |

Costo, quotazione e mercato **non** cambiano: restano della stagione scelta, perché un giocatore non
ha «il costo di tutti gli anni» — ne ha uno per anno. C'è scritto sotto la tabella.

### Due cose aggiunte per farlo funzionare

**I rigori nei totali di carriera.** La somma di carriera non li teneva: adesso sì, segnati,
sbagliati e parati, più gli autogol.

**La fantamedia di carriera**, e come si calcola. La **media voto** si pesa sulle partite, perché è
una media di voti presi da lui e sappiamo quanti sono. La **fantamedia** no: è un numero che
Fantapazz calcola su *tutte* le sue partite di Serie A, e quante siano questa vista non lo sa.
Pesarla sulle presenze in Caprera sarebbe una media pesata col peso sbagliato — un numero che sembra
più preciso e invece è solo più falso. È la media semplice delle sue fantamedie stagionali, e il
suggerimento lo dice.

## 3 · Il collaudo

Il controllo nuovo verifica due cose insieme:

- **le colonne non cambiano** — è la stessa tabella che risponde a due domande, non due tabelle
- **i numeri della carriera non calano mai** rispetto a quelli della stagione: un totale più piccolo
  di una delle sue parti non è un totale

```
carriera 2025-26 · 11 righe crescono passando ai totali
```

Collaudo sito: nessun problema. Collaudo area: nessun problema.

## 4 · Cosa ho trovato negli altri due

**`Statistiche_Serie_A_202526.xls`** — è il file che mancava. 840 righe, e sono le statistiche di
**Serie A vera**, non quelle di Caprera:

```
ID_Calciatore · Ruolo · Calciatore · Squadra
FM/MV Fantapazz · FM/MV Gazzetta · FM/MV Corriere · FM/MV Voto Statistico
Presenze · Amm · Esp · Ass · Gol · Rigori segnati · Rigori sbagliati
Gol subiti · Rigori parati · Portiere imbattuto
```

Quattro fonti di voto diverse, e le colonne che oggi in archivio non abbiamo. Riempirebbe anche i
**52 usciti** che non hanno statistiche di Serie A. Vuole una tabella sua.

**`Caprera 24-25`** — c'è tutto l'equivalente del 25-26, e in più una cosa che il 25-26 non aveva:

| file | cosa contiene |
|---|---|
| `Rose_Caprera_2024-25.xlsx` | 11 fogli: `Rose_Asta_Finale`, `Liste Svincoli`, **`Rose Mercato Feb`** |
| `Listone_Fantapazz INIZIALE.csv` | il listone di partenza — **già in archivio**, 715 righe |
| `Listone_Fantapazz finale 24:25.csv` | il listone finale — da caricare |
| `scheda giocatori_2024-25.xls` | le schede |
| `tabella_svincolati_27.08.xlsx` | gli svincolati |

`Rose_Asta_Finale` ha la stessa forma del 25-26: portieri a squadre (Milan, Venezia per il
Prosecco), una colonna per società. Il metodo si trasferisce.

**`Rose Mercato Feb` è nuovo**: è la rosa dopo il mercato di febbraio. Per il 2024-25 potremmo
quindi avere **tre** momenti invece di due — asta, febbraio, fine — e sarebbe la prima stagione a
raccontare il mercato invernale dal registro invece che per differenza.

## Il prossimo

Nell'ordine che hai dato: le **statistiche di Serie A**, poi il **2024-25**.

## File toccati

- `src/pages/area/sezioni.jsx` — la decadenza, l'interruttore, i rigori e la fantamedia di carriera
- `src/pages/area/sezioni.css` — l'interruttore
- `collaudo/collaudo-area.mjs` — il controllo dell'interruttore
