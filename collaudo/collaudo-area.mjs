import { chromium } from 'playwright'
const BASE = 'http://localhost:4180'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const p = await b.newPage({ viewport: { width: 1500, height: 1100 } })
let pagina = '/login'
const problemi = []
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
const avversari = await p.locator('.ultime .avversario').allInnerTexts()
console.log('ultime 5 · avversari:', avversari.map((t) => t.replace(/\s+/g, ' ').trim()).join(' | ') || '(nessuno)')
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
console.log('\n' + (problemi.length ? `${problemi.length} PROBLEMI:\n` + problemi.join('\n') : 'Area mister: nessun problema.'))
