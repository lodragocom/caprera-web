# 18 ottobre 2026 · Performance Shiny e formazioni della seconda giornata

**Esito:** dati importati nel database reale; interfaccia locale pronta.

## Fonti e conservazione

- HTML Fantapazz della giornata 2 fornito da Salvatore: cinque incontri,
  dieci formazioni, 254 giocatori (110 titolari e 144 riserve), 12 subentrati.
  Il parser Python conserva soltanto i campi sportivi e l'impronta della fonte.
- Shiny, Lega → Giocatori → Performance: lette tutte le 33 pagine giornaliere
  e le cinque dei riepiloghi. 3.255 righe, 465 calciatori, Serie A 1–7.
  I riepiloghi originali sono conservati anche dove mancano valori; nessuna
  sostituzione con medie ricalcolate.
- Fonti JSON e caricamenti SQL in `caprera-dati`; schema e interfaccia nel web.
  Le nuove finestre contengono solo dati sportivi già pubblici e sono di sola
  lettura per anon/authenticated, con RLS e security_invoker.

## Cambiamenti

Formazioni apre sull'ultima partita con schieramento disponibile. Distingue
caricamento, schieramento non importato e partita futura. Conta solo i bonus
dei titolari e delle riserve entrate. Il marcatore Fantapazz `Tf_no` distingue
una riserva con voto da una sostituzione effettiva.

La scheda Performance offre sei indicatori, confronto fra tre giocatori,
intervallo Serie A, filtri per nome/ruolo/club/società, tutte le colonne delle
due tabelle, Top 11 con otto moduli e quattro criteri, panchina statistica e
grafico dei migliori. L'ordine alfabetico scioglie le parità esplicitamente.
La lettura API pagina oltre il limite di 1.000 righe.

## Verifiche

Gli import sono stati provati in rollback e poi applicati. Le impronte delle
tabelle preesistenti confermano la conservazione di partite, rose, listone e
schieramenti storici. Tutti i dieci punteggi della giornata 2 sono ricostruiti
esattamente da voti, bonus e modificatori. Verificata la lettura anonima delle
nuove tabelle e l'assenza del permesso INSERT.

`collaudo-performance-formazioni.mjs` passa: giornata iniziale, bonus delle
riserve, giornate mancanti/future, 3.255 righe su quattro pagine API, sei
indicatori, filtri, valori campione Carnesecchi, Top 11, viewport 390 px senza
overflow e stagione storica senza dati. Nessun errore JavaScript.
La pagina locale collegata al database reale mostra tutti i 465 giocatori.
Lint passa con gli avvisi già presenti nel progetto; build verificata.
Passa anche `collaudo-analisi.mjs` su Panoramica, analisi, listone, scontri,
storico e telefono. `git diff --check` pulito in entrambi i repository.
I collaudi legacy dipendenti dal Postgres locale o da account di prova non
sono stati lanciati contro il database reale: usati i collaudi mirati con
auth/PostgREST intercettati e verifica in lettura nella sessione reale.

## Resta aperto

Formazioni 1, 3 e 4 ancora mancanti; le Performance individuali non permettono
di ricostruire chi il mister aveva scelto. Replica integrale Shiny e rilascio
web restano distinti da questa sezione completata. L'import è una fotografia
al 18 ottobre, non una sincronizzazione automatica.

**Pattern:** un voto in panchina non prova una sostituzione; importare il
marcatore della fonte e verificare il totale della squadra prima di applicare.
