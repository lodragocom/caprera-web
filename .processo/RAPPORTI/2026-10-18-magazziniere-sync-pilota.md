# 2026-10-18 · Magazziniere · Acquisizione e confronto Fantapazz

**Scope:** pipeline dati privata, prova senza scritture database.
**Stato:** FATTO il pilota; PARZIALE la sincronizzazione automatica complessiva.

## Cosa ho fatto

Nuova acquisizione autenticata di 36 turni / 180 incontri di campionato e
10 formazioni / 248 giocatori G5. Confronto semantico con la precedente
fotografia: nessuna modifica consolidata. G5 ancora provvisoria.
Ricevitore loopback temporaneo, fonti e rapporti non sovrascrivibili, parser
offline senza credenziali o accesso DB. 18 test passati, sintassi JS verificata.
Nessuna modifica all'app o ai dati Supabase; nessun deploy o cron attivato.

## Decisioni

Separare risultati visibili nel calendario da voti e totali live. Ogni
risultato nuovo/corretto rimane da verificare: il parser non ne prova la
quadratura regolamentare né la definitiva chiusura dell'intera giornata.
L'ambito indipendente dalla risposta impedisce un successo apparente su pagine
mancanti. Conservare strumenti e fotografie nel solo repository privato.

## File e prossimo passo

Strumenti in `caprera-dati/PROGRAMMI/`, fonte/rapporto in `FONTI/2026-27/`.
Protocollo canonico:
`../../../caprera-dati/PROTOCOLLI/PROTOCOLLO_Sincronizzazione_Fantapazz.md`.
Restano acquisitore server con accesso dedicato, estensione degli ambiti,
import incrementale con quadratura e pianificazione. Nessun sorgente R
disponibile; GitHub Shiny 404 nella sessione non autenticata.

## Pattern imparato

Un calendario pubblicato e un tabellino live sono due stati distinti; un
aggiornamento automatico deve confrontarli prima di proporre un risultato.
