# 2026-08-20 · mnemosine · aggiornamento STATO

**Scope:** `../caprera-dati/STATO_PROGETTO_Caprera.md`
**Stato:** FATTO

## Cosa ho fatto
- Aggiornata la data in testa (era 2026-08-19, letta dal sistema: 2026-08-20 21:59 CEST).
- Corretta la voce "Sito React": non sei pagine ma **quindici pubbliche** più l'area mister con sette sezioni. Verificato leggendo `src/pages/`, `src/pages/area/` e le rotte in `src/App.jsx`.
- Aggiunto il **collaudo browser** (`collaudo/collaudo-sito.mjs`, `collaudo-area.mjs`) fra le cose che esistono, con il motivo per cui esiste (errore JS = pagina mezza vuota, già capitato con Coppe).
- Dichiarata esplicitamente l'**assenza di autenticazione vera** nell'area mister: `src/lib/auth.jsx` è anteprima senza password, sessione in memoria, Supabase in `package.json` ma non collegato. Era un fatto noto ma non scritto nello STATO, ed è il prerequisito della Fase 1.
- Precisata la sezione **Formazioni** dell'area mister: il codice c'è (`src/pages/area/Formazioni.jsx`), la resa va confermata col collaudo. Fatto e intuizione separati.
- Registrato il **team di otto agenti** con path, ruoli e la regola anti-doppione.
- Marcata la baseline **77 KB gzip** come misurata il 19/08 e da rimisurare; aggiunto il punto aperto #7 (misura + collaudo pre-deploy, territorio Apollo).
- Corretta la numerazione della lista "Aperto / prossimi passi" (c'erano due `3.` e due `4.`).

## Decisioni prese (e alternative scartate)
- **Una sola verità.** Lo STATO resta in `caprera-dati/`; `.processo/` linka e non copia. Scartata l'alternativa di uno `STATO-CAPRERA.md` dentro `.processo/`: avrebbe prodotto due stati divergenti in poche sessioni.
- **Non ho promosso** motore, coppe e formazioni da "In corso" a "Stato attuale" pur essendo dichiarati fatti: la distinzione fra i due blocchi è di Salvo, e riscriverla era oltre il mandato di questa sessione.
- Baseline non ricalcolata: non è il mio territorio, e un numero senza misura è un'ipotesi. È diventato un punto aperto con un proprietario.

## File toccati
- `../caprera-dati/STATO_PROGETTO_Caprera.md` (aggiornato)
- `../caprera-dati/AGGIORNAMENTI/AGGIORNAMENTO_2026-08-20b_Team_Agenti_Caprera.md` (nuovo)
- questo rapporto

## Prossimo passo
Apollo: `npm run lint`, `npm run build` e i due collaudi browser. Serve il numero per il punto #7 e per la decisione di deploy.

## Handoff aperti
- **Apollo** → misura del bundle dopo le pagine nuove + collaudo completo.
- **Dedalo** → la decisione sull'autenticazione vera merita un ADR; la cartella `ADR/` non esiste ancora, si apre al primo.
- **Efesto** → il debito di sicurezza (due `.env` in chiaro, chiave Builder.io nel repo) è ancora aperto e precede il deploy.

## Pattern imparato
Lo STATO invecchia sulle voci **descrittive** ("sei pagine"), non su quelle datate: le prime nessuno le rilegge. Quando aggiorno, la prima cosa da rifare è il confronto fra ciò che il documento *descrive* e ciò che il filesystem *contiene*. Secondo pattern: quello che è vero ma non scritto (l'auth finta) diventa una sorpresa al momento peggiore — si scrive anche se "lo sappiamo".
