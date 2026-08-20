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
await p.goto(BASE + '/login', { waitUntil: 'networkidle' })
await p.locator('.scelta', { hasText: 'Prosecco' }).click()
await p.locator('.campo input').fill('Salvo')
await p.locator('.login-go').click()
await p.waitForTimeout(900)
for (const voce of ['Panoramica', 'La mia rosa', 'Formazioni', 'Contratti', 'Crediti', 'Coppe', 'Storia e racconto']) {
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
await b.close()
console.log('\n' + (problemi.length ? `${problemi.length} PROBLEMI:\n` + problemi.join('\n') : 'Area mister: nessun problema.'))
