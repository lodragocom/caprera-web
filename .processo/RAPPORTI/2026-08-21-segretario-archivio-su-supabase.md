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

### Nono passaggio — la visione, che nella memoria non c'era

L0 ha dichiarato la direzione: **quello che esiste e' un prototipo**. Dieci amici che giocano da
dieci anni sono il banco di prova, non il traguardo. L'obiettivo e' un fantacalcio **piu' vicino
alla realta' e piu' manageriale** — contratti con durata, clausola e **ingaggio**, crediti che si
**accumulano** fra le stagioni — accessibile a **utenti nuovi** che scaricano l'**App** e giocano
alla **Caprera League**.

**Non era scritto da nessuna parte.** Lo STATO si apriva con *"lega di fantacalcio a 10 societa'"*
e finiva li'. Il multi-lega compariva in quattro documenti come nota tecnica di lato — mai come
scopo. Conseguenza: **ogni decisione presa finora e' stata presa per la lega sbagliata**, e alcune
si vedono gia'.

Aggiunta allo STATO la sezione **"Dove vuole andare"**, subito sotto "Cos'e'", perche' chi legge
il resto sappia per chi sta decidendo. Con dentro le cinque conseguenze che cambiano la lettura di
tutto il documento — fra cui: **il prodotto e' il regolamento, non il software**, quindi le 8
incongruenze note e le 3 regole ricostruite dall'archivio smettono di essere debito documentale e
diventano **difetti di prodotto**.

**Aperto il primo TAVOLO del Processo:** `TAVOLI/2026-08-21-da-lega-privata-a-prodotto.md`. La
cartella esisteva dal 20/08 con il solo README. Domanda unica e chiusa — *cosa va deciso adesso e
cosa va deliberatamente rimandato* — con sei nodi verificati sul disco, non riferiti. Le posizioni
sono vuote: le compilano i ruoli, in una sessione aperta in `caprera-web`. **La sintesi non si
scrive prima delle posizioni**: sarebbe un'opinione travestita.

Due nodi trovati verificando, che valgono piu' della domanda da cui sono nati:

- **`lega_id` deciso e mai implementato.** Zero occorrenze in `SUPABASE/*.sql` e in `src/lib/`,
  mentre il CONCEPT lo dichiarava indispensabile *"dal primo giorno"* perche' *"costa niente
  adesso"*. Nel frattempo: 26 tabelle, 38 finestre, 28 regole di riga costruite senza.
- **ADR-003 poggia su una premessa mono-lega**: *"la Presidenza sa gia' chi e' chi"* e' vera
  perche' la Presidenza e' **una**.

### Decimo passaggio — il riallineamento sul contesto Cowork, e due errori miei

L0 ha passato il documento di contesto della sessione Cowork. Verificato **alla fonte** con gli
strumenti Supabase invece che sulla prosa — ed e' emerso che **due cose scritte in questa moviola
e nello STATO erano sbagliate**.

**1. Le migrazioni sono 31, non 32.** Il numero 32 veniva dalla consegna a voce e non era stato
verificato. `list_migrations` ne conta **31**, di cui **9 di settembre 2025** (era
`vecchio_progetto`) e 22 di Caprera. Corretto ovunque.

**2. `lega_id` esisteva — cercavo il nome sbagliato nei file sbagliati.** Avevo scritto, in tre
documenti, che *"`lega_id` non esiste in nessuna delle 26 tabelle"* e ne avevo fatto la
raccomandazione **numero uno** del tavolo, con l'argomento che *"il costo cresce da solo"*.

Interrogando il database vivo: la colonna si chiama **`lega`**, ed e' una **chiave esterna verso
`caprera.lega`** su **`societa`, `stagioni`, `competizioni`** — le tre radici, da cui tutto il
resto discende. Il CONCEPT era stato onorato, e con un disegno migliore di *"lega_id ovunque"*.

**L'errore di metodo, che e' il pezzo che vale:** avevo fatto `grep lega_id` sui file `.sql` — che
sono **fermi al 20/08 e lo sapevo**, l'avevo scritto io due ore prima. Ho cercato il nome esatto
che il CONCEPT proponeva, in una fonte che avevo gia' dichiarato scaduta, e ho preso l'assenza per
una prova. **Un'assenza in una fonte sbagliata non e' un fatto: e' una domanda.**

Quello che resta vero, ed e' piu' preciso: **delle 28 regole di riga, zero filtrano per lega**
(`pg_policies`). La struttura c'e', l'applicazione no. Il lavoro non e' una riscrittura dello
schema — e' un predicato da aggiungere alle politiche e alle 38 finestre.

**Corretta anche la raccomandazione del tavolo:** il primo non e' `lega_id` (non esiste come
problema) ne' i voti (fermi per decisione di L0). E' **il regolamento** — l'unico nodo che *e'* il
prodotto, e l'unico i cui tempi non dipendono da noi ma dalla Presidenza.

### E una correzione su di me

Il contesto Cowork dice: *"un `cp -f` ha distrutto i token del tema che un altro agente aveva
appena scritto e mai committato"*. Erano i miei. Avevo scritto — in `curatore.md` e qui — che la
proposta su `theme.css` era stata **ritirata perche' non passata dal Curatore**. **Falso: e' andata
persa in un incidente.** Restano vere entrambe le lezioni, ma sono due cose diverse: **non era da
farsi senza Baggio**, *e* **non era stata committata**. Corretto in `curatore.md` e in
`FRAMEWORK.md`, dove la regola dei due tavoli ora nomina l'incidente e aggiunge la seconda regola:
**committa spesso**.

### Fatti nuovi registrati dal contesto Cowork

Ramo di lavoro `tessera-e-incarichi` · il lavoro frontend del 21-22/08 (stemmi 2026, Classifica
ordinabile con la posizione vera preservata, Societa', Scheda societa' a quattro sezioni,
Risultati da 1250 a 336 px sul telefono, `TeamBadge` che non tronca) · **la dashboard `/area` non
e' ancora rifatta** · la trappola della build che punta al Supabase vero · **DMARC mancante**.

E **cinque guasti nei dati**, promossi a sezione propria nello STATO perche' con i contratti come
prodotto pesano diversamente: le rose sono una **fotografia di fine stagione senza date** (20-74
giocatori a stagione spariscono se ceduti a gennaio) · **2023-24 al 72% di schierati fuori rosa**
contro il 12-21% delle altre · la rosa 2025-26 senza presenze, MV e fantamedia su tutte e 310 le
righe · 111 righe non agganciate · 140 contratti su 358.

### Controllo di sicurezza Supabase — 2 errori

163 rilievi, **2 ERRORE**. `public.contratti_pubblici` e' voluto e documentato. **`caprera.v_forma`
no**: `SECURITY DEFINER` non deciso da nessuno, comparso con `caprera_forma_con_avversario` (21/08
00:08). Impatto probabilmente nullo — la forma si calcola da partite pubbliche — ma **una vista che
scavalca le regole di riga per distrazione e' esattamente come e' nata la terza porta**.

### Undicesimo passaggio — tre regole della lega in piu', e una che toccava il sorteggio

Seconda consegna del contesto Cowork, con cinque voci di lavoro in piu'. Due non erano frontend:
erano **scoperte sulle regole**. Verificate contro `REGOLE/regole-caprera.json` prima di scriverle.

- **Il peso delle stagioni nel Ranking: cinque volte, non il doppio**, come diceva il testo del
  sito. Non e' nel JSON ne' nella spiegazione — vive **solo nel PDF**. Nona incongruenza.
- ⚠️ **Il pari merito nel Ranking decideva in quale girone finivi, e lo decideva l'ordine di
  lettura del database.** Subbuteo e Roburro sono esattamente pari sulle ultime cinque stagioni.
  **E' il difetto piu' grave trovato finora**, e per una ragione precisa: non sbagliava un numero
  mostrato a schermo — **cambiava il sorteggio**. Un errore di visualizzazione si corregge e
  nessuno ha perso niente; questo aveva conseguenze sportive. Decima incongruenza, e non e' un
  refuso: e' un **buco**, e il criterio nuovo (stagione piu' recente, poi differenza reti) **va
  ratificato dalla Presidenza** — finche' non e' nel regolamento e' una scelta di chi ha scritto
  il codice.
- **La scala dei gol cambia nel 2020-21, non nel 2024-25**: passo da **6 a 4** fantapunti per gol.
  Verificato in `scala_gol`. E li' c'e' una riga che vale da sola: *«la scala 2025-26 e' quella
  scritta nel regolamento; le altre sono state ricostruite dai dati»* — **anche il punteggio della
  lega e' in parte reverse-engineering.**

Le regole scoperte lavorando passano da **3 a 6**, le incongruenze del regolamento da **8 a 10**.
Con la Caprera League come prodotto **non sono piu' curiosita' d'archivio: sono il prodotto
scritto male**, e questo rafforza la raccomandazione gia' corretta al tavolo — **il primo nodo e'
il regolamento**.

**Nota di confine, e la regola che ne e' nata.** `.avviso`, `.pos` e `tr.podium` sono state
spostate in `theme.css` dalla sessione del codice — territorio del Curatore. Il guasto era vero
(chi arrivava dritto su Ranking le trovava vuote) e la correzione e' giusta, ma la regola dei due
tavoli non prevedeva il caso *"bug che si ripara solo di la'"*.

**L0 ha deciso il 22/08: si consegna al Curatore.** Non "si tocca dichiarandolo" — e la ragione
tiene: **un confine con un'eccezione per urgenza non e' un confine**, perche' la volta dopo e'
urgente anche quella.

Aggiunta in `FRAMEWORK.md` con il vincolo che la rende praticabile: **la consegna e' pronta da
applicare** — file, righe, e il perche' — non una segnalazione vaga. Chi riceve incolla e
verifica, non indaga. Cosi' il costo del confine sono minuti, e nessun guasto resta aperto per
rispetto della procedura.

**Debito retroattivo aperto:** lo spostamento e' gia' avvenuto e resta, ma **va ratificato dal
Curatore** — come i token del tema del 21/08. Sono due cose in coda a Baggio, non una.

### Dodicesimo passaggio — le due consegne a Baggio, e un guasto trovato scrivendole

L0: *"entrambe"*. Preparate **come consegne**, non eseguite: la decisione sui token e la ratifica
sono del Curatore, e rifarle qui sarebbe ripetere l'errore del 21/08 con piu' cerimonia.

Aperta **`.processo/CONSEGNE/`** — la regola scritta due ore fa diceva *"si consegna"* senza dire
**dove**, quindi non aveva indirizzo. Ora ha formato, README e due voci nel vocabolario e nella
tabella della memoria.

Scritta `CONSEGNE/2026-08-22-a-curatore-theme-css.md`, verificata sul disco:

**A · ratifica delle tre classi** — e verificandola e' venuto fuori che **la correzione e'
incompleta**: `.avviso`, `.pos` e `tr.podium` sono state *aggiunte* a `theme.css` ma **le copie
vecchie non sono state tolte** (`Contratti.css`, `Coppe.css`, `Home.css`). Sono chunk lazy: quale
definizione vince dipende dal **percorso di navigazione dell'utente**. E' lo stesso genere di
guasto che quella correzione voleva chiudere, rientrato dall'altra parte. In `Coppe.css:187` c'e'
anche un commento che ora **dice il falso**.

**B · i token mancanti** — con la misura aggiornata, che e' il dato che vale: **960 valori grezzi**
oggi contro i **649 del 21/08**. **+311 in una giornata**, non per sciatteria ma perche' sono
state rifatte sette pagine. E' la prova pulita che **ogni pagina nuova nasce con il suo ritmo
privato**. Passati a Baggio i tre difetti gia' misurati (focus senza ring, `prefers-reduced-motion`
assente, bersagli a 26-30 px) **senza ricostruire la proposta persa**: quella la rifa' lui, o
decide di no.

**Pattern:** *una regola senza indirizzo non e' una regola.* "Si consegna" e' rimasto un principio
per due ore, finche' non ha avuto una cartella, un formato e una riga nel vocabolario.

### Tredicesimo passaggio — il motore economico, e una verifica che ho sbagliato

L0 ha scelto di partire dalla **prova**: far calcolare i premi dall'archivio e vedere se i `bonus`
registrati tornano. Il risultato e' utile proprio perche' **non torna**, e si sa perche'.

`v_premi_crediti` esisteva gia' e calcola **due premi su sei**. Accostando i premi del 2024-25 ai
`bonus` del budget 2025-26 — l'allineamento giusto: si guadagna in N, si spende all'asta di N+1 —
**gli scarti sono tutti positivi**, +1..+23. Real Monghi chiude ultima nei fantapunti e ultima nei
marcatori (−5) e si presenta all'asta con **+18**. Le altre quattro voci non sono calcolabili, e
per ragioni diverse: il Ranking manca dal PDF, Paratici e Zdenek non dicono a chi spettano, le
assicurazioni dipendono da dati che non abbiamo, e **penalita' ed etica sono atti, non conseguenze
di partite**.

**Conclusione che vale piu' della prova:** `finanze.bonus` non tornera' mai, perche' e' un intero
unico in cui finisce roba che nessun calcolo produce. Le finanze sono **un saldo, non un estratto
conto** — e un gioco manageriale vive di *"perche' ho 12 crediti in meno?"*.

**Ricavata l'identita' contabile**, vera su tutte e dieci le societa' e scritta in nessun posto:
`iniziali = 250 + riportati + bonus + ffp` e `residui = iniziali + scambi − spesi`.

### ⚠️ Una verifica sbagliata, ritirata prima di consegnarla

L0 ha dato la regola *"a pari gol nessuno prende il gol vittoria"*. Ho contato i bonus
`gol-vittoria` nelle partite finite in pareggio: **487 su 2.577**, e stavo per portarlo come
contraddizione.

**La verifica non testava quello che credevo.** `gol_casa = gol_fuori` e' il pareggio della partita
**di Caprera**; il gol vittoria e' un bonus del calciatore nella partita **vera di Serie A**. Le due
cose non c'entrano niente: un pareggio in fantacalcio puo' contenere benissimo chi ha deciso
Inter-Lecce. **Il numero era corretto e non significava nulla.**

**Il pattern, ed e' gemello di quello di `lega_id`:** avevo una fonte vera e una domanda mal posta.
La prima volta ho cercato il nome giusto nel posto sbagliato; qui ho misurato la cosa sbagliata nel
posto giusto. In entrambi i casi il dato era buono e **la domanda no**. Prima di fidarsi di una
verifica, va verificata la domanda.

### Le due regole nuove

- **A pari merito il premio non si assegna, ne' in positivo ne' in negativo** (L0, 22/08). Scritta
  in `regole-caprera.json` → `crediti.premi.parita`. **Segnata l'estensione ai premi positivi come
  mia deduzione e non come dichiarazione di L0** — nel JSON c'e' un campo `attenzione` che lo dice.
  Nota per il tavolo: e' un criterio **diverso** da quello del Ranking, dove a pari coefficiente si
  spareggia. Due criteri nella stessa lega: o si motiva la differenza, o si uniforma.
- **Risparmi riportati: meta' dei residui** — gia' nel JSON come `0.5`. Quello che mancava e'
  l'**arrotondamento sui dispari**, e non e' teorico: **Subbuteo chiude con 7 residui** ed e' la
  sola che ci cade, alla prossima asta.

Regole della lega scoperte lavorando: da **6 a 8**. Incongruenze del regolamento: da **10 a 12**.
Scritta la consegna `CONSEGNE/2026-08-22-a-magazziniere-premi-crediti.md` — con dentro
l'avvertenza di **non** andare a caccia dello scarto fra calcolato e registrato: e' atteso.

### Quattordicesimo passaggio — l'audit del regolamento, e la consegna della sera

**Letto il PDF per intero** (42 pagine) e confrontato con JSON, motore, schema e viste:
`SPIEGAZIONI/AUDIT_Regolamento_vs_Implementazione.md`. Il risultato ribalta quello che avevo detto
poche ore prima: **non erano "due premi su sei", sono venti fonti di crediti**, e mancava la piu'
grande — il **Trofeo Walter Mazzarri**, fino a **+10**, piu' del 1o posto Fantapunti (+5) e del
Ranking (+3) messi insieme. E' la spiegazione piu' probabile del +18 di Real Monghi.

**Errore di metodo, il terzo dello stesso tipo in una giornata:** avevo letto il
`regole-caprera.json` e l'avevo scambiato per il regolamento. Poi, contando le assenze, ne ho
dichiarate otto quando erano **cinque**: diritti TV, Indennizzo Carnevali, franchigia Rechsschuetz
e Mondiale per Club c'erano gia', fuori da `crediti.premi`. **Cerco le cose dove mi aspetto che
siano, non dove sono.**

**Completato il file** su richiesta di L0: `crediti.premi` da 7 a 14 voci, ognuna con `fonte`,
`calcolabile` e `perche_no`; blocco `stagione_2026_27` con le cinque riforme (**Capology**: gli
stipendi si pagano ogni anno, +85 crediti al budget — e' il "piu' manageriale" della visione, gia'
scritto nel regolamento e mai implementato); chiarito che **le "vincite" sono euro e non crediti**.

### ⚠️ `carica.sh` cancella le tessere — trovato rispondendo a "come si rilancia"

L0 ha chiesto come rilanciare `carica.sh` per allineare il database. **Controllato prima di
rispondere**, e per fortuna: `carica.py` fa `truncate ... cascade` su una lista che contiene
`societa` e `misteri`. **`tessere` ha una chiave esterna verso `societa` e non e' nella lista: la
cascata se la porta via.** Chi lancia lo script oggi si toglie da solo l'accesso all'area.

La lista e' del 20/08 alle 16:25; la Tessera del Tifoso e' arrivata alle 22:01. **Nessuno ha
riletto lo script dopo.** Stesso pattern delle tre porte: una superficie nuova non guardata quando
e' stata aperta.

E la risposta giusta alla domanda era comunque un'altra: **per aggiornare le regole non serve
`carica.sh`** — e' un campo JSONB, si aggiorna con un `update`. Svuotare e ricaricare 160.000 righe
per cambiare una colonna e' sproporzionato, e in questo caso distruttivo.

### Quindicesimo passaggio — la consegna della sessione del codice

Arrivata `CONSEGNE/2026-08-22-a-segretario-momento-del-listone.md`. **Verificato tutto alla fonte
prima di trascrivere**: 38 migrazioni ✓ (7 del 22/08), 26 tabelle ✓, 28 regole ✓, `listone.momento`
✓. **Una correzione al loro conto: le finestre sono 39, non 38** — e il 38 l'avevo propagato io in
sette documenti.

- **Nona regola della lega:** *una quotazione senza la data e' mezza informazione* — vale quella di
  **partenza**. Il regolamento §7.1 dice "quotazione Fantapazz di inizio campionato" dando per
  scontato che ne esista una sola. **Non e' cosi'**, e in archivio ci sono nove stagioni di
  quotazioni di fine e una sola di partenza.
- **La scoperta che vale piu' della regola:** `rose.costo` **mescola rilanci d'asta e prezzi che il
  contratto si porta dietro**. Chiunque ci calcoli "quanto ha speso una societa' quell'anno" somma
  due cose diverse.
- **I contratti veri sono 163, non 358** — 59 con clausola, 24 Under. In archivio 140 con **zero**
  clausole. E **cinque nomi su 154 hanno il ruolo discordante**: non e' cosmetico, il ruolo decide
  uno slot del Jobs Act e la soglia minima della CR (50% D, 75% C).

**Due decisioni prese, che L0 aveva girato a me:**

1. **Il confine non era stato passato.** `caprera-dati/SUPABASE/` **e' del Magazziniere**: due
   nostre regole si contraddicevano (la regola dei due tavoli dice `caprera-dati/` per intero,
   `magazziniere.md` dice di `SUPABASE/` "e' tuo"). Vale `magazziniere.md`, e ho scritto in
   `FRAMEWORK.md` il criterio per la prossima ambiguita': **la memoria racconta, il materiale
   esegue.**
2. **`01-schema.sql`: rimettere `listone` com'era.** Il file e' diventato un ibrido — venti tabelle
   al 20/08 e una a oggi — ed e' **la terza verita' che il punto #1 vieta**, nella sua forma
   peggiore: quella che non si vede.

**Nota su chi ha scritto la consegna:** ha ritirato da solo l'esempio di Yildiz *e* la correlazione
che sembrava reggere, prima che qualcuno glielo chiedesse. E' il comportamento che questa moviola
raccomanda da stanotte, applicato senza che fosse necessario chiederlo.

### Sedicesimo passaggio — i file ritrovati, e tre regole nuove sui soldi

L0 ha recuperato da Google Drive cinque cartelle di stagione. La sessione del codice le ha aperte
tutte e consegnato; **verificato quello che si poteva verificare** prima di trascrivere.

**Le quotazioni di partenza sono TRE, non una.** Stamattina avevo scritto nello STATO e nel JSON
*"nove stagioni di fine e una sola di partenza"*: era vero dodici ore fa, non lo e' piu'. Sono
**2020-21, 2024-25, 2025-26**. Controllato di persona il 24-25: **715 righe, zero a zero, e i club
sono quelli veri di quella stagione** — Como, Parma, Venezia. La colonna `Squadra` nei listoni di
partenza **si puo' caricare**, al contrario di quelli di fine che guardano al presente.

*Due precisazioni al conto della consegna:* i club distinti sono **20 piu' una casella vuota** (il
conteggio da' 21, come gia' nel 2025-26), e il file di Mr Champions **non esiste al nome citato**:
ha **due spazi**, `Mr Champions -Serie A -  25-26.xlsx`. E' esattamente l'inciampo che la consegna
segnalava, e il nome esatto ora e' a verbale.

**Tre regole sui soldi, dal `Riscatti_Contratti.xlsx`:**

- **Gli attaccanti non hanno sconto sui rinnovi: pagano il 100% del Valore FP.** Il §7.1 nomina
  solo D 50% e C 25%, e da' per implicito il resto. Otto casi, nessuna eccezione.
- **I rinnovi si arrotondano per ECCESSO.** Quindici casi, sempre verso l'alto.
- **La regola della meta' e' confermata sui dati:** `Rinnovo CR` e' esattamente meta' di `CR`.
  E quel foglio **e' la fonte che mancava** per riempire `contratti.clausola`, vuota su tutte e 140
  le righe.

⚠️ **Una precisione che la consegna ha avuto e che valeva la pena:** l'arrotondamento trovato e'
quello **dei rinnovi**, e **non** risponde alla lacuna #12, che riguarda la meta' dei risparmi
riportati. Due arrotondamenti diversi. Segnato in entrambi i posti perche' nessuno li confonda.

**Corretto l'audit del regolamento — di nuovo io.** Avevo scritto che Grigliata Serie A e Mr
Champions *"vivono fuori dall'archivio"*. **Vivono in cinque fogli Excel**, che ora hanno un nome e
un percorso. La frase "non calcolabile" era sbagliata: **il dato c'e', e' solo fuori dal database.**
Restano davvero non calcolabili Serie A Awards, Fair Play, Indennizzo Carnevali e il Trofeo
Mazzarri (criterio non definito). Le assicurazioni 25-26 sono **un'immagine PNG**.

**⭐ E il difetto peggiore dell'archivio ha un rimedio.** Le rose sono una fotografia di fine
stagione, e chi veniva ceduto a gennaio spariva: 20-74 giocatori a stagione. Sono saltate fuori le
**rose d'asta di settembre** per 2020-21, 2022-23 e 2024-25. Con la rosa di settembre *e* quella di
fine, **il mercato di gennaio si ricostruisce invece di inventarlo**. Ma la consegna ha ragione a
fermarsi: **e' una tabella nuova, non una colonna in piu' — cambia cosa vuol dire "rosa", quindi e'
scope, e non e' del Magazziniere da solo.**

**Regole della lega scoperte lavorando: da 9 a 11.** Incongruenze del regolamento: da 12 a 14.

### `regole-ferme-al-20` chiusa — e cosa non ha chiuso

Applicata dalla sessione del codice su richiesta esplicita di L0, **dichiarata come scavalcamento e
non come prassi**. Verifica di identita' per impronta md5 fra file e database: identici. Non
regressione su `v_premi_crediti`: invariata.

**Ma l'esito dice anche la cosa giusta:** la regola del pari merito adesso e' **nel dato**
(`crediti.premi.parita`) e **la vista non la legge** — il `CASE` su ultimo/penultimo e' scritto
dentro il SQL. Armata Rossa e Roburro continuano a prendere −1 ciascuna. **Aggiornare il dato non
ha applicato la regola**, ed e' esattamente il genere di cosa che un esito onesto deve dire.

### Diciassettesimo passaggio — il registro di Guido, e il metodo che cambia

Arrivata la consegna sulle sette regole ricavate da **`Pagamenti Vincite Crediti 1.xlsx`**: otto
fogli, sei stagioni, **quello che Guido ha davvero assegnato**.

**Non e' una fonte in piu': e' LA fonte sui crediti**, e cambia il metodo. La nota che chiude quella
consegna vale piu' delle sette regole messe insieme:

> *"Per tutta la giornata ho provato a dedurre regole dai dati — e mi sono sbagliato tre volte
> (Yildiz, lega_id, i listoni dati per mancanti). L0 ha indicato la strada in una riga: «i crediti
> finali di Guido sono fissi». **Dove esiste un registro di cio' che e' stato deciso, la regola si
> legge da li'. La deduzione serve solo dove il registro non arriva.**"*

E' lo stesso pattern che questa moviola ha registrato tre volte oggi da parte mia — `lega_id`
cercato nel file sbagliato, il gol vittoria misurato sulla partita sbagliata, l'audit fatto sul JSON
invece che sul PDF. **In tutti e sei i casi il dato era buono e la domanda no.** La differenza fra
noi e il registro non e' la bravura: e' che il registro non deduce.

**✅ Lacuna #12 chiusa.** L'arrotondamento dei risparmi riportati e' **per eccesso** — cinque casi
dispari senza eccezioni. E' lo **stesso verso** dell'arrotondamento dei rinnovi trovato stamattina:
a Caprera, quando un credito si spezza, va verso l'alto. Due regole diverse, un principio solo, e
scritto come principio.

**La Grigliata, ricavata e non scelta.** Conta il **totale completo** (posizioni + Coppa Italia +
capocannoniere) e i crediti escono dalla **griglia Serie A**, non da quella sulla Caprera. Nel
2025-26 la differenza **ribalta il vincitore**. ⚠️ Dal 2026-27 cambia: *"il capocannoniere conta
troppo"*.

**La trappola dei nomi, ed e' successa davvero:** una classifica rimandata corretta ha spostato il
primo posto da Sanguemisto ad Armata Rossa, perche' *"Juve" non e' "Juventus"*. Se la Grigliata
entra nel sito, **serve la tabella degli alias prima del punteggio, non dopo**.

**Corretto l'audit, per la terza volta.** Serie A Awards, Fair Play, Trofeo Mazzarri, Ranking,
Zdenek e Paratici **sono tutti registrati**. Li davo per non calcolabili: **erano scritti altrove.**
La distinzione giusta non e' *calcolabile / non calcolabile* — e' **si ricava dal nostro archivio ·
e' registrato altrove · non esiste**. Tenerle insieme faceva sembrare perso cio' che era solo in un
altro file. E il Carnevali non e' irraggiungibile: e' **dormiente**, mai assegnato in sei stagioni.

Sul **Trofeo Mazzarri** la correzione va al contrario: **l'esito e' registrato, il criterio no.** Il
premio piu' grande della lega non e' riproducibile da nessuno che non sia Guido.

**⚠️ Capology bocciato al referendum.** L'avevo scritto in tre posti come riforma del 2026-27.
E' **approvato nel meccanismo, bocciato, rinviato**: resta come modello — indicazione esplicita di
L0 di non toglierlo — con la conseguenza pratica che **i crediti iniziali 2026-27 non hanno gli 85
in piu'**.

**Due discrepanze col registro, una verificata da me:** `finanze.residui` non combacia su nessuna
delle dieci societa', e il numero di Guido e' quello buono perche' genera il riporto dell'anno dopo.
E a **Smit manca una penalita'**: la nostra catena da' `250 + 0 + 5 + 2 = 257`, che e' **esattamente
il numero di Guido prima del Caprera Etica da −5** con cui lui scende a 252. Nove su dieci
combaciano: la divergenza e' localizzata a un passo solo.

**Aperta e non deducibile:** la griglia sulla classifica Caprera non ha mai dato crediti in sei
stagioni, ma L0 dice che dovrebbe. **Da chiarire fra L0 e Guido** — ed e' giusto che la consegna si
sia fermata li' invece di scegliere.

**Regole della lega: da 11 a 13.** Incongruenze del regolamento: 16, **una chiusa**.

### Diciottesimo passaggio — il regolamento, affrontato per intero (23-24/08)

L0: *"dobbiamo affrontare il tema regolamento Caprera"*. Il tema non era uno, erano **cinque**, e
tenerli insieme era il motivo per cui sembrava ingestibile.

**Prima la riproduzione fedele** — `REGOLE/Regolamento-Caprera.md`, 42 pagine, **zero parole perse**
(verificato parola per parola). Cambiate solo cose di composizione: 9 sillabazioni ricomposte, 6
legature sciolte, 35 tabelle su 37 diventate tabelle vere. **I refusi lasciati di proposito**:
correggerli in silenzio significherebbe perdere il diff, ed erano l'oggetto del gruppo A.

Perche' conta: **un regolamento in PDF non si versiona**, e in `06_caprera_project` ce ne sono
sette copie che nessuno puo' confrontare. Da oggi una modifica alle regole e' **un diff**. Stesso
principio applicato quattro volte in quattro giorni — schema, vetrina, token, adesso il prodotto.

**Poi la classificazione**, e li' e' venuto fuori il valore: le tre liste che tenevamo separate si
sovrapponevano, e deduplicate danno **27 voci in cinque gruppi**. Il gruppo A e' il piu' numeroso e
il meno importante (refusi). Il gruppo **B e' il prodotto**: undici regole che la lega gioca e che
non stanno scritte da nessuna parte — *un mister le ha imparate giocando, un utente nuovo non puo'
impararle affatto*. Il gruppo **C sono due sole voci ed e' il rischio**: il regolamento promette una
regola che non esiste, e una delle due decide i gironi di Champions.

**Scritti B e A** col testo pronto da incollare e la riga esatta. Verificando sono emerse due cose
che le liste vecchie non dicevano: **A2 e' doppio, non singolo**, e i refusi minori includono
`-1\` `-2\` `-3\` — **residui di backslash Markdown**, che confermano che il regolamento nasce da
un sorgente Markdown. Se quel sorgente esiste ancora, e' **lui** il documento da correggere.

### Il caso Orsolini — dove ho sbagliato di nuovo, e cosa ne e' uscito

Nell'errata avevo scritto che **la clausola di Sucic era sotto il minimo**. Falso: quotazione 10,
CR 30, minimo 7,5 o 10. Avevo dedotto senza il dato. L0 ha dato il numero vero in una riga.

Poi L0: *"Orsolini e' centrocampista"*. In archivio risulta A — e **hanno ragione tutti e due**:
Fantapazz gli ha cambiato ruolo. C nel 22-23, 23-24, 24-25; **A nel 25-26**. Il contratto e' del
24-25.

**Da un mio errore e' uscita una lacuna vera che nessuno aveva visto:** la soglia della clausola
dipende dal ruolo, **il ruolo cambia negli anni**, e il regolamento non dice quale conta. Dice
quale vale per il *rinnovo*, non per la *soglia*. Non si vedeva nei dati — nei dati Orsolini e' `A`
e basta. Si e' vista solo perche' L0 sapeva una cosa che il database non sa.

**Misurato invece di argomentato:** sulle 46 clausole confrontabili **le due letture danno lo stesso
verdetto su tutte**. Sotto soglia sono **due**, per **6 crediti in tutto**. Una decisione che
sembrava dirimente si e' rivelata a basso impatto — e questo si sapeva solo contando.

**L0 ha deciso la direzione e sospeso il passato:** *"in futuro dovra' essere come nella regola"*.
E' la forma giusta, e ne discende una cosa che tocca a noi: **le due sviste sono successe perche' la
clausola si dichiara per email e il conto non lo fa nessuno.** Finche' resta cosi', ne succederanno
altre.

### E ho riordinato un disordine che avevo creato io

Le 27 voci erano finite in **quattro documenti sovrapposti**, con `TASK_Regolamento_Correzioni.md`
citato da sei posti e ormai superato. **E' lo stesso pattern che questo progetto paga da quattro
giorni**, prodotto da me mentre lo documentavo. Convertito in **indice**: tiene il nome (i link
reggono) e rimanda ai tre documenti veri.

**Pattern, ed e' il quinto della serie:** *scrivere di piu' non e' documentare meglio.* Quattro
documenti che dicono la stessa cosa in modi diversi sono quattro posti dove sbagliarla.

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
