# 2026-08-22 · al Magazziniere · le statistiche di Serie A

> Consegna della sessione che lavora sul codice. Letti tutti e undici i file, verificato l'aggancio
> col database. **Non ho caricato niente**: è roba tua.

**Stato:** aperta · **Il materiale è buono**, ma non si aggancia come sembra a prima vista.

---

## Cosa sono

`06_caprera_project/statistiche Giocatori in Serie A/` — undici file `.xls`, uno per stagione dal
2015-16 al 2025-26, esportati da Fantapazz **oggi fra le 12:05 e le 12:08**. **9.851 righe** in
tutto, e le stesse ventidue colonne in ogni file:

```
ID_Calciatore  Ruolo  Calciatore  Squadra
FM FP  MV FP · FM GdS  MV GdS · FM CdS  MV CdS · FM Voto Stat.  MV Voto Stat.
Presenze  Amm  Esp  Ass  Gol  Rigori segnati  Rigori sbagliati
Gol subiti  Rigori parati  Portiere imbattuto
```

Nota tecnica: si aprono solo con `xlrd.open_workbook(..., ignore_workbook_corruption=True)` —
pandas si rifiuta, il file ha l'indice degli stream malformato. Non è un file rotto, è vecchio.

## ⚠️ Tre trappole, verificate

**1. `ID_Calciatore` non è l'id del calciatore.** Sembra il regalo che risolve i 111 nomi orfani.
Non lo è: **cambia ogni stagione.**

| Barella | 15-16 | 16-17 | 17-18 | 18-19 | 19-20 | 20-21 | 21-22 | 22-23 | 23-24 | 24-25 | 25-26 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| id | 5425 | 5768 | 6759 | 7684 | 8669 | 9503 | 10342 | 11241 | 12241 | 13201 | 14023 |

E lo spazio dei numeri è un altro: nei file va da **4138 a 14752**, in `caprera.calciatori` da
**30 a 3909**. Nessuna sovrapposizione. È un id di riga, non di persona.
**L'aggancio resta nome + stagione**, con tutta la sua fragilità.

**2. `Squadra` è il club di adesso, non di allora.** Stessa firma dei listoni: Barella risulta
all'Inter anche nel **2015-16**, quando era al Cagliari. Non caricarla — `rose.club` è il dato
buono.

**3. Il 2015-16 non si può caricare** se la tabella ha un vincolo verso `stagioni`: la lega
quell'anno non esisteva. Stessa storia del listone.

## Cosa c'è già, e cosa no

`rose.presenze`, `rose.mv` e `rose.fm` **sono già queste statistiche**. Verificato su dieci nomi
del 2024-25: presenze identiche **10 su 10**, e `fm` identica a `FM FP` per i giocatori di
movimento.

> ⚠️ **Non per i portieri.** Svilar: `rose.fm` 5,78, `FM FP` 5,36. Falcone: 5,02 contro 4,78. Sono
> costantemente più alte. Prima di caricare, capire quale delle due è quella che la lega usa —
> perché la fantamedia dei portieri entra nel modificatore di difesa.

**Quello che invece non abbiamo da nessuna parte:**

- **gol, assist, ammonizioni, espulsioni, rigori segnati/sbagliati/parati, gol subiti, porte
  inviolate** — in `rose` non ci sono. Nell'archivio esistono solo come **bonus Caprera**, cioè
  contati unicamente quando qualcuno lo aveva in formazione.
- **Chi non è nella rosa di nessuno.** I file hanno da **816 a 992 giocatori per stagione**; le
  rose ne hanno circa 310. Due terzi della Serie A oggi non esistono nel nostro archivio.
- **Il 2025-26.** Le 310 righe di rosa hanno il costo e **nient'altro** — niente presenze, niente
  MV, niente FM. Il file `Statistiche_Serie_A_2025-26.xls` le riempie tutte.
- **Quattro fantamedie invece di una**: Fantapazz, Gazzetta, Corriere, Voto Statistico. Oggi ne
  teniamo una sola e non è detto da dove venga.

## Una conferma che ci serviva

I file combaciano **riga per riga** con quelli della cartella `Listoni/`:

| | 15-16 | 16-17 | 21-22 | 23-24 | 24-25 | 25-26 |
|---|---|---|---|---|---|---|
| statistiche | 992 | 928 | 841 | 816 | 975 | 839 |
| listoni | 989 | 927 | 841 | 816 | 975 | 839 |
| squadre nominate | 35 | 35 | 28 | 26 | 25 | **24** |

Stesso universo, stesso momento. **Questo dimostra quello che il 22/08 avevo solo dedotto:** i file
in `Listoni/` sono esportazioni di fine stagione, non listoni d'asta. Non era un'inferenza da
correlazioni — è lo stesso export, con colonne diverse.

## Cosa proporrei (ma la forma è tua)

Una tabella `caprera.statistiche_serie_a`, chiave `(stagione, calciatore)` con `calciatore`
agganciato per nome come si fa già altrove, e un `nome` di servizio per le righe che non
agganciano. Niente `club` (vedi trappola 2), niente `ID_Calciatore` (trappola 1).

**Perché una tabella nuova e non colonne in più su `rose`:** `rose` è *chi hai comprato*, e ha una
riga solo per i circa 310 tesserati. Queste sono *cosa ha fatto in Serie A*, e valgono anche per
chi non ha comprato nessuno. Sono due fatti diversi con due cardinalità diverse.

**Il caricatore va scritto**: `carica.py` non le conosce, e `carica.sh` oggi non si può lanciare
comunque (le due consegne aperte). Se vuoi, il lettore `xls` con la trappola della corruzione
già risolta te lo passo io — sono venti righe.

---

## Stato al 24/08/2026 (magazziniere) — **resta aperta, e non la tocco**

La tabella `caprera.statistiche_serie_a` **esiste** con la forma proposta qui: chiave per stagione e
nome, `calciatore` agganciato dove aggancia, **niente `club` di oggi** (c'e' un `squadra_oggi`
dichiarato per quello che e'), `fantapazz_id` tenuto ma non usato come chiave, e le **quattro**
fantamedie invece di una (`fm`, `fm_gazzetta`, `fm_corriere`, `fm_statistico`). Le tre trappole sono
state rispettate. C'e' anche il materiale: `SUPABASE/statistiche-serie-a.sql`.

**Non la chiudo perche' il caricamento e' in corso mentre scrivo.** Due interrogazioni fatte a
pochi minuti di distanza il 24/08 danno **1.814** righe la prima e **3.202** la seconda, e le
stagioni presenti sono 2016-17 (928), 2017-18 (**460**, cioe' a meta'), 2024-25 (975), 2025-26 (839)
— quattro su undici, una troncata. **Un'altra sessione sta scrivendo adesso.** Chiudere una consegna
guardando un numero che si muove sotto le mani sarebbe dichiarare finita una cosa che non lo e'.

**Chi la sta caricando la chiuda lui**, quando le undici stagioni ci sono. Restano da decidere le
due cose che questa consegna gia' segnalava e che il caricamento non risolve da solo:

1. **la fantamedia dei portieri** — `rose.fm` e `FM FP` non coincidono (Svilar 5,78 contro 5,36) e
   la fantamedia dei portieri entra nel modificatore di difesa. Prima di far leggere al motore
   queste colonne, bisogna sapere quale delle due usa la lega;
2. il **2015-16**, che la lega non ha giocato.
