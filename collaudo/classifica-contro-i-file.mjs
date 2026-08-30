import { chromium } from 'playwright'
import fs from 'node:fs'

const atteso = JSON.parse(fs.readFileSync('/home/claude/caprera-web/src/data/standings.json', 'utf8'))
const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
const p = await b.newPage({ viewport: { width: 1500, height: 1100 } })
const errs = []
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
p.on('console', m => { if (m.type() === 'error' && !/TUNNEL/.test(m.text())) errs.push('CONSOLE ' + m.text()) })
const chiamate = []
p.on('requestfinished', r => { const u = r.url(); if (u.includes(':5410')) chiamate.push(u.split('/rest/v1/')[1].split('?')[0]) })

await p.goto('http://localhost:4180/classifica', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)
console.log('letture dal database:', [...new Set(chiamate)].join(', '))

let diversi = 0, controllate = 0
for (const s of Object.keys(atteso).sort().reverse()) {
  await p.selectOption('#stagione', s)
  await p.waitForTimeout(700)
  const righe = await p.$$eval('tbody tr', (tr) => tr.map((r) => {
    const c = [...r.querySelectorAll('td')].map((x) => x.textContent.trim())
    return { pos: c[0], squadra: c[1], g: c[2], v: c[3], n: c[4], p: c[5], gf: c[6], gs: c[7], pt: c[10] }
  }))
  for (const r of atteso[s]) {
    const mia = righe.find((x) => Number(x.pos) === r.position)
    controllate += 1
    if (!mia || Number(mia.pt) !== r.points || Number(mia.g) !== r.played
        || Number(mia.gf) !== r.goalsFor || Number(mia.gs) !== r.goalsAgainst
        || Number(mia.v) !== r.won || Number(mia.n) !== r.drawn || Number(mia.p) !== r.lost) {
      diversi += 1
      console.log(`  DIVERSO ${s} pos ${r.position}: file ${r.points}pt ${r.played}g ${r.goalsFor}-${r.goalsAgainst} · pagina`, mia)
    }
  }
}
console.log(`\nrighe confrontate col file: ${controllate}, diverse: ${diversi}`)

await p.click('.seg button:nth-child(2)')
await p.waitForTimeout(900)
const fp = await p.$$eval('tbody tr', (tr) => tr.slice(0, 3).map((r) =>
  [...r.querySelectorAll('td')].map((x) => x.textContent.trim()).join('  ')))
console.log('\nFantapunti 2016-17 (primi tre):'); fp.forEach((r) => console.log('  ', r))

await p.click('.seg button:nth-child(3)')
await p.waitForTimeout(900)
const st = await p.$$eval('tbody tr', (tr) => tr.slice(0, 3).map((r) =>
  [...r.querySelectorAll('td')].map((x) => x.textContent.trim()).join('  ')))
console.log('\nPerpetua (prime tre):'); st.forEach((r) => console.log('  ', r))
await p.screenshot({ path: '/tmp/shots/classifica-db.png' })
await b.close()
console.log('\n' + (errs.length ? 'ERRORI:\n' + errs.join('\n') : 'Nessun errore JS.'))
