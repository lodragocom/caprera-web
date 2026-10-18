# Costi delle rose correnti

Fonte ribadita da Salvatore: `06_caprera_project/Caprera 26-27/Rose-Lega-Fantapazz-342460-Divisione0.xls`.
Impronta SHA256 uguale alla copia in `caprera-dati/FONTI/2026-27/`.
Verificati nel database tutti i 310 nomi, ruoli, club e costi, identici alla fonte.
Dieci rose complete di 31 giocatori (6P,9D,9C,7A).

Allineati i dieci `finanze.spesi` 2026-27 (prima null): 2.520 crediti in totale.
Prosecco 229. La migrazione contenente i dati finanziari rimane nel repo privato
`caprera-dati/SUPABASE/migrazioni-dati/20261018120000_caprera_costi_rose_correnti.sql`.

Controllo in transazione annullata e successiva applicazione riusciti.
Confronto esatto di ogni riga finanziaria prima/dopo: cambiano solo i dieci valori
`spesi` della stagione corrente; scambi, residui, budget e storico intatti.
Nel pannello Crediti, aggiunta successivamente una nota sui residui non disponibili
e impedito il calcolo di un saldo quando il saldo scambi è sconosciuto.

Completato poi il calendario dalla Shiny: lette 100+80 righe della tabella,
verificati i 36 turni e tutti gli accoppiamenti. Aggiunti 155 incontri futuri;
le 25 gare già presenti e ogni partita storica sono rimaste identiche.
Nessuna data o scadenza dedotta dagli accoppiamenti.

Listone corrente completato: 310 quotazioni dalle tabelle delle rose, 306
dall'export degli svincolati scaricato dalla Shiny, nessun doppione. Confronto
nome/società con l'export rose verificato per tutti i 310. Caricate 616 righe
con momento `fine` (convenzione esistente per quotazioni durante la stagione).
Verificata identità dei listoni preesistenti prima/dopo. Nessun costo d'acquisto
sostituito con una quotazione. Script: `prepara-listone-corrente.py` nel repo dati
e `allinea-listone-corrente.mjs` nel web. Il CSV originale include salari e rimane
nel repository privato; la migrazione pubblica contiene solo nome/ruolo/club/quotazione.

Limiti: la pagina Fantapazz «ultime formazioni inviate» richiede login; la sessione
Chrome dell'utente non è disponibile agli strumenti correnti. La Shiny mostra le
formazioni titolari in riepilogo ma non è stata ancora importata una fonte completa
di panchine, consegne, voti e bonus. Nessuna pretesa di sincronizzazione completa.
Lint e build riusciti, con avvisi già esistenti.
Collaudo `collaudo-stagione-corrente.mjs` superato, esteso a verificare il costo
229 del Prosecco e l'assenza del saldo calcolato quando gli scambi sono null.
Due test di selezione della stagione superati. Verifica sull'app locale collegata
al database reale: pagina Crediti del Prosecco mostra 229 spesi e residui assenti,
con spiegazione esplicita; premi 2025-26 riconciliati con budget 2026-27.

Pattern: l'import della rosa non aggiorna automaticamente il bilancio; riconciliare
il totale del costo d'acquisto separatamente dalle quotazioni e dai crediti residui.
