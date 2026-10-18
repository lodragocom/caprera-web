# 2026-10-18 · Magazziniere · Import incrementale Fantapazz

**Stato:** import collaudato; automatismo server ancora da collegare.

CLI per fotografie complete: rollback predefinito, impronta esplicita per
applicare, rettifiche soggette a revisione, blocco di copertura/versione DB
divergenti, quadratura totali e classifiche, audit privato atomico prima/dopo.
Normalizzatore privato riutilizzabile, senza sovrascrivere le fonti; stato dei
risultati determinato dal calendario per incontro.

19 test JS, 4 sul normalizzatore e 11 verifiche DB in rollback superati; anche
i 18 test precedenti passano. Verificati aggiornamenti, nuovi schieramenti,
rettifiche, conflitti esterni e rollback dopo errore SQL finale. Base: 312
incontri, 64 formazioni. Nessuna variazione sportiva/economica salvata; installata
solo tabella audit con RLS, senza privilegi anon/authenticated. 157 migrazioni
allineate (126 web/31 private). Lint zero errori, warning preesistenti, build OK.
Nessuna modifica UI; collaudo mirato agli script e al database.

Cloudflare: sito esistente verificato sul dominio federazionecaprera.com,
Worker statico, GitHub main, versione 428010d Ready/100% prima dei nuovi script.
Browser Run restituisce login Fantapazz: il browser locale autenticato non vale
per il server. Utente sceglie account attuale. Nessuna credenziale persistente
o pianificazione configurata. Restano acquisizione remota completa e servizio
server; il CLI usa Node/PG e non è ancora un Worker.

Protocollo e stato canonico in `caprera-dati`, aggiornamento
`AGGIORNAMENTO_2026-10-18_Sync_Incrementale.md`.

**Pattern:** il confronto fra file non basta; prima di scrivere, verificare
la fotografia attesa contro le righe effettivamente presenti nel database.
