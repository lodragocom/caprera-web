# 2026-08-22 · Magazziniere · listone, tessere, registro dei movimenti

**Stato:** tre consegne chiuse. Niente è stato caricato su Supabase: vincolo di L0.

## 1. `carica-py-e-il-listone` — guasto, chiuso

`carica.py` scriveva il listone senza `momento` (colonna `not null` senza default: insert
fallita) e lo troncava insieme all'archivio, portandosi via le 8.008 quotazioni di **fine**
stagione che nei JSON non ci sono.

Non bastava toglierla dall'elenco: `listone.stagione` punta a `stagioni`, e la cascata la
raggiungeva lo stesso. Le righe di `fine` si mettono in una tabella temporanea prima del
truncate e tornano dopo, nella stessa transazione.

## 2. `carica-sh-distrugge-le-tessere` — guasto, chiuso

`misteri` era dentro `TABELLE`, `tessere` veniva travolta per cascata da `societa`.

- `misteri`, `tessere`, `incarichi`, `assegnazioni`, `schede` → salvate e rimesse (`select *`,
  così non serve conoscere colonne che stanno solo nelle migrazioni non esportate).
- `movimenti` → stesso trattamento: è archivio, ma con un caricatore suo.
- **Il `truncate` ha perso il `cascade`**, e prima c'è una guardia su `pg_constraint`: se una
  tabella si appoggia all'archivio e nessuno l'ha dichiarata, il caricamento si ferma e la
  nomina. Provato: creata una `sponsor` finta, lo script si è fermato senza toccare nulla.

La guardia ha già pescato un caso vero il primo colpo — `movimenti`, nata stasera.

## 3. `il-registro-dei-movimenti` — chiuso

Tabella `caprera.movimenti` (sette categorie) + `carica-movimenti.py`, che legge gli otto fogli
di Guido **per etichetta, non per coordinata**: la colonna dei crediti dalla sua intestazione, la
colonna delle squadre **dal contenuto** (nel 2024-25 «Squadra» sta due colonne a sinistra dei
nomi, e partendo da sinistra si pescavano le squadre del blocco in euro).

**261 movimenti, sei stagioni, dieci società.** `finanze.bonus` non è toccato: è diventato una
verifica.

- **59 righe su 60** (stagione × società): la somma dei movimenti fa le «Vincite» che il foglio
  scrive da solo. Unica eccezione: **2023-24 Mangiapreti, +1** — segnalata, non aggiustata.
- **10 su 10** contro l'archivio: movimenti 2024-25 = `finanze.bonus + ffp` del 2025-26.
- Prosecco 2025-26: 3+1+1−1+4+0−1+1+2+2+1 = **13**, il numero della consegna, ora scomposto.

**Due cose lasciate fuori, apposta:** gli euro (altra moneta), le colonne di riepilogo (sono
somme di quello che carichiamo), e l'Assicurazione **negativa** del 2024-25 — quel −5 non è
un'assicurazione, è il Caprera Etica di Smit già presente nel blocco dei motivi: caricarlo lo
conterebbe due volte.

## Collaudo

Tutto su un Postgres locale (`prova_listone`, `prova_schema`), **mai verso Supabase**:
schema ricreato da zero, caricamento rilanciato due volte con lo stesso risultato, cinque
controlli di `carica.py` superati, identità e movimenti intatti dopo il caricamento.

Limite dichiarato: `03-sicurezza.sql` non è provabile in locale (non c'è `auth.uid()`).

## Prossimo passo · handoff

- **Direttore Sportivo / L0:** applicare `04-movimenti.sql` come migrazione, poi
  `carica-movimenti.py --carica`. Richiede rete verso Supabase.
- **Match Analyst (Pirlo):** quando i movimenti sono in archivio, `/area/crediti` e la sezione
  Crediti della scheda società si possono rifare — la consegna dice poche ore.
- **Segretario (Zoff):** STATO da aggiornare — `movimenti` è la 27ª tabella, e il registro di
  Guido non è più «una fonte trovata» ma dato caricabile.
- **Aperto:** il +1 di Mangiapreti 2023-24, da chiedere a Guido. E `carica.sh --solo-regole`,
  che resta la strada giusta per allineare `regole-caprera.json` senza ricaricare 160.000 righe.
