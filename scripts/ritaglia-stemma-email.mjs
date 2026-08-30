/**
 * Ricava lo stemma tondo dal logo ufficiale della Federazione, per le email.
 *
 * Il logo ufficiale (`06_caprera_project/Caprera 26-27/loghi/`) porta sotto il
 * cerchio il lockup «Presidenza Tricolore / Un'istituzione». A 72px quella
 * scritta diventa una macchia, quindi per l'email serve il solo tondo.
 *
 * Il ritaglio non e' a occhio: cerca le righe in cui il contenuto e' largo
 * almeno il 70% dell'immagine — sono quelle del cerchio, mentre il lockup e'
 * piu' stretto. Cosi' se un domani il logo cambia proporzioni, lo script
 * continua a trovare il cerchio da solo.
 *
 *     node scripts/ritaglia-stemma-email.mjs
 *
 * Scrive `public/logos/federazione-stemma.png` a 240px — x3 sui 72 di posa,
 * perche' gli schermi retina non perdonano e un logo sgranato in un'email fa
 * piu' danno di nessun logo.
 */
import { chromium } from 'playwright'
import { readFileSync } from 'fs'

const SRC = process.env.LOGO ??
  '../06_caprera_project/Caprera 26-27/loghi/logo federazione caprera.png'
const FUORI = 'public/logos/federazione-stemma.png'
const LATO = 240

const dataUri = 'data:image/png;base64,' + readFileSync(SRC).toString('base64')
const b = await chromium.launch()
const p = await b.newPage()
await p.setContent('<body></body>')

const box = await p.evaluate(async (src) => {
  const img = new Image(); img.src = src
  await img.decode()
  const c = document.createElement('canvas')
  c.width = img.width; c.height = img.height
  const x = c.getContext('2d'); x.drawImage(img, 0, 0)
  const d = x.getImageData(0, 0, c.width, c.height).data
  let top = -1, bottom = -1, left = c.width, right = 0
  for (let y = 0; y < c.height; y++) {
    let a = -1, z = -1
    for (let px = 0; px < c.width; px++) {
      if (d[(y * c.width + px) * 4 + 3] > 24) { if (a < 0) a = px; z = px }
    }
    if (a < 0) continue
    if (top < 0) top = y
    if (z - a > c.width * 0.7) { bottom = y; left = Math.min(left, a); right = Math.max(right, z) }
  }
  return { top, bottom, left, right, w: c.width, h: c.height }
}, dataUri)

const lato = Math.max(box.right - box.left, box.bottom - box.top) + 2
const p2 = await b.newPage({ viewport: { width: LATO, height: LATO } })
await p2.setContent(`<body style="margin:0;background:transparent">
  <div style="width:${LATO}px;height:${LATO}px;overflow:hidden;position:relative">
    <img src="${dataUri}" style="position:absolute;
      width:${(box.w / lato) * LATO}px;
      left:${-(box.left / lato) * LATO}px;
      top:${-(box.top / lato) * LATO}px;"></div></body>`)
await p2.waitForTimeout(500)
await p2.screenshot({ path: FUORI, omitBackground: true })
console.log(`scritto ${FUORI} — cerchio trovato in ${JSON.stringify(box)}`)
await b.close()
