# 2026-08-21 · segretario · La verità scritta dopo il passaggio a Supabase

> La moviola della sessione. Si compila solo se c'è stata un'azione da rivedere.

**Scope:** tutta la memoria del progetto — `CAPRERA.md`, `COMANDI.md`, i due README, STATO, rassegna, ADR-002 e ADR-003, i nove file agente
**Stato:** FATTO

## Cosa ho fatto

- Riscritto **`caprera-web/CLAUDE.md` → `caprera-web/CAPRERA.md`** (rinomina chiesta da L0). Erano false tre cose: i dati JSON statici e "nessun backend collegato", `src/lib/data.js` da tenere fuori dal bundle iniziale, i collaudi "due". Aggiunte due sezioni che prima non avevano posto: **dove sta il database** e **cosa non deve mai affacciarsi in `public`**.
- Riscritto **`COMANDI.md`**: `.env` è diventato un prerequisito di `npm run dev`, è entrato `carica.sh`, ed è stato reso esplicito che rigenerare i JSON **non basta più** — senza ricaricare, il sito mostra il vecchio.
- Riscritto **`STATO_PROGETTO_Caprera.md`**: "Cos'è" e "Stato attuale" rifatte attorno al database, nuova sezione sulle tre regole della lega scoperte lavorando, lista "Aperto" ricostruita a 12 punti.
- Scritta la rassegna **`AGGIORNAMENTI/AGGIORNAMENTO_2026-08-21_Archivio_su_Supabase.md`**.
- Aperta la sentenza **`ADR/ADR-002-Vetrina-Public-Viste-Sottili.md`**.

Nessun codice e nessun dato toccati: in questa sessione si è scritta solo la memoria.

### Secondo passaggio — lo staff (stessa sessione)

L0 ha chiesto: *"e se chiamassi Marotta a legger Caprera?"*. Da lì è uscito il problema vero della rinomina: **nessuno dei nove file agente nominava `CAPRERA.md`**, e col nome nuovo il file non si carica più da solo. Lo staff avrebbe continuato a lavorare sul Caprera di ieri.

- Aggiunto in **tutti e nove** i file agente, sopra `## Essenza`, il blocco *"Prima di aprire bocca"*: leggi `CAPRERA.md` e lo STATO, **non si caricano da soli**.
- Ripuliti i fatti scaduti rimasti dentro i ruoli: `direttore-sportivo` (deploy "non deciso" quando ADR-001 l'aveva chiuso il giorno prima; autenticazione riscritta come **il** blocco, con ADR-003 nominato), `magazziniere` (diceva "Supabase non collegato" avendo in mano il database: riscritto il terreno, aggiunte le regole della vetrina e il divieto di aprire finestre dal cruscotto), `curatore` (bundle e sorgente dati), `analista` (`data.js` codice morto), `preparatore` (tre collaudi, baseline da rifare).

### Terzo passaggio — ADR-003 e i due README

- Scritto **`ADR/ADR-003-Tessera-del-Tifoso.md`** come atto di una scelta **fatta e in esercizio** (data della decisione 20/08, messa a verbale il 21/08), non come tavolo aperto: decisione, perché-non-il-magic-link, alternative scartate, conseguenze, i tre guasti, la regola che ne è nata, SMTP come aperto-non-bloccante.
- Riscritti **`caprera-dati/SUPABASE/README.md`** (diceva "8 viste", non nominava né le finestre né le tessere) e **`caprera-web/README.md`** (era fermo al sito a JSON statici: sei pagine, `data.js` a 560 KB, una sezione "Dati mancanti" risolta da giorni).
- Propagata la fine di `riservati.js` ovunque: STATO, rassegna del 21/08, `CAPRERA.md`, `curatore`, `direttore-sportivo`, `magazziniere`.

### ⚠️ Trovato scrivendo: lo schema non è nei file

Controllando i numeri (23 tabelle, 10 viste, 33 finestre, 6 funzioni) è emerso che **`01-schema.sql`, `02-viste.sql` e `03-sicurezza.sql` sono fermi al 20/08 alle 19:01**: contengono 22 tabelle e le 8 viste interne `v_*`. **Non contengono** le 33 finestre di `public` né la macchina delle tessere, che `src/lib/auth.jsx` usa (`la_mia_tessera`, `attiva_la_mia_tessera`).

Due conseguenze, entrambe registrate:

1. **ADR-002 conteneva un'affermazione falsa scritta da me** — "29 viste create in `SUPABASE/02-viste.sql`". Corretta in loco con una nota datata: la **decisione** resta valida, la sua **esecuzione** è incompleta. Un ADR non si riscrive, ma un fatto sbagliato dentro un ADR non si lascia in piedi.
2. **Nuovo punto #1** nello STATO, sopra il deploy: riportare lo schema nei file. Finché non è fatto, il database non si ricrea da zero.

### Quarto passaggio — una convocazione che non vale come sentenza

L0 ha chiesto di chiamare il Direttore Sportivo. **Non era invocabile**: la sessione era aperta su `~/dev`, e i nove ruoli sono registrati in `caprera-web/.claude/agents/`, quindi visibili solo a una sessione che parta da dentro `caprera-web` (`ListAgents` → nessun agente; `~/.claude/agents/` non esiste). È stato convocato un **supplente** — un agente generico a cui è stato dato in mano `direttore-sportivo.md` più CAPRERA.md, lo STATO e i tre ADR.

**Quello che ne è uscito è una proposta, non un verdetto.** Va **ratificata dal Direttore Sportivo vero**, in una sessione aperta in `caprera-web`. Se conferma, allora è sentenza e si scrive il suo rapporto.

Contenuto della proposta, per non farlo ripetere da capo:

- **Ordine:** prima lo schema nei file, **poi** il deploy. Criterio: è l'unica voce che rende falsa una frase già a verbale (ADR-002). E il deploy è l'atto **poco** reversibile — farlo mentre il database non si ricrea da zero è il labirinto che si chiude sull'architetto.
- **Metodo:** `pg_dump --schema-only` in un file nuovo, `01/02/03.sql` marcati storici finché non è verificato. **Non** riscrivere a mano: *«il dump è brutto e vero; la riscrittura è bella e diverge»* — sarebbe una terza verità.
- **Prova di accettazione:** ricreare lo schema sul Postgres locale di `finto-supabase.mjs`. Se non si ricrea, il file non vale.
- **Scartate:** deploy per primo (no per ordine, non per merito) · statistiche dalle formazioni (aggiungerebbero finestre proprio al pezzo non versionato: dopo costano meno, nascono già in `02-viste.sql`).
- **ADR-004 sì, ma non su questo.** Il ritorno dello schema nei file non è una decisione, è l'esecuzione mancata di ADR-002. ADR-004 serve sulla **regola di riproducibilità del database**, e va scritto **dopo** che il dump esiste e la ricostruzione è passata: un ADR che prescrive una proprietà mai verificata sarebbe la terza frase falsa a verbale.
- **Minori, decisi in proprio:** archiviare `../backend` (fuori dai repository attivi, non cancellato, ruotando prima la credenziale nel suo `.env`) e cancellare il codice morto nella stessa passata.
- **A Salvo, da avviare in parallelo perché maturano lentamente:** Presidenza (dieci tessere, ratifica delle tre regole, tabella del Ranking) e Guido (358 contratti).
- **Condizione di sblocco:** se fra una settimana il dump non c'è, non è dispatch ma tavolo — e l'oggetto non sarà lo schema, ma il fatto che questo progetto decide più in fretta di quanto versiona.

### Quinto passaggio — tre porte per chiamare lo staff

Chiamare "Baggio" non funzionava: **solo `tutela-lega` aveva il volto italiano nella `description`** (Mazzarri), e la `description` è ciò su cui avviene il riconoscimento. Gli altri otto erano raggiungibili solo dal ruolo.

- Aggiunto il volto e l'epiteto alla `description` degli otto file mancanti, con il richiamo esplicito *«Rispondi anche quando ti chiamano "X"»*. A Gattuso anche **"Ringhio"**, che stava nel corpo del file ma non fra i richiami.
- Create **nove scorciatoie** in `.claude/commands/` (`/marotta`, `/baggio`, `/gattuso`, `/pirlo`, `/cannavaro`, `/zoff`, `/quagliarella`, `/totti`, `/mazzarri`): convocano l'agente del ruolo e gli passano gli argomenti. **Senza argomenti non inventano un compito** — fanno la prima domanda di quel ruolo, che ogni file già prescriveva.
- **Non** rinominati i `name:` dei file agente: `@` continua a completare sul ruolo. Rinominarli avrebbe dato `@baggio` al prezzo di sfasciare la convenzione — ruolo come nome pubblico, volto come maschera interna — e di rompere i nomi dei rapporti.

Le tre porte sono documentate in `AGENTI.md` e richiamate in `FRAMEWORK.md`: senza quello, fra tre settimane nove comandi nel menu sarebbero archeologia.

### Sesto passaggio — il collaudo della memoria, e i suoi rilievi

L0 ha convocato il Segretario. Poiché in questa sessione il suo lavoro era già stato fatto — da un'altra mano — la convocazione non è stata una riscrittura ma **un collaudo indipendente** della memoria prodotta stanotte: 21 documenti più i nove file agente, verificati **sul disco e non sulla prosa** (conteggi reali negli `.sql`, rotte in `App.jsx`, dipendenze in `package.json`, esistenza dei file citati).

**Verdetto: regge con riserve.** 3 bloccanti, 12 da correggere, 6 minori — tutti applicati. I tre bloccanti erano lo stesso errore ripetuto: **è stato aggiornato il nucleo e non sono stati seguiti i link in uscita.**

1. **`SPIEGAZIONI/SPIEGAZIONE_Schema_Supabase.md`** diceva in riga 3 *"Proposta. Non è stato creato nessun progetto Supabase"*, ed è la fonte citata da **quattro** documenti canonici. Chi seguiva quel link atterrava sul 19 agosto. → Nota in testa con le tre cose non più vere, e l'avvertenza sui file `.sql` incompleti.
2. **`TASK/TASK_Sito_Web.md`**, che lo STATO dichiara lista canonica, era fermo al 19/08 e **non conteneva il punto #1** — mentre ADR-003 rimanda proprio lì per il debito dello schema. *Il primo lavoro del progetto non era scritto dove due sentenze mandano a cercarlo.* → Riscritto: il punto #1 in testa con metodo e prova di accettazione, sicurezza, deploy, push, pulizia, ✅ aggiornati.
3. **`TASK/TASK_Area_Mister.md`** descriveva ancora il prototipo senza password. → Chiuso da ADR-003, con la parte storica conservata e annotata: la previsione era `signInWithOtp`, **scartata** per la ragione che sta in ADR-003.

Fra i dodici, i tre che pesavano:

- **Un numero senza fonte, copiato senza controllare:** ADR-002 e la rassegna dicevano «22 tabelle, 11 viste». Il disco dice 22 tabelle e **8** viste nei file, la produzione **23/10/6**. «22/11» non descriveva né i file né la produzione. → Allineati con la fonte citata.
- **ADR-002 riga 79** elencava ancora fra le conseguenze positive *«il database si ricrea interamente da `01/02/03.sql`»*, cioè la frase che la correzione in testa dichiara falsa. → Barrata e rimandata alla correzione.
- **Il prerequisito di deploy chiedeva due collaudi su tre** (PROTOCOLLO e ADR-001): mancava `finto-supabase.mjs`, l'unico che prova le pagine leggendo dal database — cioè oggi tutte. → Aggiunto in entrambi, con la nota che non è opzionale.

Poi: `riservati.js` elencato senza marca fra i «file nuovi» della rassegna · «12 punti, autenticazione al #1» quando sono 13 e il #1 è un altro · «cinque controlli» con quattro elencati · `preparatore.md` che diceva *tre* alla riga 27 e *due* alla 28 · la `description` di Marotta che invitava ancora a decidere l'autenticazione «Supabase o altro» · `@mazzarri` citato in AGENTI.md come handle esistente quando esiste solo `/mazzarri` · il peso 1,5 MB / 77 KB nel PROTOCOLLO · «otto membri» per nove file · CAPRERA.md che non nominava `classifica-contro-i-file.mjs`.

**Cosa il collaudo ha dichiarato sano**, e conta quanto i rilievi: nessun path rotto in tutta la memoria · `riservati.js` davvero assente dal codice · le quindici rotte pubbliche verificate in `App.jsx` (`Stats` e `Statistiche` sono due pagine, non un doppione) · le dipendenze esatte · i nove agenti e le nove scorciatoie al loro posto · e **il punto #1 scritto coerentemente in tredici documenti**, col disco che conferma alla lettera.

### Settimo passaggio — la skill di Atena a Baggio, e un richiamo di L0

L0: *"perché questi agenti esistono? se fai te usciamo fuori strada"*. Richiamo fondato: nella
stessa sessione erano state posate le fondamenta di `theme.css` **senza passare dal Curatore**,
che di quel file è il territorio. Il Processo lo vieta in una riga — *nessun agente indossa il
cappello di un altro* — e vale anche per chi scrive la memoria.

**Conseguenza operativa, da onorare:** le modifiche a `src/styles/theme.css` del 21/08 (scala di
spaziatura, scala tipografica, token di movimento, ring di focus, `prefers-reduced-motion`,
bersaglio 44px su `pointer: coarse`) **non sono approvate**: sono una **proposta in attesa del
verdetto del Curatore** — APPROVA · BLOCCA · ITERA. Il build passa; nessuno le ha guardate.

**Innestata la skill `atena-ui-ux`** nel file del `curatore`, adattata e non copiata. Nel Parnaso
madre produceva un `index.html` autosufficiente con token da un `DESIGN.md` e, se serviva, React
da CDN: tre cose che `CAPRERA.md` vieta. Quello che eredita è la capacità che gli mancava —
**prototipare per decidere**, invece di scegliere fra prescrivere a parole e implementare in
React. Con il vincolo esplicito che **il prototipo si butta**: sta fuori da `src/`, non è la
consegna.

Aggiunti anche la passata di accessibilità completa, sei anti-pattern che si commettono senza
accorgersene (fra cui `outline: none` senza ring e `transition: all` — **entrambi presenti in
`theme.css` fino a stanotte**) e il protocollo del Cappello Verde per la quarta idea di L0.

**Buco emerso:** il Verde rimanda a Six Hats, che secondo `FRAMEWORK.md` dovrebbe stare in
`.processo/LIBRERIA/` — **cartella ancora vuota, con il solo README**. Finché lo è, i framework
che lo staff "indossa" non esistono. Handoff al Segretario.

**Restano due skill nel Parnaso madre**, non innestate: `calliope-brand-voice` → mapperebbe
sull'`addetto-stampa` (Quagliarella), ma è tarata su brand book, manifesto, claim e pitch deck —
Caprera ha microcopy e regolamento, quindi va valutato cosa sopravvive all'adattamento.
`iride-localization` non ha destinatario: Iride è fuori dal roster, e Caprera è monolingue.

### Ottavo passaggio — il riallineamento sui numeri veri, e tre porte

La sessione parallela ha chiuso e consegnato i numeri. **La memoria scritta poche ore prima era già
sbagliata**, e non di poco: 23→**26** tabelle, 6→**10** funzioni, 33→**38** finestre, più **28
regole di riga** che non erano contate. Allineati STATO, rassegna, `CAPRERA.md`, `TASK_Sito_Web`,
`magazziniere`, `direttore-sportivo`.

**Il punto #1 cambia natura, e diventa molto più economico.** Non è vero che lo schema non è
versionato: ci sono **32 migrazioni**. Ma stanno nella cronologia di Supabase, e
**`supabase/migrations/` non esiste in nessuno dei due repository** — verificato, non riferito. Il
lavoro quindi non è *riscrivere* (come aveva proposto il supplente di Marotta, con `pg_dump`): è
**esportare**. Il punto è stato riscritto di conseguenza, con la scelta del repo lasciata al
Direttore Sportivo e la stessa prova di accettazione di prima.

**`vecchio_progetto` cancellato**, non più solo spostato — e i 48 alias sono salvi in
`FONTI/vecchio-progetto-cose-fatte-a-mano.json`. Chiuso il punto che diceva "non si droppa finché
non recuperi gli alias": l'ordine giusto è stato rispettato.

**Tre porte di sicurezza, non una.** `execute_sql` era quella che si vedeva; le altre due sono
peggio nel merito. `attiva_tessera` era chiamabile **con l'email di un altro** — in una lega dove
i contratti sono il gioco, farsi assegnare la squadra altrui è il danno massimo. E tessere, schede
e telefoni comparivano nell'**elenco pubblico** di cosa esiste. Le prime due erano eredità di
settembre; **la terza è nata questa notte**, insieme alle tessere. Promosse a sezione propria dello
STATO, sopra la voce sicurezza esistente: non erano un dettaglio da nota a piè di pagina.

**Fissata la regola dei due tavoli** in `FRAMEWORK.md`, su proposta di chi lavorava al codice:
chi scrive codice sta in `caprera-web/src/` e `collaudo/`; chi tiene la memoria sta in
`caprera-dati/`, `.claude/`, `.processo/` e **`theme.css`**. Consegne per invio, non per scrittura
diretta. `theme.css` sta con la memoria perché **è il design system**, cioè territorio del
Curatore — ed è esattamente il file su cui, poche ore prima, si erano scritte sopra due mani.

## Decisioni prese (e alternative scartate)

- **ADR-002 aperto, non lasciato dentro la rassegna.** La scelta di leggere da `public` con 29 viste sottili invece di esporre lo schema `caprera` dal cruscotto ha alternative reali, un debito accettato (29 viste da mantenere) e conseguenze durature: è una sentenza, non una nota di sessione. La rassegna la racconta, l'ADR la argomenta.
- **`vecchio_progetto` documentato come "non si butta ancora"**, con il motivo agganciato al punto aperto giusto: dentro ci sono i **48 alias** che possono sbloccare parte delle 111 righe di rosa non agganciate. Senza quel collegamento scritto, fra un mese quello schema sembra solo spazzatura e qualcuno lo droppa.
- **`src/lib/riservati.js` scritto ovunque come rattoppo con data di scadenza**, non come componente. In `CAPRERA.md` c'è la riga "non ci si costruisce sopra": è il tipo di file che, se non lo marchi, in tre settimane diventa architettura.
- **Il #1 dei punti aperti è cambiato due volte in una sessione.** Prima l'autenticazione (scavalcando il deploy), poi — scoperto che le tessere erano gia' in esercizio — **il ritorno dello schema nei file**. Il criterio e' rimasto lo stesso: in cima sta cio' che rende falsa una frase gia' scritta a verbale, non cio' che e' piu' urgente.
- **Corretto un ADR senza riscriverlo.** ADR-002 diceva il falso su dove stessero le viste. La cartella prescrive che un ADR non si riscrive: ma quella regola protegge la *decisione* dal revisionismo, non i *fatti* dall'essere sbagliati. Nota datata in testa, decisione intatta.

## File toccati

- `caprera-web/CAPRERA.md` — **nuovo**, è il file di progetto
- `caprera-web/CLAUDE.md` — svuotato e ridotto a **due righe** che puntano a `CAPRERA.md` e allo STATO. Non è un ripensamento sulla rinomina: è l'unico file che la sessione carica da sola, quindi resta come cartello, non come contenuto
- `caprera-web/COMANDI.md` — riscritto
- `caprera-dati/STATO_PROGETTO_Caprera.md` — riscritto
- `caprera-dati/AGGIORNAMENTI/AGGIORNAMENTO_2026-08-21_Archivio_su_Supabase.md` — nuovo
- `caprera-dati/ADR/ADR-002-Vetrina-Public-Viste-Sottili.md` — nuovo
- `caprera-dati/ADR/README.md` — indice + ADR-003 annunciato
- `caprera-web/.claude/agents/*.md` — tutti e nove: blocco "Prima di aprire bocca". Cinque anche nel merito (`direttore-sportivo`, `magazziniere`, `curatore`, `analista`, `preparatore`)

## Prossimo passo

**Riportare lo schema nei file** — le 33 finestre di `public` e la macchina delle tessere. È l'unico debito che rende falsa una frase già scritta a verbale. Territorio del Magazziniere, priorità sopra tutto il resto sui dati.

## Handoff aperti

- **magazziniere** → **(1)** lo schema nei file, punto #1 dello STATO. **(2)** i 48 alias di `vecchio_progetto.name_aliases` contro le 111 righe di rosa non agganciate — e finché non è fatto, `vecchio_progetto` non si droppa.
- **direttore-sportivo** → il destino di `../backend`, superato da Supabase. E se il ritorno-nei-file non avviene entro poco, è materia da tavolo: due ADR di seguito hanno prodotto lo stesso scarto fra deciso e versionato.
- **addetto-stampa** → il testo per chi entra **senza tessera**: non è un errore e non deve sembrarlo. È l'unico punto in cui il sito parla a una persona che non capisce perché non vede la sua squadra.
- **preparatore** → **(1)** verificare che le regole di riga tengano davvero, ripetendo la prova del mister del Prosecco su un'altra società. **(2)** SMTP proprio: oggi poche email all'ora. **(3)** rimisurare su 892 KB (la baseline dei 77 KB gzip è del 19/08 e ormai non significa nulla) e passare i tre collaudi. Verificare che `.gitignore` escluda davvero `.env` **prima** del push.
- **L0 Salvo** → confermare con la Presidenza le tre regole scoperte (andata/ritorno, finale terzo posto, premi in crediti) e chiedere la tabella dei punteggi del Ranking, che manca dal PDF.

## Pattern imparato

**Ciò che regge il sistema deve stare in un file, non in un pannello.**

La superficie pubblica del database poteva essere una spunta nel cruscotto Supabase: sarebbe stata invisibile ai diff, irriproducibile da `01/02/03.sql`, e un giorno sarebbe cambiata senza che nessuno sapesse quando. Le 29 viste in `public` costano manutenzione e in cambio rendono quel confine **leggibile e contestabile** — cioè materia da moviola.

Stessa forma delle regole della lega in `regole-caprera.json`, degli importi dei premi letti da `lega.regole`, del `_redirects` che ADR-001 chiamava "il file che nessuno deve cancellare".

Terzo uso in due sessioni: **candidato a METHOD** nel Parnaso madre.

## Secondo pattern, dal collaudo

**Aggiornare il nucleo non aggiorna la memoria: bisogna seguire i link in uscita.**

I tre rilievi bloccanti erano lo stesso errore. STATO, ADR e README erano stati riscritti con cura, ma i documenti che il nucleo **cita come propria fonte** — una SPIEGAZIONE e due TASK — erano rimasti al giorno prima. Il risultato è peggiore di una memoria vecchia: è una memoria che sembra corrente e rimanda a una che non lo è. Il caso limite trovato: ADR-003 rimandava a `TASK_Sito_Web.md` per il debito #1, e in quel file il debito non c'era.

**Regola operativa:** quando si riscrive un documento canonico, si aprono i file che cita e si guarda se raccontano lo stesso mondo. La moviola non è finita finché i rimandi non reggono.

**E un corollario sul metodo:** questo si è visto solo perché il collaudo è stato fatto **da un'altra mano** e **verificando sul disco**, non rileggendo la prosa. Chi ha scritto rilegge quello che intendeva scrivere.

## Terzo pattern — spostare non disarma

**Togliere di mezzo non è togliere i permessi.**

Il 20/08 `vecchio_progetto` era stato spostato fuori da `public` e considerato inerte. Erano state
spostate le **tabelle**, non le **funzioni** — e una funzione `SECURITY DEFINER` esegue con i
permessi di chi l'ha creata **ovunque la si metta**. Per un giorno intero `public.execute_sql` è
rimasta chiamabile da chiunque avesse la chiave anon, che sta in chiaro nel JavaScript del sito per
progetto. Sembrava messa via; era ancora carica.

Vale lo stesso per la seconda porta: `attiva_tessera` era una funzione *utile*, e nessuno aveva
chiesto **chi può chiamarla e con quali argomenti**.

E la terza aggiunge la metà mancante: **una superficie nuova va guardata quando la si apre.** Le
tessere sono nate protette dalle regole di riga — ma il loro *nome* era pubblico. Il dato era
chiuso, l'elenco no.

Insieme: **archiviare non è disarmare, e proteggere il contenuto non protegge l'indice.**

## Nota di moviola

Il passaggio a Supabase è stato fatto **prima** che la memoria fosse scritta, e per qualche ora i quattro documenti di riferimento raccontavano un progetto che non esisteva più. Ha funzionato perché L0 è arrivato con l'elenco completo di cosa era cambiato. Non è ripetibile: il modo giusto è la moviola nella sessione che ha prodotto il fatto.

---
*I due rapporti del 2026-08-20 portano ancora i nomi mitologici (`dedalo`, `mnemosine`):
sono anteriori alla rinomina in ruoli di staff. Non si riscrivono, sono storia.*
