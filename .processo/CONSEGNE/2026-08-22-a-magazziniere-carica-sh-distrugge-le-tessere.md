# 2026-08-22 · al Magazziniere · `carica.sh` cancella le tessere

> **Urgente.** Non è un miglioramento: è un guasto che scatta al prossimo uso normale dello script.
> Verificato sul database vivo il 22/08/2026, non dedotto.

**Stato:** aperta · **Gravità: alta** — perdita di dati, e perdita dell'accesso all'area mister.

---

## Il guasto

`carica.py` comincia così (riga 84):

```
truncate table caprera.formazione_bonus, … , caprera.misteri, caprera.lega cascade
```

La lista `TABELLE` (riga 56) contiene **`societa`** e **`misteri`**. Ma dal 20/08 esistono tabelle
nate **dopo** che quella lista è stata scritta, e nessuno l'ha aggiornata:

| tabella | righe oggi | cosa le succede |
|---|---:|---|
| **`misteri`** | 1 | ❌ **svuotata**: è dentro `TABELLE` |
| **`tessere`** | 1 | ❌ **svuotata per cascata**: ha `tessere.societa → societa`, e non è nella lista |
| `assegnazioni` | 2 | ⚠️ sopravvive, ma resta orfana |
| `schede` | 1 | ⚠️ sopravvive, ma resta orfana |
| `incarichi` | 6 | ✅ intatta |

**Conseguenza pratica:** chi lancia `carica.sh` oggi **cancella l'unica tessera esistente e l'unico
collegamento in `misteri`** — cioè si toglie da solo l'accesso all'area mister, e lascia
`assegnazioni` e `schede` appese a un utente che non ha più né tessera né società.

**Perché è successo:** `TABELLE` è la lista dello schema del 20/08 alle 16:25 (migrazione
`caprera_schema_archivio`). La Tessera del Tifoso è arrivata alle 22:01
(`caprera_tessera_del_tifoso`), gli incarichi alle 22:32. Lo script non è mai stato riletto dopo.
È lo stesso pattern della notte: **una superficie nuova non è stata guardata quando è stata
aperta.**

## Cosa serve

Il caricamento deve toccare **solo l'archivio**, mai l'identità. Due strade, scegli tu:

1. **Escludere l'identità dalla cascata.** Togliere `misteri` da `TABELLE` e sostituire il
   `truncate … cascade` con un `truncate` senza cascata su un elenco chiuso, così che una tabella
   nuova non venga mai travolta in silenzio: se compare una dipendenza, il comando **fallisce**
   invece di cancellare. Meglio un caricamento che si rifiuta di partire che uno che porta via le
   tessere.
2. **Separare i due mondi con un vincolo**, così che `societa` non sia più troncabile finché
   esistono tessere.

**Come si verifica:** dopo la modifica, con una tessera e un `misteri` popolati, lanciare
`carica.sh` e controllare che `select count(*) from caprera.tessere` e `from caprera.misteri` non
cambino.

⚠️ **Finché non è riparato, `SUPABASE/README.md` e `COMANDI.md` dicono di lanciare `carica.sh`
come se fosse innocuo.** O si ripara subito, o quelle due righe vanno marcate.

---

## Nota di contesto — perché è saltato fuori adesso

`regole-caprera.json` è stato completato oggi (14 voci di premi, blocco `stagione_2026_27`), e
`v_premi_crediti` legge da `caprera.lega.regole`, cioè dal JSONB nel database. La domanda era
"come si rilancia `carica.sh`" per allineare il database al file.

**La risposta corretta è: per questo, non si rilancia affatto.** Cambiare una colonna JSONB non
richiede di svuotare e ricaricare 160.000 righe. Basta:

```sql
update caprera.lega
   set regole = $json$…$json$::jsonb,
       regole_versione = '2026-08-22',
       aggiornato = now()
 where id = 'caprera';
```

Il che apre una domanda che è tua: **`carica.sh` fa una cosa sola e grossa.** Forse dovrebbe saper
fare anche solo le regole — `carica.sh --solo-regole` — visto che il regolamento cambia più spesso
dell'archivio.
