# 2026-08-22 · al Magazziniere · `lega.regole` è ferma al 20/08

> **La più urgente delle cinque.** Non è un guasto: è che il regolamento completato oggi esiste
> solo in un file, e il database legge dall'altra copia.

**Stato:** aperta · **Gravità: alta** — il sito calcola con regole vecchie di due giorni
**Verificato sul database vivo il 22/08/2026.**

---

## Il fatto

```sql
select regole_versione from caprera.lega where id = 'caprera';
-- 2026-08-20
```

`REGOLE/regole-caprera.json` porta `aggiornato: 2026-08-22` e contiene il lavoro di oggi:

- **`crediti.premi` da 7 a 14 voci** — aggiunti Trofeo Walter Mazzarri (fino a **+10**, il premio
  più grande della lega), Serie A Awards, Fair Play, Grigliata Serie A, Mr Champions, più
  `diritti-tv` e `formazione-non-data` marcati `calcolabile: true`;
- **`crediti.premi.parita`** — la regola decisa da L0: *a pari merito il premio non si assegna*;
- **`stagione_2026_27`** — le cinque riforme del §10.6, Capology compreso;
- **`quotazioni`** — vale il listone di partenza, con l'avvertenza su `rose.costo`;
- **`contratti.fonte_storica`** — 163 contratti, 59 clausole, e i cinque ruoli discordanti.

**`v_premi_crediti` legge da `caprera.lega.regole`**, non dal file. Finché non si allinea, il sito
calcola con il regolamento del 20 agosto.

## ⚠️ Non con `carica.sh`

`carica.sh` **cancella le tessere** — vedi `2026-08-22-a-magazziniere-carica-sh-distrugge-le-tessere.md`.
E comunque sarebbe sproporzionato: svuotare e ricaricare 160.000 righe per cambiare **una colonna
JSONB**.

## Come si fa — pronto da incollare

Usa lo stesso ambiente e la stessa connessione di `carica.sh`:

```sh
cd ~/dev/caprera/caprera-dati
. PROGRAMMI/.venv/bin/activate
export CAPRERA_DSN="$(cat ~/.caprera-dsn)"

python3 - <<'FINE'
import json, os, psycopg
regole = json.load(open('REGOLE/regole-caprera.json', encoding='utf-8'))
with psycopg.connect(os.environ['CAPRERA_DSN']) as c:
    c.execute("""update caprera.lega
                    set regole = %s, regole_versione = %s, aggiornato = now()
                  where id = 'caprera'""",
              (json.dumps(regole, ensure_ascii=False), regole['aggiornato']))
    c.commit()
    print('regole ->', c.execute(
        "select regole_versione from caprera.lega where id='caprera'").fetchone()[0])
FINE
```

Tocca **una riga e una colonna**. Nessun truncate, nessuna cascata, nessuna tessera persa.

## Come si verifica

1. `select regole_versione from caprera.lega where id='caprera'` → deve dire **2026-08-22**.
2. **Prova di non regressione**, la più importante: `select * from caprera.v_premi_crediti where
   stagione = '2025-26'` deve restituire **esattamente le stesse righe di prima**. Le voci nuove
   sono premi che la vista non legge; se qualcosa cambia, è un segnale che il JSON ha rotto una
   chiave che serviva — `fantapunti` e `capocannoniere` devono restare intatte nella forma.
3. `select regole #> '{crediti,premi,trofeo-walter-mazzarri,tabella}'` → deve esserci.

## La domanda che ti lascio

Questo è, di fatto, un **`carica.sh --solo-regole`**. Il regolamento cambia molto più spesso
dell'archivio — oggi due volte — e ogni volta serve un comando che non esiste. **Vale la pena
farlo esistere?** È una tua chiamata: forse la risposta è che `carica.sh` va spezzato in due, o
forse basta questo blocco in un file `aggiorna-regole.sh` accanto agli altri.

---

## Esito — applicata il 22/08/2026 dalla sessione del codice

**Fatto, su richiesta esplicita di L0** («fallo te»). Dichiarato come **scavalcamento, non come
prassi**: il database è territorio del Magazziniere, e la regola dei due tavoli resta.

Non è stato usato il blocco Python di questa consegna: la sessione del codice passa dal canale
Supabase, quindi **né il DSN né psycopg sono stati toccati**. Un solo `update`, una riga, una
colonna.

**Verifica di identità.** Il `regole-caprera.json` è stato caricato in un Postgres locale come
`jsonb` e confrontato con quello in produzione per impronta canonica:

```
file    md5 = 1bd49289a6a460c87941e4f6390b895d
database md5 = 1bd49289a6a460c87941e4f6390b895d      23.992 byte · 20 chiavi
```

Identici. Non è una trascrizione somigliante: è lo stesso documento.

**Non regressione.** `v_premi_crediti` sul 2025-26, prima e dopo, riga per riga:

```
armata-rossa:-4  aston-ville:0  disperata:0  prosecco:4  real-monghi:0
roburro:-3  sanguemisto:0  smit:7  sporting-mangiapreti:-1  subbuteo:1
```

Invariata.

⚠️ **Quello che questo update NON fa.** La regola del pari merito adesso è **nel dato**
(`crediti.premi.parita`) ma la vista **non la legge**: il `CASE` su `ultimo`/`penultimo` è scritto
dentro il SQL. Armata Rossa e Roburro continuano a prendere **−1 ciascuna** e il −2 dell'ultimo
resta non assegnato. **La consegna `premi-crediti` è ancora aperta e ancora tua.**
