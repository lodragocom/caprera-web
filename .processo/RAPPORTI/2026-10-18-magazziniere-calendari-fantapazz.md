# 2026-10-18 · Magazziniere · Calendari Fantapazz

**Scope:** fonti, database e consultazione competizioni. **Stato:** FATTO.

## Cosa ho fatto

Acquisizione browser autorizzata della lega 342460: 9 calendari, 4 classifiche,
64 formazioni. Aggiunti 132 incontri, 8 edizioni, 54 turni, 34 formazioni e
852 righe giocatore. Confermate identiche le 30 formazioni precedenti.
54 punteggi conclusi verificati; G5 conservata senza voti definitivi.
Nuova pagina calendari e collegamenti ai tabellini; Coppe apre il 2026-27,
senza attribuire il titolo al leader provvisorio. Turni paginati nell'archivio.

## Decisioni e verifiche

Nessuna modifica dei risultati precedenti. Riposi e incontri ancora senza
avversari conservati nella fotografia, senza società fittizie nel canonico.
Bonus casa specifico per competizione. Fonte e migrazione dati private;
solo schema e codice web pubblici. Nessuna modifica a Fantapazz.
Import provato in rollback, applicato e controllato con impronte dei dati
preesistenti. 156 migrazioni identiche (125/31). Lint e build passati;
8 test unitari e collaudi browser calendari, performance/formazioni, analisi
passati. Verificata la sessione reale dell'app su localhost:5173.

## Prossimo passo

Aggiornare la fotografia dopo il consolidamento dei voti G5 con una nuova
migrazione mirata. Per consegna ufficiale servono prima partita e orario
verificati: le sole date del calendario non bastano. Deploy distinto dal Git.

## Pattern imparato

Un calendario contiene tre cose diverse: partita, riposo e accoppiamento
ancora ignoto. Preservarle impedisce falsi pareggi e falsi partecipanti.
Per DOM annidati serializzare completamente e rifiutare marcatori di
troncamento prima di normalizzare o importare.
