# 18 ottobre 2026 — Import delle formazioni delle giornate 3 e 4

Due HTML forniti da Salvatore, dieci squadre per file. Estratte e conservate
solo le informazioni sportive nel repository dati privato. Import transazionali
verificati in rollback e applicati: 256 giocatori / 8 entrati alla 3ª e
251 / 13 alla 4ª; venti fantapunteggi su venti identici ai risultati esistenti.
Impronte dei dati preesistenti invariate, compresa la giornata 2 già caricata.

Importatore parametrizzato con `--giornata` e `--versione`, validazione della
fonte e blocco su versione già usata o partita già importata. Una squadra
può avere meno di undici voti: Armata Rossa, giornata 3, nove voti e 55 FP.
Il testo in Formazioni distingue ora il titolare senza voto dal subentrato
effettivo, senza presumere che ogni assente sia stato sostituito.

Lint e build completati; controlli SQL su entrambi gli import superati.
Verifica browser sul database reale: apertura automatica sulla 4ª, Prosecco
72,5 FP alla 3ª e 75,5 alla 4ª; Armata Rossa alla 3ª, 55 FP e due titolari
senza voto. Confermata la nuova legenda senza sostituzioni presunte.
Documentazione aggiornata: STATO, protocollo dati, fonti, programmi e aggiornamenti.
Resta da acquisire la giornata 1; le giornate 2–4 sono disponibili.

**Pattern:** contare gli undici titolari per validare lo schieramento, ma
usare i voti e i subentri della fonte per ricostruire il totale.
