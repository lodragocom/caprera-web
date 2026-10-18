# 18 ottobre 2026 · Panoramica e replica delle analisi Shiny

**Stato:** Panoramica e analisi native implementate e collaudate. Replica integrale Shiny parziale.

## Risultato

La Panoramica apre sulla stagione attiva: prossima gara, stato bozza/consegna,
collegamento diretto a Schiera, classifica e valore/costo della rosa, migliori
fantamedie attuali con almeno tre presenze. Lo storico rimane consultabile
in un blocco separato. Nessuna scadenza inventata.

`/area/analisi` e `/statistiche` condividono un centro di analisi nativo React,
con grafici SVG accessibili e tabelle equivalenti. Nessuna dipendenza nuova.
La vecchia pagina Statistiche non contiene più l'iframe Shiny.

Portati: andamento per società, punti/fantapunti/gol/valore rosa/Fair Play/
Panchina d'Oro/Zdenek; intervalli di giornate, casa/trasferta, selezione squadre,
valori cumulati o di giornata; grafico attacco-difesa; costi e valori delle rose,
distribuzione per reparto; listone di 616 giocatori e filtro sui 306 svincolati;
Top 11 per modulo e quotazione/MV/FM con soglia presenze; grafici delle
fantamedie e confronto MV/FM; scontri diretti; posizioni/punti storici.
Nell'area Crediti, aggiunti grafici del budget, spesa, residui e composizione
del budget usando solo i bilanci già autorizzati per quella società.

## Fonti e scritture reali

- 30 statistiche osservate nelle pagine Shiny delle giornate 2, 3 e 4.
  Tabella nuova `caprera.statistiche_giornata`, lettura pubblica dei soli
  indicatori sportivi tramite vista sottile, scritture anon/auth negate.
  Migrazioni `20261018140000` e `20261018141000`, registrate in Supabase.
- Presenze, MV FP e FM FP dalle dieci tabelle Rose attuali: 310 righe,
  265 con medie. Aggiornate solo le tre colonne della foto corrente;
  costi, nomi, proprietà e storico verificati identici. Migrazione `20261018143000`.
- Fonti salvate nel repo dati: `statistiche-giornata-shiny.json`,
  `medie-rose-shiny.json` (nomi nello stesso ordine della fonte quotazioni).
- Fantapunti di classifica e progressioni escludono il +1 casalingo, come
  la vista esistente e le classifiche Shiny; risultati e gol restano invariati.
- Il selettore di foto delle rose ora distingue anche la stagione: aggiungere
  la foto corrente non elimina le foto finali delle stagioni precedenti
  nell'indice di tutti i giocatori e nei record.

## Limiti verificati

Non è una copia integrale dichiarata completa. La Shiny si disconnette
aprendo la prima giornata; le metriche osservate sono solo 2-4 e i grafici lo
indicano. Formazioni storiche complete 2026-27/panchine/voti per giornata
non ancora importati. Previsioni, quote delle partite, migliori formazioni
previste e aggregazioni mensili richiedono formule e date di riferimento
verificate: non sostituite con euristiche. Il repository R indicato dalla
Shiny risulta privato e non ci sono file R/Rmd/Rproj nel workspace; chiesto
a Salvatore il percorso del progetto di Guido.
Il CSV degli svincolati contiene presenze fino a 40 senza periodo chiaro:
le sue medie NON sono state etichettate come rendimento corrente o importate.
Età, salari e clausole non sono stati aggiunti alle viste pubbliche.

## Verifiche

Build e lint superati (solo avvisi preesistenti). Otto test matematici/stagioni
superati: bonus casa, filtri, mancanti, costo/quote, foto per società/stagione.
Collaudo browser dedicato verifica dati correnti, 616/306 giocatori,
medie disponibili, Top 11 per FM, intervalli, Fair Play, società, storico,
pagina pubblica senza iframe e mobile 390 px senza overflow.
Regressioni aggiuntive su stagione/crediti e Schiera superate: invio, panchina,
persistenza, modulo, conflitto, scadenza, mobile e bozza senza turno.
I collaudi generali storici `collaudo-sito`/`collaudo-area` richiedono il
finto Supabase con archivio locale su 5410: non avviati contro il login reale
con le loro credenziali fittizie.

## Pattern

Replicare una dashboard significa replicare significato, periodo e provenienza
dei valori oltre al grafico. Una media senza periodo o una previsione senza
formula non si promuovono a dato ufficiale.
