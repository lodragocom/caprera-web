# 2026-10-18 · magazziniere · Rose attuali e storico Shiny

**Scope:** Clubs → Rose, acquisizione, database e vista nativa.
**Stato:** FATTO per questa sezione.

## Cosa ho fatto

- Acquisite tutte le società e tutte le pagine: 3.193 righe, 106 riepiloghi,
  92 voci di assenza con tre misure. Null e arrotondamenti preservati.
- Nuove tabelle snapshot e import transazionale, prima annullato poi applicato.
  Controllati invariati sette insiemi di dati canonici, inclusi contratti e finanze.
- Vista pubblica sportiva e privata con contratti/Wage tramite RPC autorizzata.
  Fonti e SQL contenente valori contrattuali esclusivamente nel repository dati.
- Ricerca, stagioni, ruolo, ordinamento, paginazione, grafici e accessi da Rose.
- Protocollo, inventario fonti, STATO e regola esportazione migrazioni allineati.
- Conferma di Salvatore: prima giornata a pareggio per tutti, nessuna formazione inventata.

## Verifiche

Lint/build, otto test analisi/stagioni, collaudo dedicato Rose e tre regressioni
browser (Analisi, Performance/Formazioni, Schiera). Accesso reale alla nuova
pagina e permessi SQL verificati; il solo mister collegato ha incarico globale,
perciò il caso ordinario resta coperto da condizione SQL e UI simulata.

## Prossimo passo

La replica completa delle altre sezioni Shiny resta un'attività distinta.
Lo snapshot non attiva una sincronizzazione periodica e non cambia le regole di gioco.

## Pattern imparato

Un grafico di assenze valorizzate è una serie cumulata: moltiplicare il conteggio
per la quotazione attuale altera la fonte. Acquisire tutte le metriche pubblicate.

## Chiusura protocolli e Git, richiesta successiva del 18 ottobre

Consegna funzionale: web `f19d394` pubblicato su origin e GitHub, dati
`cb366b2` su origin privato. Tutte le 154 migrazioni allineate.
Aggiornati Dati, Deploy, STATO, aggiornamento di sessione e COMANDI:
rimossa la giornata 1 dall'elenco import mancanti; corretto il riferimento
al deploy mai effettuato; esplicitati riuso delle porte locali e controllo
degli hash remoti. Solo documentazione, nessuna nuova modifica al database.
Controllo di questa revisione: coerenza dei riferimenti e `git diff --check`.
Pattern: il commit inviato e la build online sono due esiti distinti,
da registrare con evidenze separate.
