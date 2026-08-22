# 2026-08-22 · al Magazziniere · `carica.py` e il listone

> Consegna della sessione che lavora sul codice. **Verificato sul database vivo e sul file**, non
> dedotto. Non l'ho applicata: `SUPABASE/` è tuo, e c'è già una consegna aperta sullo stesso file.

**Stato:** aperta · **Gravità: media** — perdita di dati, ma rumorosa: oggi lo script si ferma.

---

## Cosa è cambiato stasera

`caprera.listone` ha una colonna nuova, **`momento`** (`'partenza'` | `'fine'`), `not null` e
**senza default**. Migrazioni `caprera_listone_partenza_o_fine` e
`caprera_listone_via_la_chiave_vecchia`.

Il perché in una riga: Fantapazz muove le quotazioni durante l'anno, e solo quella **di partenza**
si può mettere accanto a quanto si è pagato all'asta. Yildiz vale 27 sul listone di partenza e 46
su quello scaricato dopo; alla Disperata è costato **1 credito**. Prima le due erano
indistinguibili e il sito le confrontava come se fossero la stessa cosa.

In archivio adesso: **680 righe `partenza`** (2025-26) e **8.008 `fine`** (2016-17 → 2024-25).

## Il guasto

`carica.py` riga **211**:

```python
copia(cur, 'listone', 'stagione, nome, ruolo, club, prezzo', righe_listone)
```

Non scrive `momento`, che è `not null` senza default. **L'insert fallisce.** Questo è il male
minore: si ferma, non sbaglia in silenzio.

Il male maggiore è la riga **57**: `listone` è dentro `TABELLE`, quindi il `truncate` in testa
allo script **porta via tutte e 8.688 le righe** — comprese le nove stagioni di `fine`, che nei
JSON non ci sono e che tornerebbero solo rilanciando
`SUPABASE/listoni-fine-stagione.sql`.

È **la stessa famiglia** del guasto delle tessere già in coda a te: una lista scritta il 20/08 che
non conosce quello che è nato dopo.

## Cosa serve

`listone.json` è il listone **di partenza** del 2025-26 (680 righe, dal file
`06_caprera_project/Listone_Fantapazz.csv`). Quindi:

```python
copia(cur, 'listone', 'stagione, momento, nome, ruolo, club, prezzo', righe_listone)
```

con `'partenza'` nella tupla. E il `truncate` va ristretto a quel momento — `delete from
caprera.listone where momento = 'partenza'` — altrimenti un caricamento dell'archivio corrente
cancella nove anni di quotazioni che non ha modo di ricostruire.

**Come si verifica:** dopo la modifica, `select momento, count(*) from caprera.listone group by 1`
deve dare `partenza 680` e `fine 8008` **anche dopo** aver lanciato il caricamento.

## Cosa resta da decidere — tuo

- **Il 2025-26 `fine` non è caricato.** `listoni-fine-stagione.sql` lo contiene (839 righe), il
  database no: ho caricato solo le nove stagioni chiuse. Il sito non cambierebbe di una virgola —
  preferisce sempre `partenza` — ma file e database resterebbero allineati. Non l'ho fatto perché
  è dato che nessuno mostra, e aggiungerlo di mia iniziativa non mi sembrava mio.
- **`carica.sh --solo-regole`**, che ti eri già chiesto: vale doppio adesso. Il `regole-caprera.json`
  è stato completato oggi e il database non lo vede, e l'unica strada che c'è oggi per allinearlo
  passa da uno script che cancella le tessere *e* il listone.
