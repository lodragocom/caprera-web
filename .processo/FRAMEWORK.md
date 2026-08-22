# Il Processo di Caprera — come funziona questo mondo

Il lunedì, dopo la giornata, si va in studio: si rivede la moviola, si discute, qualcuno si
difende. **Il Processo** è quello: lo studio dove il lavoro fatto viene rivisto, contestato e
messo a verbale. Non un archivio di log noiosi — un dibattito che lascia traccia.

Sotto, tecnicamente, è la versione **leggera** dell'ecosistema Parnaso di Salvo (quello pieno
vive in `~/dev/lodrago/_ch/docs/private/`): **un agente = un file** in `.claude/agents/`,
persona ricca, nessuna meccanica pesante. Parnaso resta il nome del sistema madre; **Il
Processo** è il nome di casa, qui a Caprera.

## Chi va in studio

Otto membri di staff più un ruolo speciale fuori quadro, elencati in [AGENTI.md](AGENTI.md).
Ognuno ha **tre dimensioni**: il **ruolo** con cui lo chiami (parla la lingua della lega),
l'**archetipo mitologico** (radice e ombra logica, il filo che tiene Caprera dentro il Parnaso)
e un **volto italiano** del calcio (il carattere operativo, lo stile con cui risolve).
Si invocano con il ruolo: `@preparatore`, oppure "Magazziniere, rigenera le formazioni".
Dal 21/08/2026 ci sono altre due porte: il **volto** chiamato a voce ("Baggio, ...", "Ringhio, ...")
e la **scorciatoia** `/baggio`, `/gattuso`, … in `.claude/commands/`. Il nome canonico resta il
ruolo: è quello con cui si firmano i rapporti. Elenco delle tre porte in [AGENTI.md](AGENTI.md).

Corrispondenza: Direttore Sportivo = Dedalo / Marotta · Curatore del Terreno di Gioco =
Atena / Baggio · Magazziniere = Efesto / Gattuso · Match Analyst = Talos / Pirlo ·
Preparatore Atletico = Apollo / Cannavaro · Segretario Generale = Mnemosine / Zoff ·
Addetto Stampa = Calliope / Quagliarella · Team Manager = Ermes / Totti ·
Responsabile Tutela della Lega = Urano / Mazzarri (crisi e proteste, fuori quadro).

I volti italiani sono **maschere di stile** interne: non compaiono sul sito né in comunicazioni
pubbliche.

## La regola unica (l'unica ferrea) — la moviola

A fine sessione, **se la sessione ha prodotto un risultato reale**, si va al replay:

1. rapporto in `.processo/RAPPORTI/AAAA-MM-GG-<ruolo>-<tema>.md`
   (modello: [RAPPORTI/_TEMPLATE.md](RAPPORTI/_TEMPLATE.md));
2. aggiornamento dei file toccati (dati, doc, protocolli);
3. una riga sul pattern imparato.

Niente rapporto a vuoto: la moviola si fa sull'azione, non sul nulla. È il meccanismo con cui
lo staff si allena e ricorda.

## La regola dei due tavoli — quando si lavora in parallelo

Nata la notte fra il 20 e il 21 agosto 2026, dopo un incidente vero: **un `cp -f` ha distrutto i
token del tema che un'altra sessione aveva appena scritto e mai committato.** Nella stessa notte
la memoria ha descritto per un'ora numeri che nel frattempo erano già cambiati.

Due regole ne discendono, non una. La seconda: **committa spesso — quello che vive solo sul disco
si può perdere**, e nessun accordo fra sessioni protegge un file non committato.

Quando due sessioni lavorano insieme, **il confine è il filesystem, non la buona volontà**:

| chi lavora sul codice | chi tiene la memoria |
|---|---|
| `caprera-web/src/` · `caprera-web/collaudo/` | `caprera-dati/` (STATO, ADR, AGGIORNAMENTI, SPIEGAZIONI, TASK, PROTOCOLLI) |
| | `caprera-web/.claude/` · `.processo/` · `theme.css` |

**Nessuno scrive nel tavolo dell'altro.** Se chi lavora sul codice deve consegnare qualcosa che
sta di là, **lo manda** e lo copia l'altro; e viceversa.

**Eccezione dichiarata — `caprera-dati/SUPABASE/` è del Magazziniere** (22/08/2026). La tabella
qui sopra diceva `caprera-dati/` per intero, ma `magazziniere.md` dice di quella cartella *«è
tuo»*: due nostre regole si contraddicevano, e chi ci è passato in mezzo ha fatto bene a fermarsi
e chiedere. **Vale `magazziniere.md`**, per la ragione che rende la regola sensata: `SUPABASE/` è
**materiale di lavoro sul database**, non memoria. Lo STATO, gli ADR, le SPIEGAZIONI, i TASK e i
PROTOCOLLI restano del Segretario.

> Il criterio, per la prossima volta che il confine è ambiguo: **la memoria racconta, il materiale
> esegue.** Un file che qualcuno lancia o che il database legge è materiale. Un file che si legge
> per capire è memoria.

`theme.css` sta con la memoria e non col codice per un motivo preciso: **è il design system**, cioè
il territorio del Curatore. Toccarlo di passaggio, mentre si fa altro, è come cambiare le regole
della lega perché faceva comodo in quella partita.

Chi finisce per primo **lo dice**, con i numeri veri di quello che ha cambiato: la memoria si
riallinea una volta sola, sui fatti, invece di inseguire.

### E se il guasto si ripara solo nel tavolo dell'altro?

**Si consegna.** Deciso da L0 il 22/08/2026, dopo il primo caso reale: `.avviso`, `.pos` e
`tr.podium` stavano in CSS di pagina, e chi arrivava **dritto** su Ranking le trovava vuote. Il
guasto era vero, la correzione stava in `theme.css`, cioè di là.

Non «si tocca dichiarandolo». **Si consegna**, e la ragione è che un confine con un'eccezione per
urgenza non è un confine: la prossima volta è urgente pure quella.

Le consegne stanno in **[CONSEGNE/](CONSEGNE/)** e hanno un formato: `AAAA-MM-GG-a-<ruolo>-<tema>.md`.
Chi le applica le chiude scrivendo l'esito in fondo.

Ma consegnare non vuol dire segnalare e aspettare. **La consegna è pronta da applicare:** il file
esatto, le righe esatte, e *perché* — non «le classi del podio andrebbero spostate». Chi riceve
deve poter incollare e verificare, non indagare. Fatta così, il costo del confine sono minuti, non
giorni, e il guasto non resta aperto per rispetto della procedura.

**Debito retroattivo:** lo spostamento di `.avviso`, `.pos` e `tr.podium` in `theme.css` è già
stato fatto, prima che questa regola esistesse. La correzione è giusta e resta; **va ratificata
dal Curatore**, come i token del tema del 21/08.

## Il vocabolario dello studio

| Come lo chiamiamo | Cos'è tecnicamente | Dove sta |
|---|---|---|
| **La moviola** | rapporto di fine sessione: cosa è stato fatto, cosa è stato deciso, cosa resta | `.processo/RAPPORTI/` |
| **Il dibattito** | deliberazione fra più ruoli quando la decisione tocca più territori | `.processo/TAVOLI/` |
| **La sentenza** | ADR: la decisione messa a verbale, con alternative e conseguenze | `../caprera-dati/ADR/` |
| **Il verbale** | lo STATO: la fotografia sempre-corrente del progetto | `../caprera-dati/STATO_PROGETTO_Caprera.md` |
| **La rassegna** | gli aggiornamenti datati di sessione | `../caprera-dati/AGGIORNAMENTI/` |
| **Il manuale** | i framework che lo staff indossa (Six Hats, 5 Whys, SWOT…) | `.processo/LIBRERIA/` |
| **La consegna** | il lavoro che sta nel tavolo di un altro, pronto da applicare | `.processo/CONSEGNE/` |

## Dove vive la memoria

| Cosa | Dove | Chi la tiene |
|---|---|---|
| Stato del progetto (verità unica) | `../caprera-dati/STATO_PROGETTO_Caprera.md` | Segretario |
| Aggiornamenti di sessione "pesanti" | `../caprera-dati/AGGIORNAMENTI/` | Segretario |
| Moviole di fine sessione | `.processo/RAPPORTI/` | ogni membro dello staff |
| Framework che lo staff indossa | `.processo/LIBRERIA/` | Segretario |
| Decisioni che pesano (ADR) | `../caprera-dati/ADR/` | Direttore Sportivo decide, Segretario scrive |
| Dibattiti multi-ruolo | `.processo/TAVOLI/` | Direttore Sportivo apre, Segretario sintetizza |
| Consegne fra tavoli | `.processo/CONSEGNE/` | chi trova il guasto scrive, chi ha il territorio applica |
| Protocolli operativi, regole, task | `../caprera-dati/PROTOCOLLI/`, `REGOLE/`, `TASK/` | Segretario + Magazziniere |

**Regola anti-doppione:** lo STATO e i TASK canonici stanno in `caprera-dati/`.
`.processo/` non li duplica: li linka.

## Confini del mondo

- Il sito è **statico da servire** ma **legge da Supabase**: nessun backend proprio (`../backend` è superato). Le interrogazioni passano tutte da `src/lib/archivio.js`.
- Il sito legge le **finestre in `public`**, non lo schema `caprera` (ADR-002). **Contratti, finanze e mister non hanno finestra.**
- L'accesso è la **Tessera del Tifoso** (ADR-003): la società **non si sceglie**, la assegna la Presidenza. **La riservatezza la fanno le regole di riga, non le pagine.**
- ⚠️ **Lo schema non è tutto nei file**: le finestre di `public` e le tessere vivono solo nel progetto Supabase. Primo debito aperto — non fidarti di `01/02/03.sql` come fotografia della produzione.
- I file in `src/data/` sono **generati**: non si editano a mano, si rigenera la pipeline e si ricarica il database.
- Le regole della lega stanno in `../caprera-dati/REGOLE/regole-caprera.json`, non nel codice.
- **Hosting deciso**: Cloudflare Pages su `lega.federazionecaprera.com` (`../caprera-dati/ADR/ADR-001-Hosting-Cloudflare.md`). Resta da eseguire.
