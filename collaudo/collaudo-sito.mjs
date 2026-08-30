/**
 * Collaudo di tutto il sito.
 *
 * Apre ogni pagina, preme ogni bottone di scelta (stagione, competizione,
 * giornata), cambia ogni menu a tendina e segue ogni link interno, tenendo
 * d'occhio la console. Serve perche' un errore JavaScript non si vede: la
 * pagina resta li' mezza vuota e i link semplicemente non rispondono, che e'
 * esattamente come si era rotta la pagina Coppe.
 */
import { chromium } from 'playwright'
import { guardaIlTetto } from './tetto.mjs'

const BASE = 'http://localhost:4180'
const PUBBLICHE = ['/', '/classifica', '/risultati', '/squadre', '/rose', '/contratti',
  '/albo-doro', '/giocatori', '/giocatori/1084', '/partita/1', '/stats', '/asta', '/ranking', '/coppe', '/regolamento',
  '/assicurazioni', '/statistiche', '/login']
const AREA = ['/area', '/area/rosa', '/area/formazioni', '/area/contratti',
  '/area/crediti', '/area/coppe', '/area/storia']

const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
const p = await b.newPage({ viewport: { width: 1500, height: 1100 } })

let pagina = ''
const problemi = []
const tetto = guardaIlTetto(p)
p.on('pageerror', (e) => problemi.push(`[${pagina}] ERRORE JS: ${e.message}`))
p.on('console', (m) => {
  if (m.type() === 'error' && !m.text().includes('TUNNEL')) problemi.push(`[${pagina}] CONSOLE: ${m.text()}`)
})

/** Preme ogni bottone di un gruppo di scelta e guarda se qualcosa esplode. */
async function premiTutto(sel) {
  const n = await p.locator(sel).count()
  for (let i = 0; i < n; i += 1) {
    await p.locator(sel).nth(i).click({ timeout: 3000 }).catch(() => {})
    await p.waitForTimeout(120)
  }
  return n
}

/** Sceglie ogni voce di ogni menu a tendina della pagina. */
async function cambiaTendine() {
  const sel = await p.locator('select').count()
  let voci = 0
  for (let i = 0; i < sel; i += 1) {
    const opz = await p.locator('select').nth(i).locator('option').count()
    voci += opz
    for (let j = 0; j < opz; j += 1) {
      const v = await p.locator('select').nth(i).locator('option').nth(j).getAttribute('value')
      await p.locator('select').nth(i).selectOption(v).catch(() => {})
      await p.waitForTimeout(110)
    }
  }
  return voci
}

async function visita(rotta, { attesa = 900 } = {}) {
  pagina = rotta
  await p.goto(BASE + rotta, { waitUntil: 'networkidle' })
  await p.waitForTimeout(attesa)
  const vuota = await p.evaluate(() => (document.querySelector('main, .dash-main')?.innerText ?? '').trim().length)
  if (vuota < 40) problemi.push(`[${rotta}] la pagina e' praticamente vuota (${vuota} caratteri)`)
  const bottoni = await premiTutto('.scelta-stagione button')
  const giornate = await premiTutto('.scelta-giornata button')
  const voci = await cambiaTendine()
  // ogni link interno deve puntare a una rotta che esiste
  const rotti = await p.$$eval('a[href^="/"]', (a) =>
    [...new Set(a.map((x) => x.getAttribute('href')))])
  return { bottoni, giornate, voci, link: rotti.length }
}

console.log('=== PAGINE PUBBLICHE ===')
for (const r of PUBBLICHE) {
  const x = await visita(r)
  console.log(`${r.padEnd(18)} stagioni ${String(x.bottoni).padStart(2)} · giornate ${String(x.giornate).padStart(2)} · voci ${String(x.voci).padStart(3)} · link ${x.link}`)
}

console.log('\n=== SCHEDE SOCIETA\' ===')
await p.goto(BASE + '/squadre', { waitUntil: 'networkidle' })
const squadre = await p.$$eval('a[href^="/squadre/"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))])
for (const r of squadre) {
  const x = await visita(r)
  console.log(`${r.padEnd(30)} stagioni ${String(x.bottoni).padStart(2)} · voci ${String(x.voci).padStart(2)} · link ${x.link}`)
}

console.log('\n=== AREA MISTER ===')
pagina = '/login'
await p.goto(BASE + '/login', { waitUntil: 'networkidle' })
await p.locator('input[type="email"]').fill('salvo@prova.it')
await p.locator('input[type="password"]').fill('provaprova')
await p.locator('.login-go').click()
await p.waitForTimeout(1200)
// Dentro l'area si naviga cliccando, non con goto: la sessione sta in memoria
// e un caricamento da zero riporterebbe al login (scelta voluta, vedi auth.jsx).
const VOCI_AREA = ['Panoramica', 'La mia rosa', 'Formazioni', 'Contratti', 'Crediti', 'Coppe', 'Storia e racconto', 'La mia tessera']
for (const voce of VOCI_AREA) {
  pagina = `/area · ${voce}`
  await p.locator('.dash-nav a', { hasText: voce }).click()
  await p.waitForTimeout(voce === 'Formazioni' ? 7000 : 1200)
  const testo = await p.evaluate(() => (document.querySelector('.dash-main')?.innerText ?? '').trim().length)
  if (testo < 40) problemi.push(`[${pagina}] sezione praticamente vuota (${testo} caratteri)`)
  if (new URL(p.url()).pathname === '/login') problemi.push(`[${pagina}] buttato fuori al login`)
  const bottoni = await premiTutto('.scelta-stagione button')
  const giornate = await premiTutto('.scelta-giornata button')
  const voci = await cambiaTendine()
  const link = await p.locator('a[href^="/"]').count()
  console.log(`${voce.padEnd(20)} ${String(testo).padStart(5)} caratteri · stagioni ${String(bottoni).padStart(2)} · giornate ${String(giornate).padStart(2)} · voci ${String(voci).padStart(2)} · link ${link}`)
}

console.log('\n=== LINK SEGUITI DAVVERO ===')
// `apri` e' la scheda da cliccare prima: le sezioni della scheda societa'
// non sono tutte in pagina insieme, e cercarle senza aprirle e' un falso
// allarme garantito.
const CLIC = [
  ['/coppe', ".albo-lista a[href^='/squadre/']", 'albo d\'oro → società'],
  ['/coppe', ".match a[href^='/squadre/']", 'tabellone → società'],
  ['/coppe', ".trofeo a[href^='/squadre/']", 'albo stagione → società'],
  ['/squadre/prosecco', ".trofeo-card", 'bacheca → coppe'],
  ['/squadre/prosecco', ".tappa a[href^='/squadre/']", 'percorso → società'],
  ['/squadre/prosecco', "a.sd-gara[href^='/squadre/']", 'partite → società', 'Partite'],
  ['/albo-doro', "a[href^='/squadre/']", 'albo d\'oro pagina → società'],
  ['/giocatori', "a.gi-nome", 'giocatori → scheda calciatore'],
  ['/giocatori/1084', ".sg-maglia[href^='/squadre/']", 'scheda calciatore → società'],
  ['/risultati', "a.ri-partita", 'calendario → tabellino'],
  ['/partita/1', ".pt-lato[href^='/squadre/']", 'tabellino → società'],
  ['/partita/1', "a.pt-nome[href^='/giocatori/']", 'tabellino → scheda calciatore'],
]
for (const [dove, sel, nome, apri] of CLIC) {
  pagina = dove
  await p.goto(BASE + dove, { waitUntil: 'networkidle' })
  await p.waitForTimeout(900)
  if (apri) {
    await p.locator('.sd-schede button', { hasText: apri }).click().catch(() =>
      problemi.push(`[${dove}] non trovo la scheda "${apri}"`))
    await p.waitForTimeout(1200)
  }
  const n = await p.locator(sel).count()
  if (!n) { problemi.push(`[${dove}] nessun link per "${nome}" (${sel})`); console.log(`${nome}: NESSUN LINK`); continue }
  const href = await p.locator(sel).first().getAttribute('href')
  await p.locator(sel).first().scrollIntoViewIfNeeded()
  await p.locator(sel).first().click({ timeout: 4000 }).catch((e) =>
    problemi.push(`[${dove}] clic fallito su "${nome}": ${String(e).split('\n')[0]}`))
  await p.waitForTimeout(700)
  const arrivo = new URL(p.url()).pathname
  const ok = arrivo !== dove
  if (!ok) problemi.push(`[${dove}] "${nome}" non naviga (resta su ${arrivo})`)
  console.log(`${nome.padEnd(30)} ${String(n).padStart(3)} link · ${href} → ${arrivo} ${ok ? 'ok' : '<-- FERMO'}`)
}

await b.close()
problemi.push(...tetto.problemi())
console.log(tetto.resoconto())
console.log('\n' + (problemi.length
  ? `${problemi.length} PROBLEMI:\n` + problemi.join('\n')
  : 'Nessun problema: nessun errore JS, nessuna pagina vuota, tutti i link seguiti.'))
