import { chromium } from 'playwright'
const BASE = 'http://localhost:4180'
const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
const p = await b.newPage({ viewport: { width: 1800, height: 1200 } })
p.on('pageerror', (e) => console.log('PAGEERROR:', e.message))
await p.goto(BASE + '/login', { waitUntil: 'networkidle' })
await p.locator('input[type="email"]').fill('salvo@prova.it')
await p.locator('input[type="password"]').fill('provaprova')
await p.locator('.login-go').click()
await p.waitForTimeout(2500)
await p.goto(BASE + '/area/rosa', { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
for (const [nome, file] of [['Portieri', 'portieri'], ['Centrocampisti', 'centrocampisti'],
                            ['Attaccanti', 'attaccanti'],
                            ['Quanto valevano', 'valore'], ['Cosa non', 'mancano']]) {
  const sez = p.locator('section', { has: p.locator('h2', { hasText: new RegExp(nome, 'i') }) }).first()
  await sez.scrollIntoViewIfNeeded()
  await p.waitForTimeout(400)
  await sez.screenshot({ path: `/home/claude/rosa-${file}.png` })
}
// la pagina Contratti, per gli slot
await p.locator('.dash-nav a', { hasText: 'Contratti' }).click()
await p.waitForTimeout(2000)
await p.locator('.pannello').first().screenshot({ path: '/home/claude/contratti-slot.png' })
const fuori = p.locator('.pannello', { has: p.locator('h2', { hasText: 'Decaduti' }) }).first()
if (await fuori.count()) await fuori.screenshot({ path: '/home/claude/contratti-fuori.png' })
console.log('fatto')
await b.close()
