import { chromium } from 'playwright'
import { guardaIlTetto } from './tetto.mjs'
const BASE = 'http://localhost:4180'
const API = 'http://localhost:5410'
const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
const p = await b.newPage({ viewport: { width: 1500, height: 1100 } })
let pagina = '/login'
const problemi = []
const tetto = guardaIlTetto(p)
p.on('pageerror', (e) => problemi.push(`[${pagina}] ERRORE JS: ${e.message}`))
p.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('TUNNEL')) problemi.push(`[${pagina}] CONSOLE: ${m.text()}`) })

async function premiTutto(sel) {
  const n = await p.locator(sel).count()
  for (let i = 0; i < n; i += 1) { await p.locator(sel).nth(i).click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(120) }
  return n
}
// L'accesso vero: email della tessera e password. Il finto Supabase non
// controlla la password - controlla che il sito la chieda e che dopo si
// presenti al database con l'identita' giusta.
await p.goto(BASE + '/login', { waitUntil: 'networkidle' })
await p.locator('input[type="email"]').fill('salvo@prova.it')
await p.locator('input[type="password"]').fill('provaprova')
await p.locator('.login-go').click()
await p.waitForTimeout(1200)
if (new URL(p.url()).pathname === '/login') problemi.push('[login] rimasto alla porta')
for (const voce of ['Panoramica', 'La mia rosa', 'Formazioni', 'Contratti', 'Crediti', 'Coppe', 'Storia e racconto', 'La mia tessera']) {
  pagina = `/area · ${voce}`
  await p.locator('.dash-nav a', { hasText: voce }).click()
  await p.waitForTimeout(voce === 'Formazioni' ? 7000 : 1200)
  const testo = await p.evaluate(() => (document.querySelector('.dash-main')?.innerText ?? '').trim().length)
  if (testo < 40) problemi.push(`[${pagina}] sezione vuota (${testo} caratteri)`)
  if (new URL(p.url()).pathname === '/login') problemi.push(`[${pagina}] buttato fuori al login`)
  const bottoni = await premiTutto('.scelta-stagione button')
  const giornate = await premiTutto('.scelta-giornata button')
  const link = await p.locator('a[href^="/"]').count()
  console.log(`${voce.padEnd(20)} ${String(testo).padStart(5)} caratteri · stagioni ${String(bottoni).padStart(2)} · giornate ${String(giornate).padStart(3)} · link ${link}`)
}
/* --------------------------------- le stagioni nominate devono esistere
 * La scheda che spiega i due listoni nomina le stagioni che li hanno tutti e
 * due. Prima quell'elenco era scritto in pagina a mano — e il giorno in cui
 * ne sono entrate altre due la frase e' diventata falsa **senza rompere
 * niente**, che e' il difetto peggiore: non lo trova nessuno. Adesso l'elenco
 * viene dall'archivio, e qui si controlla che sia davvero quello.
 */
pagina = '/area/rosa · stagioni nominate'
const conPartenza = (await (await fetch(
  `${API}/rest/v1/listone_momenti?select=stagione&momento=eq.partenza`,
  { headers: { apikey: 'finto', Authorization: 'Bearer finto' } })).json())
  .map((r) => r.stagione).sort()

await p.goto(BASE + '/area/rosa', { waitUntil: 'networkidle' })
await p.selectOption('.ro-stagione select', '2022-23').catch(() => {})
await p.waitForTimeout(1500)
const spiega = await p.locator('.ro-confronto .ro-nota').first().innerText()
for (const anno of conPartenza) {
  if (!spiega.includes(anno)) {
    problemi.push(`[rosa 2022-23] la scheda non nomina il ${anno}, che ha il listone di partenza`)
  }
}
// e non deve nominarne di inventate. Il 2022-23 lo nomina di suo — e' la
// stagione aperta, la frase comincia proprio da li' — quindi non conta.
for (const anno of (await p.locator('.ro-stagione select option').allInnerTexts()).map((s) => s.trim())) {
  if (anno === '2022-23') continue
  if (spiega.includes(anno) && !conPartenza.includes(anno)) {
    problemi.push(`[rosa 2022-23] la scheda nomina il ${anno}, che il listone di partenza non ce l'ha`)
  }
}
console.log(`stagioni coi due listoni · archivio: ${conPartenza.join(', ')} · nominate in pagina: tutte`)

/* ------------------------------------------- il mercato di gennaio in rosa
 * `rose` ha due momenti. La rosa di maggio da sola non puo' raccontare il
 * mercato: contiene chi e' arrivato e **non contiene chi e' uscito**, quindi
 * non dice nemmeno di non dirlo. Con tutti e due i momenti la pagina lo dice,
 * e allora deve tornare: trentuno prima, trentuno dopo, usciti = entrati.
 */
pagina = '/area/rosa · mercato'
await p.goto(BASE + '/area/rosa', { waitUntil: 'networkidle' })
await p.selectOption('.ro-stagione select', '2025-26').catch(() => {})
await p.waitForTimeout(1600)
const merc = p.locator('.ro-confronto', { hasText: 'Il mercato di gennaio' })
if (!(await merc.count())) {
  problemi.push('[rosa 2025-26] manca la scheda del mercato, e le due rose ci sono')
} else {
  const out = await merc.locator('.cr-lista').nth(0).locator('.cr-riga').count()
  const inn = await merc.locator('.cr-lista').nth(1).locator('.cr-riga').count()
  if (out !== inn) problemi.push(`[rosa 2025-26] ${out} usciti e ${inn} entrati: non torna`)
  const tinte = await p.locator('tr.ro-uscito').count()
  const tinteIn = await p.locator('tr.ro-entrato').count()
  if (tinte !== out || tinteIn !== inn) {
    problemi.push(`[rosa 2025-26] la tabella tinge ${tinte}/${tinteIn}, la scheda dice ${out}/${inn}`)
  }
  // e la rosa d'asta dev'essere quella dichiarata nella frase
  const frase = await merc.locator('.ro-nota').first().innerText()
  const [a, b] = (frase.match(/\b\d+\b/g) || []).map(Number)
  if (a !== b) problemi.push(`[rosa 2025-26] la frase dice ${a} a settembre e ${b} a maggio`)
  console.log(`mercato di gennaio · ${a} a settembre, ${b} a maggio · ${out} fuori, ${inn} dentro`)
}

/* ------------------------------------ i due listoni della stessa stagione
 * Dal 2025-26 l'archivio ha sia il listone di partenza sia quello scaricato
 * a fine anno. La scheda che li confronta e' l'unica del sito che mette due
 * numeri della stessa moneta a due date: se il collegamento fra i due elenchi
 * sbagliasse nome, i conti smetterebbero di tornare — e si vede solo qui.
 */
pagina = '/area/rosa · due listoni'
await p.goto(BASE + '/area/rosa', { waitUntil: 'networkidle' })
await p.selectOption('.ro-stagione select', '2025-26').catch(() => {})
await p.waitForTimeout(1600)
const cresc = p.locator('.ro-confronto:has(.cr-somma)')
if (!(await cresc.count())) {
  problemi.push('[rosa 2025-26] manca la scheda dei due listoni, e i due listoni ci sono')
} else {
  const num = (s) => Number(String(s).replace(/[^\d-]/g, ''))
  const testa = await cresc.locator('.cr-somma span b').allInnerTexts()
  const delta = num(await cresc.locator('.cr-somma > b').innerText())
  if (num(testa[1]) - num(testa[0]) !== delta) {
    problemi.push(`[rosa 2025-26] il totale non torna: ${testa[0]} → ${testa[1]} ma dice ${delta}`)
  }
  const righe = await cresc.locator('.cr-riga').count()
  for (let i = 0; i < righe; i += 1) {
    const r = cresc.locator('.cr-riga').nth(i)
    const [da, a] = (await r.locator('.cr-da').innerText()).split('→').map(num)
    const d = num(await r.locator('b').innerText())
    if (a - da !== d) {
      const chi = await r.locator('.cr-chi').innerText()
      problemi.push(`[rosa 2025-26] ${chi}: ${da} → ${a} non fa ${d}`)
    }
  }
  console.log(`due listoni · ${testa[0]} → ${testa[1]} (${delta}) · ${righe} nomi, tutti coerenti`)
}

/* -------------------------------------------------- l'estratto conto
 * `finanze.bonus` e' un intero solo, e il registro della Presidenza lo
 * scompone. Le due cose vengono da due posti diversi: qui si controlla che
 * dicano lo stesso numero, che e' l'unica prova che il caricamento e' giusto.
 */
pagina = '/area/crediti'
await p.goto(BASE + '/area/crediti', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const conti = p.locator('.pannello:has(.conto-totale)').first()
if (!(await conti.count())) {
  problemi.push('[crediti] l\'estratto conto non c\'e\': il pannello dei movimenti manca')
} else {
  const numero = (s) => Number(String(s).replace(/[^\d-]/g, '')) * (s.includes('-') ? 1 : 1)
  const gruppi = await conti.locator('.conto-testa b').allInnerTexts()
  const totale = numero(await conti.locator('.conto-totale b').innerText())
  const somma = gruppi.reduce((n, g) => n + numero(g), 0)
  if (somma !== totale) {
    problemi.push(`[crediti] i conti non sommano: gruppi ${somma}, totale ${totale}`)
  }
  // e ogni gruppo deve fare la somma delle sue voci
  const quanti = await conti.locator('.conto-gruppo').count()
  for (let i = 0; i < quanti; i += 1) {
    const g = conti.locator('.conto-gruppo').nth(i)
    const testa = numero(await g.locator('.conto-testa b').innerText())
    const voci = await g.locator('.conto-voce b').allInnerTexts()
    const s = voci.reduce((n, v) => n + numero(v), 0)
    if (s !== testa) {
      const nome = await g.locator('.conto-nome').innerText()
      problemi.push(`[crediti] «${nome}»: le voci fanno ${s}, il conto dice ${testa}`)
    }
  }
  const quadra = await conti.locator('.conto-quadra').count()
  const scarta = await conti.locator('.conto-scarta').count()
  if (!quadra && !scarta) problemi.push('[crediti] manca il riscontro col bilancio')
  console.log(`\nestratto conto · gruppi ${quanti} · totale ${totale} · ${quadra ? 'quadra col bilancio' : 'SCARTO dichiarato'}`)
}

/* Il confine: sulla scheda pubblica di una societa' non deve uscire nessuna
 * penalita' e nessun rimborso. Non e' una questione di stile — le voci del
 * codice etico nominano fatti veri di persone vere, e la vista `premi_pubblici`
 * esiste apposta per non darle. Se un giorno qualcuno la allarga, qui si rompe.
 */
pagina = '/squadre/* · crediti'
for (const squadra of ['roburro', 'smit', 'prosecco']) {
  await p.goto(`${BASE}/squadre/${squadra}`, { waitUntil: 'networkidle' })
  await p.locator('[role="tab"]', { hasText: 'Crediti' }).click()
  await p.waitForTimeout(1000)
  const sez = p.locator('.block:has(.premi-stagioni)')
  if (!(await sez.count())) { problemi.push(`[${squadra}] la sezione dei premi non c'e'`); continue }
  // solo i dati: la nota in fondo *parla* delle penalita' apposta per dire
  // che non ci sono, e cercarle li' dentro sarebbe cercarsi da soli.
  const testo = (await sez.first().locator('.premi-stagioni').innerText()).toLowerCase()
  for (const vietata of ['omicido', 'stupro', 'formazione non data', 'ritardo lista', 'ffp',
                         'assicurazione', 'penalita', 'penalit\u00e0']) {
    if (testo.includes(vietata)) {
      problemi.push(`[${squadra}] sulla pagina pubblica esce «${vietata}»: la finestra perde`)
    }
  }
  const voci = await sez.first().locator('.premi-voce').count()
  console.log(`${squadra.padEnd(12)} premi pubblici: ${voci} voci · niente penalita'`)
}

// e si rientra nell'area: quello che viene dopo sta li'
await p.goto(BASE + '/area', { waitUntil: 'networkidle' })
await p.waitForTimeout(1000)

// i link della sezione Coppe devono portare da qualche parte
await p.locator('.dash-nav a', { hasText: 'Coppe' }).click()
await p.waitForTimeout(1200)
console.log('trofei cliccabili:', await p.locator('.trofeo-card').count(), '· società nel percorso:', await p.locator(".tappa a[href^='/squadre/']").count())
await p.locator('.trofeo-card').first().click()
await p.waitForTimeout(800)
console.log('dopo il clic su un trofeo:', new URL(p.url()).pathname)

/* ------------------------------------------------ la Tessera del Tifoso */
pagina = '/area/tessera'
await p.goto(BASE + '/area/tessera', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const inc = await p.locator('.cart-incarichi .targhetta').allInnerTexts()
console.log('\nincarichi sul cartellino:', inc.join(', ') || '(nessuno)')
if (!inc.includes('Presidenza')) problemi.push('[tessera] la Presidenza non compare sul cartellino')
if (!(await p.locator('.cart-dati .mono').innerText()).includes('@'))
  problemi.push('[tessera] manca l\'email')

// Il pulsante non deve accendersi finche' non si cambia qualcosa: salvare
// una scheda identica e' un'azione che non vuole nessuno.
const salva = p.locator('form:has-text("I tuoi dati") .btn-oro')
if (!(await salva.isDisabled())) problemi.push('[tessera] "Salva" acceso senza modifiche')

// Un link storto deve essere fermato prima di arrivare al database.
const link = p.locator('.campo:has-text("videochiamata") input')
await link.fill('meet.google.com/abc')
await salva.click()
await p.waitForTimeout(400)
const rifiuto = await p.locator('.esito.no').innerText().catch(() => '')
console.log('link storto respinto:', rifiuto || '(NO!)')
if (!rifiuto.includes('http')) problemi.push('[tessera] link senza schema accettato')

// E adesso il giro completo: scrivo, salvo, ricarico, deve essere rimasto.
await link.fill('https://meet.google.com/asta-caprera')
await p.locator('input[type="tel"]').fill('+41 79 000 00 00')
const sopra = p.locator('.campo:has-text("Soprannome") input')
await sopra.fill('Presidente')
await salva.click()
await p.waitForTimeout(900)
console.log('esito del salvataggio:', await p.locator('.esito').innerText().catch(() => '(niente)'))

await p.reload({ waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const rimasto = await p.locator('.campo:has-text("videochiamata") input').inputValue()
const tel = await p.locator('input[type="tel"]').inputValue()
console.log('dopo il ricaricamento · link:', rimasto, '· telefono:', tel)
if (!rimasto.includes('asta-caprera')) problemi.push('[tessera] il link non e\' stato salvato')
if (!tel.includes('79')) problemi.push('[tessera] il telefono non e\' stato salvato')
if (!(await p.locator('.cart-testa span').innerText()).includes('Presidente'))
  problemi.push('[tessera] il soprannome non torna sul cartellino')

// La password: due diverse devono essere respinte dal sito, non dal server.
const pass = p.locator('form:has-text("Password") .btn-oro')
await p.locator('.campo:has-text("Nuova password") input').fill('unadue')
await p.locator('.campo:has-text("Ripetila") input').fill('trequattro')
await pass.click()
await p.waitForTimeout(300)
console.log('password diverse:', await p.locator('form:has-text("Password") .esito').innerText().catch(() => '(NO!)'))

/* ------------------------------------- il cambio societa' (solo vede_tutto) */
pagina = '/area · visita'
await p.goto(BASE + '/area', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const sel = p.locator('#dash-societa')
if (!(await sel.count())) problemi.push('[visita] il selettore non c\'e\' per chi vede tutto')
const quante = await sel.locator('option').count()
console.log('\nsocieta\' nel selettore:', quante)
if (quante < 10) problemi.push(`[visita] solo ${quante} societa' nel selettore`)

const mio = await p.locator('.dash-team strong').innerText()
await sel.selectOption('smit')
await p.waitForTimeout(1600)
const ora = await p.locator('.dash-team strong').innerText()
const fascia = await p.locator('.dash-avviso-visita').innerText().catch(() => '')
console.log(`da "${mio}" a "${ora}" · fascia: ${fascia.split('\n')[0] || '(NESSUNA!)'}`)
if (ora === mio) problemi.push('[visita] la societa\' non e\' cambiata')
if (!fascia) problemi.push('[visita] manca la fascia di avviso')

// i dati devono seguire lo sguardo, non restare quelli di prima
const testoPan = await p.evaluate(() => document.querySelector('.dash-main')?.innerText ?? '')
if (!testoPan.includes(ora)) problemi.push('[visita] la panoramica non parla della societa\' guardata')

// le "ultime cinque" devono dire contro CHI, non solo "in casa di"
const avversari = await p.locator('.pan-gare .pan-avv').allInnerTexts()
if (!avversari.length) problemi.push('[ultime 5] non trovo nessuna riga: il selettore non guarda piu\' niente')
console.log('ultime 5 · avversari:', avversari.map((t) => t.replace(/\s+/g, ' ').trim()).join(' | ') || '(nessuno)')
// la rosa deve portare alle schede dei calciatori, e dire cosa hanno fatto qui
await p.goto(BASE + '/area/rosa', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)
const versoSchede = await p.locator('.ro-tabella a[href^="/giocatori/"]').count()
if (!versoSchede) problemi.push('[rosa] nessun calciatore porta alla sua scheda')
const conNoi = await p.locator('.ro-anni').count()
if (!conNoi) problemi.push('[rosa] nessuna riga dice da quante stagioni e\' in societa\'')
const storico = await p.locator('.ro-storico .ro-classifica li').count()
console.log(`rosa · schede ${versoSchede} · righe con la carriera ${conNoi} · storico ${storico}`)

/*
 * La quotazione deve dire di che giorno e'.
 *
 * Il 2025-26 ha il listone di partenza: si puo' mettere accanto al costo
 * d'asta, e verde e rosso hanno senso. Le stagioni prima hanno solo la
 * quotazione di fine anno: mostrarla va bene, colorarla come «affare» no —
 * sarebbe un giudizio dato con la moviola su una scommessa fatta prima.
 */
for (const [anno, diPartenza] of [['2025-26', true], ['2019-20', false], ['2016-17', false]]) {
  pagina = `/area/rosa · ${anno}`
  await p.goto(BASE + '/area/rosa', { waitUntil: 'networkidle' })
  await p.selectOption('.ro-stagione select', anno).catch(() => {})
  await p.waitForTimeout(1500)
  const quotate = await p.locator('.ro-quota').count()
  const colorate = await p.locator('.ro-quota.affare, .ro-quota.caro').count()
  const colonna = await p.locator('.ro-tabella th').filter({ hasText: /^Quot/ })
    .first().innerText().catch(() => '(nessuna)')
  /*
   * Non basta che *qualche* quotazione ci sia.
   *
   * Quando il listone arrivava troncato al tetto delle mille righe, in pagina
   * la colonna «Quot.» era piena su quattro righe su trentasei — e il
   * controllo qui sotto («almeno una») passava lo stesso. Una spia che si
   * accende solo a motore fuso non e' una spia.
   *
   * Chi manca dal listone di settembre e' poco e si sa perche': il listone e'
   * del 30 agosto e il mercato ha chiuso il 1º settembre. Sono unita', non
   * decine. Se le celle piene scendono sotto i tre quarti delle righe, non e'
   * un buco dell'archivio: e' una lettura tagliata.
   */
  const perRiga = await p.evaluate(() => {
    let righe = 0
    let piene = 0
    for (const t of document.querySelectorAll('.ro-tabella table, table.ro-tabella')) {
      const th = [...t.querySelectorAll('th')].map((x) => x.innerText.trim())
      const i = th.findIndex((x) => /^Quot\./i.test(x))
      if (i < 0) continue
      for (const tr of t.querySelectorAll('tbody tr')) {
        righe += 1
        const c = tr.children[i]
        const v = (c?.innerText ?? '').trim()
        if (v && v !== '—' && v !== '-') piene += 1
      }
    }
    return { righe, piene }
  })
  console.log(`quotazioni ${anno} · colonna «${colonna}» · celle ${quotate} · colorate ${colorate}`
    + ` · righe ${perRiga.righe} con quotazione ${perRiga.piene}`)
  if (diPartenza && perRiga.righe && perRiga.piene < perRiga.righe * 0.75) {
    problemi.push(`[rosa ${anno}] quotazione su ${perRiga.piene} righe di ${perRiga.righe}:`
      + ' il listone arriva tagliato')
  }
  /*
   * Nessuna riga senza quotazione, e la colonna «Mercato» piena.
   *
   * Chi non e' sul listone di settembre — arrivato in Serie A a gennaio —
   * mostra la quotazione di maggio, marcata: un trattino faceva sembrare
   * l'archivio bucato. E ogni riga deve dire come e' arrivata: uscito,
   * gennaio, contratto o comprato. Una cella vuota li' e' una riga che il
   * sito non sa raccontare.
   */
  if (diPartenza) {
    const m = await p.evaluate(() => {
      let righe = 0
      let senzaQuota = 0
      let stimate = 0
      const merc = {}
      for (const t of document.querySelectorAll('.ro-tabella table, table.ro-tabella')) {
        const th = [...t.querySelectorAll('th')].map((x) => x.innerText.trim())
        const iq = th.findIndex((x) => /^Quot\.$/i.test(x))
        const im = th.findIndex((x) => /^Mercato$/i.test(x))
        if (iq < 0 || im < 0) continue
        for (const tr of t.querySelectorAll('tbody tr')) {
          righe += 1
          const q = (tr.children[iq]?.innerText ?? '').trim()
          if (!q || q === '—') senzaQuota += 1
          if (tr.children[iq]?.classList.contains('ro-stimata')) stimate += 1
          const v = (tr.children[im]?.innerText ?? '').trim().toLowerCase()
          merc[v || '(vuota)'] = (merc[v || '(vuota)'] ?? 0) + 1
        }
      }
      return { righe, senzaQuota, stimate, merc }
    })
    console.log(`  mercato ${anno} · righe ${m.righe} · senza quotazione ${m.senzaQuota}`
      + ` · di maggio ${m.stimate} · ` + Object.entries(m.merc).map(([k, v]) => `${k} ${v}`).join(' · '))
    if (m.senzaQuota) {
      problemi.push(`[rosa ${anno}] ${m.senzaQuota} righe senza nessuna quotazione:`
        + ' il ripiego sulla quotazione di maggio non ha funzionato')
    }
    if (m.merc['(vuota)']) {
      problemi.push(`[rosa ${anno}] ${m.merc['(vuota)']} righe con la colonna Mercato vuota`)
    }
    /*
     * Le quattro tabelle devono avere le stesse colonne.
     *
     * Prima il portiere aveva «Imbattuto» e «Gol subiti» dove gli altri
     * avevano «Gol» e «Assist»: scorrendo la pagina le tabelle ballavano.
     * E i numeri erano la somma di tutte le stagioni, non di quella scelta —
     * Barella diceva 268 presenze e 26 gol guardando il 2025-26.
     */
    const colonne = await p.evaluate(() => {
      const teste = []
      const perRuolo = {}
      for (const sez of document.querySelectorAll('.ro-reparto')) {
        const ruolo = sez.querySelector('.badge')?.innerText.trim()
        const th = [...sez.querySelectorAll('th')].map((x) => x.innerText.trim())
        teste.push(th.join('|'))
        // la presenza piu' alta della tabella: se e' un totale di carriera
        // esplode oltre le partite che una stagione puo' contenere
        // il CSS scrive le testate in maiuscolo: `innerText` le rende cosi'.
        // Cercare 'Pres.' esatto non trovava niente e il controllo qui sotto
        // non poteva fallire — un controllo che non fallisce mai non e' un
        // controllo, e' una rassicurazione.
        const i = th.findIndex((x) => /^pres\.$/i.test(x))
        let max = 0
        if (i >= 0) {
          for (const tr of sez.querySelectorAll('tbody tr')) {
            const v = Number((tr.children[i]?.innerText ?? '').trim())
            if (Number.isFinite(v)) max = Math.max(max, v)
          }
        }
        perRuolo[ruolo] = max
      }
      return { diverse: new Set(teste).size, quante: teste.length, perRuolo }
    })
    console.log(`  colonne ${anno} · ${colonne.quante} reparti, ${colonne.diverse} testata`
      + (colonne.diverse === 1 ? ' uguale' : ' DIVERSE')
      + ' · presenze piu\' alte ' + JSON.stringify(colonne.perRuolo))
    if (colonne.diverse > 1) {
      problemi.push(`[rosa ${anno}] i reparti hanno ${colonne.diverse} testate diverse:`
        + ' le tabelle non si allineano')
    }
    /*
     * I due riquadri della stessa rosa devono dire lo stesso numero.
     *
     * «Valore Fantapazz: 31 su 31 quotati» in testa e «30 giocatori quotati:
     * 325 a settembre» nella scheda della crescita: due conti sulla stessa
     * rosa, nella stessa pagina, che non combaciavano. Nessuno dei due era
     * rotto — contavano insiemi diversi — ed e' proprio per questo che non se
     * ne accorgeva nessuno finche' non li si metteva uno accanto all'altro.
     */
    const due = await p.evaluate(() => {
      const t = document.body.innerText.replace(/\s+/g, ' ')
      const a = /(\d+) su (\d+) quotati/.exec(t)
      const b = /(\d+) giocatori quotati: (\d+) a settembre/.exec(t)
      return { testa: a && Number(a[1]), scheda: b && Number(b[1]) }
    })
    if (due.testa != null && due.scheda != null) {
      console.log(`  quotati ${anno} · in testa ${due.testa} · nella crescita ${due.scheda}`)
      if (due.testa !== due.scheda) {
        problemi.push(`[rosa ${anno}] «${due.testa} quotati» in testa e «${due.scheda}»`
          + ' nella scheda della crescita: due conti diversi sulla stessa rosa')
      }
    }
    /*
     * L'interruttore stagione / carriera.
     *
     * Due cose devono valere insieme: le colonne non cambiano — e' la stessa
     * tabella che risponde a due domande — e i numeri della carriera devono
     * essere **maggiori o uguali** a quelli della stagione, per ogni riga.
     * Se una carriera fosse piu' piccola di una delle sue stagioni ci sarebbe
     * un totale che non e' un totale.
     */
    const carriera = await p.evaluate(() => {
      const prendi = () => {
        const righe = []
        let testata = ''
        for (const sez of document.querySelectorAll('.ro-reparto')) {
          const th = [...sez.querySelectorAll('th')].map((x) => x.innerText.trim())
          testata += th.join('|')
          const i = th.findIndex((x) => /^pres\.$/i.test(x))
          for (const tr of sez.querySelectorAll('tbody tr')) {
            righe.push([tr.children[0].innerText.trim(),
                        Number((tr.children[i]?.innerText ?? '').trim())])
          }
        }
        return { testata, righe }
      }
      const prima = prendi()
      const bottoni = [...document.querySelectorAll('.ro-vista button')]
      const b = bottoni.find((x) => /quando/i.test(x.innerText))
      if (!b) return null
      b.click()
      return new Promise((ok) => setTimeout(() => ok({ prima, dopo: prendi() }), 600))
    })
    if (!carriera) {
      problemi.push(`[rosa ${anno}] l'interruttore stagione/carriera non c'e'`)
    } else {
      const cresciute = carriera.dopo.righe.filter(([, n], i) =>
        Number.isFinite(n) && n > (carriera.prima.righe[i]?.[1] ?? 0)).length
      const calate = carriera.dopo.righe.filter(([nome, n], i) =>
        Number.isFinite(n) && Number.isFinite(carriera.prima.righe[i]?.[1])
        && n < carriera.prima.righe[i][1]).map(([nome]) => nome)
      console.log(`  carriera ${anno} · ${cresciute} righe crescono passando ai totali`
        + (calate.length ? ` · CALANO: ${calate.join(', ')}` : ''))
      if (carriera.prima.testata !== carriera.dopo.testata) {
        problemi.push(`[rosa ${anno}] l'interruttore cambia le colonne, non solo i numeri`)
      }
      if (calate.length) {
        problemi.push(`[rosa ${anno}] in carriera calano invece di crescere: ${calate.join(', ')}`)
      }
      if (!cresciute) {
        problemi.push(`[rosa ${anno}] nessuna riga cambia passando alla carriera:`
          + ' l\'interruttore non fa niente')
      }
      // e si torna alla stagione, per i controlli che vengono dopo
      await p.locator('.ro-vista button').first().click().catch(() => {})
      await p.waitForTimeout(600)
    }
    // Una stagione e' 36 giornate piu' le coppe. Oltre le 70 non e' una
    // stagione: e' una carriera finita nella colonna sbagliata.
    for (const [ruolo, max] of Object.entries(colonne.perRuolo)) {
      if (max > 70) {
        problemi.push(`[rosa ${anno}] ${ruolo}: ${max} presenze in una stagione sola.`
          + ' Sono i totali di carriera al posto di quelli dell\'anno')
      }
    }
    // «uscito» e «gennaio» devono pareggiare: se sono 31 prima e 31 dopo,
    // chi esce e chi entra sono lo stesso numero. E' lo stesso invariante
    // della scheda del mercato, ma letto dalle pastiglie della tabella.
    if ((m.merc.uscito ?? 0) !== (m.merc.gennaio ?? 0)) {
      problemi.push(`[rosa ${anno}] pastiglie: ${m.merc.uscito ?? 0} usciti e`
        + ` ${m.merc.gennaio ?? 0} presi a gennaio: non torna`)
    }
  }
  if (!quotate) problemi.push(`[rosa ${anno}] nessuna quotazione mostrata`)
  if (diPartenza && !colorate) problemi.push(`[rosa ${anno}] listone di partenza ma nessun affare colorato`)
  if (!diPartenza && colorate) problemi.push(`[rosa ${anno}] colora affari su una quotazione di fine stagione`)
}
/*
 * Il tetto degli slot, su tutte e dieci le societa'.
 *
 * Il regolamento dal 2025-26: al massimo 3 difensori, 3 centrocampisti e 2
 * attaccanti sotto contratto. I portieri no, si comprano a squadre.
 *
 * Non e' un controllo cosmetico: e' l'unico modo che ha il sito di accorgersi
 * se i contratti in archivio sono letti male. Contandoli tutti, tre societa'
 * sfondano — ed e' giusto che sfondino, perche' l'eccedenza e' ogni volta un
 * giocatore che ha lasciato la Serie A e non occupa nessun posto. Se il conto
 * torna su dieci su dieci, vuol dire che sia il registro sia la regola sono
 * letti bene. Se salta, uno dei due e' sbagliato.
 */
pagina = '/area/contratti · slot'
const TETTI = { D: 3, C: 3, A: 2 }
const slotFuori = []
for (const societa of ['prosecco', 'smit', 'real-monghi', 'sporting-mangiapreti',
                       'sanguemisto', 'armata-rossa', 'subbuteo', 'aston-ville',
                       'roburro', 'disperata']) {
  await p.goto(BASE + '/area', { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  await p.selectOption('#dash-societa', societa).catch(() => {})
  await p.waitForTimeout(1400)
  await p.locator('.dash-nav a', { hasText: 'Contratti' }).click()
  await p.waitForTimeout(1400)
  const slot = await p.evaluate(() => {
    const out = {}
    for (const d of document.querySelectorAll('.slot-mini .sm')) {
      const r = d.querySelector('.badge')?.innerText.trim()
      const n = Number(/^(\d+)/.exec(d.querySelector('strong')?.innerText ?? '')?.[1])
      if (r) out[r] = n
    }
    return { slot: out, fuori: document.querySelectorAll('.lista-contratti li.fuori').length }
  })
  const sfori = Object.entries(slot.slot).filter(([r, n]) => n > (TETTI[r] ?? 0))
  slotFuori.push(`${societa} ${Object.entries(slot.slot).map(([r, n]) => `${r}${n}`).join(' ')}`
    + (slot.fuori ? ` (+${slot.fuori} fuori rosa)` : ''))
  for (const [r, n] of sfori) {
    problemi.push(`[slot ${societa}] ${n} contratti di ruolo ${r}, il tetto e' ${TETTI[r]}`)
  }
}
console.log('\nslot per societa\':\n  ' + slotFuori.join('\n  '))

await p.goto(BASE + '/area', { waitUntil: 'networkidle' })
await p.waitForTimeout(1200)

const versoTabellino = await p.locator('.pan-gare a[href^="/partita/"]').count()
if (!versoTabellino) problemi.push('[ultime 5] nessuna partita porta al suo tabellino')
console.log('ultime 5 · portano al tabellino:', versoTabellino)
for (const a of avversari) {
  if (/^\s*in casa (con|di)\s*$/i.test(a)) problemi.push(`[ultime 5] avversario mancante: "${a.trim()}"`)
}

// ...ma la MIA tessera deve restare mia
await p.locator('.dash-nav a', { hasText: 'La mia tessera' }).click()
await p.waitForTimeout(1400)
const suCartellino = await p.locator('.cart-testa strong').innerText()
console.log('in visita, sul cartellino della tessera:', suCartellino)
if (suCartellino !== mio) problemi.push(`[visita] la tessera mostra "${suCartellino}" invece di "${mio}"`)

await p.locator('.dash-avviso-visita button, .dash-torna').first().click().catch(() => {})
await p.waitForTimeout(900)
console.log('dopo "torna alla mia":', await p.locator('.dash-team strong').innerText())

/* ------------------------------------------- il collegamento di recupero */
// Un link di recupero porta una sessione gia' valida. Il sito NON deve
// lasciar passare: deve chiedere la password nuova, altrimenti chi l'ha persa
// rientra con quella di prima e la riperde alla prossima volta.
pagina = '/login#type=recovery'
await p.goto(BASE + '/login#access_token=finto&type=recovery', { waitUntil: 'networkidle' })
await p.waitForTimeout(1400)
const dove = new URL(p.url()).pathname
const titolo = await p.locator('.login-box h1').innerText().catch(() => '(niente)')
console.log(`\ndopo il link di recupero: ${dove} · "${titolo}"`)
if (dove !== '/login') problemi.push(`[recupero] e' passato dritto a ${dove} senza chiedere la password`)
if (!/password/i.test(titolo)) problemi.push(`[recupero] non chiede la password: "${titolo}"`)

// due password diverse: fermato dal sito
await p.locator('.campo:has-text("Nuova password") input').fill('unadue')
await p.locator('.campo:has-text("Ripetila") input').fill('trequattro')
await p.locator('.login-go').click()
await p.waitForTimeout(400)
console.log('password diverse:', await p.locator('.login-errore').innerText().catch(() => '(NO!)'))

// due uguali: entra
await p.locator('.campo:has-text("Ripetila") input').fill('unadue')
await p.locator('.login-go').click()
await p.waitForTimeout(1600)
console.log('dopo averla scelta:', new URL(p.url()).pathname, '· hash:', new URL(p.url()).hash || '(pulito)')
if (new URL(p.url()).pathname !== '/area') problemi.push('[recupero] non entra dopo aver scelto la password')
if (new URL(p.url()).hash) problemi.push('[recupero] il pezzo type=recovery e\' rimasto nell\'indirizzo')

await b.close()
problemi.push(...tetto.problemi())
console.log(tetto.resoconto())
console.log('\n' + (problemi.length ? `${problemi.length} PROBLEMI:\n` + problemi.join('\n') : 'Area mister: nessun problema.'))
