# Prima consegna delle formazioni

Obiettivo: giocare la stagione in Caprera conservando dati e archivio.
Voti Fantapazz/Shiny confermati da Salvatore.

Implementato nell'interfaccia locale: editor `/area/schiera`, scelta modulo e
titolari, panchina ordinata, bozza persistente e consegna con revisione.
**Database reale attivato:** cinque migrazioni registrate, 310 righe di rosa
corrente e dieci partecipazioni dall'export 342460 fornito da Salvatore; tre
tabelle nuove (turni, consegne, bozze). Riconosciuto il campo `rose.momento`
nel sopralluogo dello schema vivo e aggiunto `corrente` senza alterare le foto
di partenza/fine. 217 agganci univoci, 93 senza id calciatore: nessun nome indovinato.
La selezione è possibile per tutte le righe di rosa. Nessuna scrittura nelle
formazioni storiche; identità, rosa, lega, ruoli e scadenza controllati sul server.

Verifiche: lint e build; 6 test di validazione/errori auth; 21 prove SQL su cluster
temporaneo (invii, bozze, revisioni, scadenze, permessi, isolamento della società
e delle fotografie della rosa).
Il collaudo browser dedicato passa (invio, panchina, persistenza, modulo,
conflitto, scadenza, rosa assente, bozza senza turno, incontro futuro e telefono);
usa auth e RPC simulate. In produzione: impronte delle tabelle storiche identiche
prima e dopo il caricamento; lettura dei 31 giocatori Prosecco e salvataggio
bozza con ruolo authenticated verificati, annullando la bozza di prova.
I collaudi generali della
lega richiedono il database completo, non presente sul banco locale.

Fonte corrente esplicitata da Salvatore: `https://caprera.shinyapps.io/caprera/`.
La dashboard aggiornata al 18/10 mostra risultati fino alla quarta e presenta
la quinta. Collegati i cinque incontri futuri, Prosecco–Roburro compreso;
aggiunti successivamente i 20 risultati delle giornate 1–4 e le dieci righe
di classifica 2026-27 dalla stessa fonte, con controllo di punti/gol/bilanci
e impronta delle stagioni precedenti identica. Il repository GitHub indicato dalla
Shiny non è pubblicamente leggibile; Chrome non è connesso agli strumenti di
questa chat, la sua sessione non è stata riutilizzata o estratta.

Limiti: calendario Shiny consultato senza orario di inizio Serie A, quindi
nessun turno ufficiale o scadenza inventato. La bozza è esplicitamente distinta
dalla consegna e non la sostituisce. Mancano rilascio web, apertura turni da
pannello, recupero della formazione precedente e integrazione voti/sostituzioni/
risultati. Regola confermata: blocco globale cinque minuti prima della prima
partita del turno reale, anche se le partite finiscono lunedì. Il parametro
sostituzioni nel database è ancora 4, mentre il documento 2026-27 prevede 5:
non è stato aggiornato globalmente per non alterare i calcoli storici.

Protocollo canonico:
`caprera-dati/PROTOCOLLI/PROTOCOLLO_Consegna_Formazioni.md`.

Pattern: la consegna è un'intenzione del mister; il risultato importato è
un fatto storico. Tenerli separati permette di aggiungere il gioco senza
riscrivere l'archivio.

## Correzione accesso — messaggio password

Trovata una traduzione troppo generica in `auth.jsx`: qualsiasi errore con
«at least» o «password should be» diventava «servono almeno sei caratteri».
Estratta in `erroriAuth.js`: solo un errore esplicito di lunghezza viene tradotto
come tale, riportando il minimo effettivo del server. Gli altri dettagli restano
visibili. Tre test di regressione, lint e build passano. Nessuna credenziale
modificata o inviata per la diagnosi. Le impostazioni pubbliche di Auth non
espongono i requisiti della password: motivo preciso del rifiuto non verificato.

## Stagione corrente nel sito

Corretto il blocco che escludeva la stagione non conclusa da rosa e classifica.
La stagione aperta è ora la fonte della selezione in area mister, rose,
classifica, risultati, homepage e scheda società. Le rose preferiscono la
fotografia corrente senza mescolarla a quelle storiche; contratti e crediti
seguono l’anno corrente e non sostituiscono dati mancanti con quelli dell’anno
prima. Classifica perpetua e titoli rimangono limitati alle stagioni concluse.
Build/lint e due test di regressione passano; collaudo browser dedicato passa
per rosa corrente, ritorno all’archivio, pagine pubbliche e panoramica.
I fantapunti aggregati della Shiny e quelli delle partite differiscono di 2
per società: conservati i valori della fonte, senza correzioni arbitrarie.
