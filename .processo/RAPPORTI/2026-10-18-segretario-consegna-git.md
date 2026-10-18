# 18 ottobre 2026 — Consolidamento documentazione e consegna Git

Salvatore richiede l'aggiornamento di caprera-dati secondo protocollo e il
push su git.lodrago.ch e GitHub. Il lavoro comprende tutte le modifiche della
sessione: stagione corrente, rose e listone, bozze/consegna, Panoramica e
analisi, Performance, formazioni della giornata 2 e correzione errori auth.

Aggiornati STATO, AGGIORNAMENTI e indice, inventario delle fonti, catalogo
programmi e protocollo dati. Il protocollo del 19 agosto assumeva ancora
JSON statici: ora la parte operativa descrive gli import Supabase verificati
e conserva la procedura precedente come riferimento storico.

Destinazioni: web su origin e github; dati sul solo origin privato. Le fonti
economiche e le migrazioni riservate restano in caprera-dati. Controllo mirato
delle modifiche senza chiavi private, token GitHub, JWT o URI con credenziali.
Quattordici test unitari superati; lint, build e collaudi browser mirati erano
già stati completati nella sessione senza successive modifiche al prodotto.
Nessun import rigiocato e nessuna ricarica generale del database.

L'esito della pubblicazione si verifica dai riferimenti dei tre remoti;
il deploy Cloudflare resta una verifica distinta dal push Git.

**Pattern:** documentare il percorso effettivamente usato, distinguendo
snapshot di dati, sorgenti versionate, database applicato e sito distribuito.
