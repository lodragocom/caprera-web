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
