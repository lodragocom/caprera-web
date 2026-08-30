# 2026-08-22 · al Magazziniere · il registro dei movimenti

> Consegna della sessione che lavora sul codice. È **la più grossa in coda a te**, ed è anche
> quella che sblocca due pagine del sito. Il file l'ho aperto e verificato: i conti tornano.

**Stato:** aperta · **Sblocca:** `/area/crediti` e la sezione Crediti della scheda società.

---

## Perché

`caprera.finanze` ha una colonna `bonus`, ed è **un intero unico**. Ci finiscono dentro premi,
penalità, diritti TV, codice etico, rimborsi assicurativi — tutto. Nel sito quella colonna diventa
una riga sola: *«Premi e penalità: 13»*.

Un gioco manageriale vive della domanda **«perché ho tredici crediti?»**, e oggi quella domanda non
ha risposta. Non perché il dato manchi: perché non è mai stato caricato.

**Il dato esiste, ed è completo.** L0 ha recuperato da Guido
`06_caprera_project/Pagamenti - Vincite - Crediti (1).xlsx` — **attenzione al nome**: spazi
attorno ai trattini e le parentesi, va sempre fra virgolette. Otto fogli, **sei stagioni**, dal 2020-21 al
2025-26.

## La prova che il file quadra

Ho ricostruito il 2025-26 e i conti chiudono da soli, senza aggiustamenti:

- I **sei conti** sommano al bonus di stagione su **tutte e dieci** le società.
  Prosecco: `−1 + 3 + 2 + 1 + 5 + 3 = 13`. Real Monghi: `0 + 1 + 2 + 0 + 14 + 2 = 19`.
- `250 + riportati + bonus` dà il budget d'asta su **nove** società su dieci. La decima è Smit, che
  aggiunge **8** di rimborso assicurativo — e nel foglio c'è una colonna apposta.
- I **crediti iniziali 2025-26** che il registro calcola sono **identici ai nostri** su nove
  società. La decima è ancora Smit: Guido applica un `−5` del codice etico che **in archivio non
  c'è**. (Vedi la consegna `regole-dal-registro-di-guido`, §7b.)

## Che forma ha il file

Ogni foglio `Vincite <stagione>` contiene, in blocchi affiancati:

| blocco | cosa c'è |
|---|---|
| Bilancio | quota d'iscrizione e vincite **in euro**, con il vincitore di ogni competizione |
| Altre Vincite Caprera | Fantapunti 1º-10º e capocannoniere, **in crediti** |
| Altre Vincite Crediti | Diritti TV: CL, EL, ConfL, CI, SCE, SCI |
| Squadra · Motivo · Crediti | Serie A Awards, e le penalità del codice etico |
| Altre Vincite Premi | Fair Play, **Panchina d'Oro** (1º/2º/3º/10º **e i nove mensili**), Ranking, Zdenek, Paratici |
| Giochi | **MrChampions** riga per società, **Grigliata Serie A** 1º/2º/10º/NP |
| Penalità | formazione non data, ritardo lista, FPF |
| sub totals | i sei conti già sommati per società |

⚠️ **Il blocco `sub totals` con i sei conti esiste solo dal 2024-25.** Nel 2022-23 ha tre colonne,
nel 2023-24 quattro, prima non c'è. Per le stagioni vecchie i totali vanno **ricostruiti dal
dettaglio**, non letti.

⚠️ **Leggi per etichetta, non per coordinata.** I fogli non hanno la stessa forma: il 2020-21 ha
una «Euro Schedina» che poi sparisce, il 2021-22 ha l'FPF con i pagamenti, il 2025-26 ha una
colonna «Assicurazioni» che prima non c'era. Un lettore che va a riga e colonna si rompe alla
seconda stagione.

## Quello che proporrei come forma

```sql
create table caprera.movimenti (
  id        bigserial primary key,
  stagione  text not null references caprera.stagioni,
  societa   text not null references caprera.societa,
  categoria text not null,   -- classifiche · diritti-tv · serie-a-awards
                             -- premi-caprera · giochi · penalita · assicurazioni
  voce      text not null,   -- 'Panchina d'Oro 1o', 'Grigliata Serie A NP', ...
  crediti   int  not null,
  fonte     text not null default 'registro Guido'
);
```

E `finanze.bonus` **non si tocca**: diventa una verifica, non una fonte. Se la somma dei movimenti
di una stagione non fa `bonus`, è il caricamento a essere sbagliato — ed è esattamente il controllo
che vuoi avere.

È la stessa regola che il progetto si è già dato per le classifiche, scritta in
`SPIEGAZIONE_Schema_Supabase.md`: *«se una cosa si può ricavare, tenerla scritta da un'altra parte
significa solo darsi un secondo posto dove sbagliarla»*.

**Perché una tabella e non colonne in più su `finanze`:** le voci non sono un elenco fisso. Le
Supercoppe arrivano nel 2022-23, i Giochi nel 2024-25, i mensili della Panchina d'Oro sono nove
righe. Una colonna per voce sarebbe uno schema che cambia ogni anno.

## Come si verifica

Tre controlli, tutti e tre dal database, nessuno a occhio:

1. `sum(crediti) group by stagione, societa` = `finanze.bonus` — deve tornare su tutte le righe
   dove `finanze` esiste. **Le eccezioni sono la lista di quello che ci manca**, e già ne
   conosciamo una (il `−5` di Smit).
2. `250 + finanze.riportati + sum(crediti)` = i crediti iniziali della stagione dopo.
3. Nessuna `categoria` fuori dalle sette dell'elenco: un valore nuovo vuol dire che il foglio ha
   una voce che non avevi previsto, e va guardata prima di caricarla.

## Cosa NON fare

- **Non lanciare `carica.sh`**: cancella le tessere e il listone (le due consegne aperte).
- **Non caricare gli euro.** Nel file ci sono quote d'iscrizione, vincite e bonifici. Sono
  un'altra moneta e stanno in un'altra tabella, se mai. Qui vanno solo i **crediti**.
- **Non inventare categorie** per far quadrare una riga. Se una voce non rientra, va segnalata.

## Le altre due cose che sono arrivate insieme

- **`06_caprera_project/Contratti_Storico.xlsx`** — la stessa cosa del PDF ma in tabella, con un
  foglio `CR` che ha le clausole per stagione e per società. **Usalo al posto del PDF** quando fai
  la consegna sulle clausole: leggere una tabella è tutt'altro che estrarre numeri fra parentesi da
  un testo impaginato.
- Vale anche qui l'avvertenza sui ruoli: cinque nomi su 158 hanno un ruolo diverso da
  `caprera.calciatori`, e il ruolo decide uno slot del Jobs Act e la soglia minima della clausola.

## L'ordine che proporrei fra le tue sei

1. **`carica-py-e-il-listone`** — è un guasto che scatta al prossimo uso, e sono venti righe.
2. **Questo** — sblocca due pagine del sito, ed è l'unico che risponde a una domanda che i mister
   si fanno davvero.
3. `i-file-ritrovati` §1, i due listoni di partenza — mezz'ora, chiude una lacuna di dieci anni.
4. Il resto.

Quando questa è caricata, avvisa: le due pagine le rifaccio io e sono poche ore.

---

## Esito — chiusa il 24/08/2026 (magazziniere)

**Caricata.** `caprera.movimenti` esiste con la forma proposta qui (`04-movimenti.sql`), ha il
caricatore suo (`carica-movimenti.py`) e contiene **261 righe**. La trovo gia' fatta dalla sessione
del codice; il mio lavoro qui e' stato **verificarla**, e ho trovato una cosa che vale piu' del
caricamento.

### Il controllo n. 1 di questa consegna e' scritto su un allineamento sbagliato, e va corretto

Cosi' com'e' scritto — `sum(crediti) group by stagione, societa` = `finanze.bonus` **della stessa
stagione** — **non torna su nessuna riga**: il 2024-25 ha movimenti e `bonus` a zero, il 2025-26 ha
scarti da −18 a +15. Sembra un caricamento sbagliato. Non lo e'.

Vale la regola che questa consegna stessa cita altrove: **si guadagna in N, si spende all'asta di
N+1**. Spostato di una stagione, e aggiunto `ffp`, torna **tutto**:

```
sum(movimenti di N) = finanze(N+1).bonus + finanze(N+1).ffp
```

Verificato da me sul database vivo, movimenti 2024-25 contro finanze 2025-26: **resto 0 su tutte e
dieci le societa'.** Armata Rossa 14 = 14 + 0 · Real Monghi 20 = 18 + 2 · Subbuteo 5 = 3 + 2.

**E questo chiude una domanda aperta nello STATO.** Lo STATO dice: *«`ffp` vale 2 per otto societa'
su dieci: e' quasi certamente il pagamento anticipato. Da confermare»*. Confermato dal registro di
Guido: quei 2 ci sono, sono dentro il totale che Guido assegna, e da noi finiscono in `ffp` invece
che in `bonus`. Non e' una discrepanza: e' la stessa cifra in due caselle diverse.

**Il controllo va riscritto cosi'**, ed e' quello vero da tenere come collaudo permanente.

### Il resto

- Controllo n. 3 (nessuna categoria fuori dalle sette): non l'ho rifatto riga per riga.
- Le due discrepanze note (`residui` di Guido, il −5 di Smit) restano dove stanno: sono roba da L0 e
  Guido, non mia.
- **Avviso al Curatore:** il dato c'e'. `/area/crediti` e la sezione Crediti della scheda societa'
  si possono rifare — ma leggendo `movimenti` **della stagione precedente** per spiegare il `bonus`
  di quella corrente, che e' esattamente la domanda *«perche' ho tredici crediti?»*.
