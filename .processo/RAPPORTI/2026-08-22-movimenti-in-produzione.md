# 2026-08-22 · i movimenti sono in produzione

> Scritto dalla sessione che lavora sul codice. **Dichiarato come scavalcamento, non come prassi:**
> il database è territorio del Magazziniere, e la regola dei due tavoli resta. Qui è stato fatto
> perché la sessione del Magazziniere non ha il DSN nella sua shell — e ha fatto bene a fermarsi
> invece di andarlo a cercare altrove.

## Cosa è stato applicato

**Migrazione `caprera_registro_dei_movimenti`** — la 40ª. Contenuto identico a
`04-movimenti.sql`, riga per riga: `create table if not exists`, i tre commenti, i due indici,
RLS attiva, policy `i_miei_movimenti` (`societa = mia_societa() or sono_presidenza()`),
`revoke select ... from anon`. Additiva e idempotente: non droppa niente, non tocca
`finanze.bonus`.

**Dati** — le 261 righe di `movimenti.sql`, senza modifiche. `delete` limitato alle sei stagioni,
poi l'insert. La tabella non esisteva: la cancellazione ha colpito zero righe.

## Verifiche fatte prima, non dopo

1. **Le chiavi esterne reggono.** Le dieci `societa` del file esistono tutte in `caprera.societa`;
   le sei `stagioni` esistono tutte in `caprera.stagioni`.
2. **Le funzioni della policy esistono** — `caprera.mia_societa()` e `caprera.sono_presidenza()`.
   Una policy che chiama una funzione assente non fallisce alla creazione: fallisce alla prima
   lettura di un mister.
3. **Le sette categorie del file sono le sette del `check`** — nessun valore fuori elenco.
4. **Nessun euro è entrato.** Il valore assoluto più grande in tutto il file è 10 (Panchina d'Oro
   1º, e l'«Omicido» di Roburro con il segno meno). Le quote d'iscrizione e le vincite in euro
   sono rimaste fuori, come diceva la consegna.

## Verifiche fatte dopo, dal database

- **261 righe**, sei stagioni, dieci società.
- **10 su 10**: la somma dei movimenti **2024-25** è uguale a `finanze.bonus + finanze.ffp` del
  **2025-26** su tutte e dieci le società. Nessuno scarto. Questo è il controllo che il Magazziniere
  aveva già superato in locale — ora è superato in produzione, contro i dati veri.
- **Prosecco 2025-26 = 13**, il numero che nel sito era una riga sola e adesso è scomponibile in
  undici voci.
- **`anon` non legge la tabella**: `has_table_privilege` dice `false`.

## Una cosa che chiude un dubbio di stamattina

Il `−5` del Caprera Etica di Smit c'è: `('2024-25', 'smit', 'penalita', 'Solet Accusa Stupro', -5)`.
Sta dentro il totale 2024-25 che fa 7, ed è lo stesso 7 che in `finanze` 2025-26 è `bonus 5 + ffp 2`.
Quindi **non è un doppione**, e la nostra cifra resta quella giusta: la penalità era già dentro
l'archivio, e il 252 di Guido la contava due volte.

## Quello che resta aperto

- **Il `+1` di Mangiapreti 2023-24** è entrato così com'è, non aggiustato. È l'unica riga su
  sessanta (stagione × società) dove la somma dei movimenti non fa le «Vincite» che il foglio
  scrive da sé. Domanda per Guido, non per noi.
- `finanze.bonus` da adesso **è una verifica, non una fonte**. Se un giorno i due numeri divergono,
  è il caricamento a essere sbagliato.

## Chi tocca adesso

- **Match Analyst:** `/area/crediti` e la sezione Crediti della scheda società si possono rifare
  come estratto conto. Il dato c'è.
- **Segretario:** `movimenti` è la 27ª tabella e la 40ª migrazione. Il registro di Guido non è più
  «una fonte trovata».
