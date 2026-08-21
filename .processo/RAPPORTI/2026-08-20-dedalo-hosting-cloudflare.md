# 2026-08-20 · dedalo · hosting del sito: Vercel o Cloudflare

**Scope:** decisione di deploy · **Stato:** DECIDO — FATTO

## Cosa ho fatto
Deciso l'hosting di `caprera-web`: **Cloudflare Pages**, sottodominio
`lega.federazionecaprera.com`, WordPress intatto. Scritto `../caprera-dati/ADR/ADR-001-Hosting-Cloudflare.md`
(cartella `ADR/` aperta con questo, prima non esisteva), riscritta la Variante A del
`PROTOCOLLO_Deploy_Sito.md` (parlava di `vercel.json`), aggiornati STATO e `TASK_Sito_Web.md`.

## Decisione, in una frase
Cloudflare Pages perché **Guido è co-owner di fatto del meccanismo Caprera** e Cloudflare è la
sua preferenza dichiarata — non per merito tecnico di Cloudflare su Vercel.

## Perché non l'ho decisa sui numeri
Sui numeri le due sono quasi pari: il sito è statico, 1,5 MB, nessuna funzione serverless,
nessuna image optimization. Vercel non offre nulla che Caprera usi, ma nemmeno costa nulla a
questa scala. Il criterio che discrimina è **umano**: su Spazzacamino i push di `guimaggio`
venivano bloccati perché l'utente GitHub non era nel team Vercel. Guido qui non è un ospite:
mantiene la Shiny, è la fonte dei dati storici, e la Fase 1 gli manda un Excel. Rimetterlo
davanti allo stesso attrito è ripetere un problema già pagato.

Esiste già il pattern canonizzato in Parnaso — *"l'hosting si sceglie allineato al cliente
co-owner, non alla preferenza del developer"* (ADR Cloudflare Spazzacamino, 26/04/2026). Questo
è il secondo uso reale: **candidato alla canonizzazione in METHOD**.

## Alternative scartate
- **Workers + Static Assets** (come Spazzacamino): un custom domain su Workers vuole la zona DNS
  su Cloudflare. Ho verificato: `federazionecaprera.com` ha i nameserver su Hostpoint e serve il
  WordPress **in produzione**. Spostare i nameserver per pubblicare un sottodominio è un rischio
  sproporzionato al beneficio. Pages accetta un CNAME da DNS esterno: un record, zero rischio.
- **Vercel su sottodominio**: vedi sopra.
- **Sottocartella WordPress `/lega/`**: non scartata, **retrocessa a piano B**. Zero hosting
  nuovo, ma deploy manuale via FTP e `.htaccess` da custodire.
- **GitHub Pages**: nessun vantaggio, deploy da scriptare.

## Reversibilità
Alta. È statico: si sposta in un pomeriggio, e il piano B è già scritto nel protocollo.
Per questo non ho aperto un tavolo: una decisione reversibile non merita una deliberazione.

## File toccati
- `../caprera-dati/ADR/ADR-001-Hosting-Cloudflare.md` (nuovo) + `ADR/README.md` (nuovo)
- `../caprera-dati/PROTOCOLLI/PROTOCOLLO_Deploy_Sito.md` (Variante A riscritta, Vercel archiviata come D)
- `../caprera-dati/STATO_PROGETTO_Caprera.md`, `TASK/TASK_Sito_Web.md`

## Prossimo passo
Non è il deploy. Sono i **tre prerequisiti**, in quest'ordine:
1. **Efesto** — credenziali: due `.env` in chiaro + chiave Builder.io nel repo. Pubblicare prima
   di aver bonificato significa pubblicare da un repo compromesso.
2. **Apollo** — `lint`, `build`, i due collaudi browser. La baseline dei 77 KB è del 19/08.
3. **Salvo** — destino del repo `lodragocom/caprera`, e la parola a Guido e alla Presidenza.

## Handoff aperti
- **Efesto** → bonifica credenziali (blocca il deploy).
- **Apollo** → misura + collaudo (blocca il deploy).
- **Talos/Atena** → `public/_redirects` con `/*  /index.html  200` quando si esegue: senza,
  il sito sembra funzionare e muore al primo refresh su una rotta interna.
- **Salvo** → repo, sottodominio (`lega.` è una proposta), e se l'area mister va pubblicata
  mentre l'autenticazione è finta.

## Pattern imparato
Quando due opzioni sono tecnicamente pari, **non si decide sulla tecnica**: si cerca il vincolo
umano o organizzativo, e quello decide. Qui era Guido, e stava già scritto in un ADR di quattro
mesi fa su un altro progetto. Corollario: il primo posto dove cercare una decisione è la memoria,
non il ragionamento.
