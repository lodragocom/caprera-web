// Browser con RPC simulate: nessuna richiesta al database di produzione.
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
const base = process.env.SCHIERA_BASE ?? 'http://localhost:4180'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } })
const errori = []
page.on('pageerror', (e) => errori.push(e.message))
const user = { id: '11111111-1111-1111-1111-111111111111', email: 'mister@example.test', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
await page.addInitScript((u) => localStorage.setItem('caprera-tessera', JSON.stringify({
  access_token: 'test-token', refresh_token: 'test-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer', user: u,
})), user)
const rosa = ['P', 'D', 'D', 'D', 'C', 'C', 'C', 'C', 'A', 'A', 'A', 'P', 'D'].map((ruolo, i) => ({ id: i + 1, nome: `Calciatore ${i + 1}`, ruolo, club: 'Club' }))
let consegna = null
let bozza = null
let scenario = 'aperto'
let invii = 0
let ultimoPayload
await page.route('**/*', async (route) => {
  const url = new URL(route.request().url())
  if (!url.pathname.startsWith('/rest/v1/') && !url.pathname.startsWith('/auth/v1/')) return route.continue()
  let data = []
  if (url.pathname.includes('/auth/')) data = user
  if (url.pathname.endsWith('/la_mia_tessera')) data = { societa: 'prosecco', nome: 'Mister', ruolo: 'mister' }
  if (url.pathname.endsWith('/partite')) data = [{giornata:5,casa:'prosecco',fuori:'roburro'}]
  if (url.pathname.endsWith('/rpc/la_mia_consegna')) {
    data = { societa: 'prosecco', stagione:'2026-27', turno: ['vuoto','preparazione'].includes(scenario) ? null : {
      id: 1, stagione: '2026-27', giornata: 8, aperto: true,
      scadenza: new Date(Date.now() + (scenario === 'chiuso' ? -1000 : 3600000)).toISOString(),
    }, ora_server: new Date().toISOString(), rosa: scenario==='vuoto' ? [] : rosa, regole: { moduli_ammessi: ['3-4-3', '4-4-2'], panchinari: 15 }, consegna: scenario==='preparazione' ? null : consegna, bozza }
  }
  if (url.pathname.endsWith('/rpc/invia_la_mia_formazione')) {
    invii += 1
    ultimoPayload = route.request().postDataJSON()
    if (scenario === 'conflitto') return route.fulfill({ status: 400, json: { message: 'La formazione è stata aggiornata da un altro dispositivo. Ricarica prima di inviare.' } })
    consegna = { modulo: ultimoPayload.p_modulo, titolari: ultimoPayload.p_titolari, panchina: ultimoPayload.p_panchina, revisione: (consegna?.revisione ?? 0) + 1, inviata: new Date().toISOString() }
    data = consegna
  }
  if (url.pathname.endsWith('/rpc/salva_la_mia_bozza')) {
    const z=route.request().postDataJSON()
    bozza={modulo:z.p_modulo,titolari:z.p_titolari,panchina:z.p_panchina,revisione:(bozza?.revisione??0)+1,aggiornata:new Date().toISOString()}
    data=bozza
  }
  await route.fulfill({ json: data })
})
try {
  await page.goto(`${base}/area/schiera`)
  await page.getByRole('button', { name: 'Rifiuta tutto' }).click()
  await page.getByRole('heading', { name: 'La tua rosa', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Invia formazione', exact: true }).isDisabled(), true)
  for (let i = 1; i <= 11; i++) await page.getByLabel(`Convocazione Calciatore ${i}`, { exact: true }).selectOption('titolari')
  for (let i = 12; i <= 13; i++) await page.getByLabel(`Convocazione Calciatore ${i}`, { exact: true }).selectOption('panchina')
  await page.getByRole('button', { name: 'Alza priorità Calciatore 13', exact: true }).click()
  await page.getByRole('button', { name: 'Invia formazione', exact: true }).click()
  await page.getByText(/Formazione inviata il/).waitFor()
  assert.deepEqual(ultimoPayload.p_panchina, [13, 12])
  assert.equal(ultimoPayload.p_revisione, 0)
  await page.reload()
  await page.getByRole('button', { name: 'Aggiorna formazione', exact: true }).waitFor()
  assert.equal(await page.getByLabel('Convocazione Calciatore 1', { exact: true }).inputValue(), 'titolari')
  await page.getByLabel('Modulo', { exact: true }).selectOption('4-4-2')
  assert.equal(await page.getByRole('button', { name: 'Aggiorna formazione', exact: true }).isDisabled(), true)
  await page.getByLabel('Modulo', { exact: true }).selectOption('3-4-3')
  scenario = 'conflitto'
  await page.getByRole('button', { name: 'Aggiorna formazione', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'altro dispositivo' }).waitFor()
  assert.equal(ultimoPayload.p_revisione, 1)
  await page.getByRole('button', { name: 'Scarta modifiche e rileggi' }).click()
  await page.getByRole('button', { name: 'Aggiorna formazione', exact: true }).waitFor()
  await page.setViewportSize({ width: 390, height: 844 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false)
  await page.screenshot({ path: '/tmp/caprera-schiera-mobile.png', fullPage: true })
  scenario = 'chiuso'
  await page.reload()
  await page.getByText('Consegna chiusa.', { exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Aggiorna formazione', exact: true }).isDisabled(), true)
  scenario = 'vuoto'
  await page.reload()
  await page.getByRole('heading', { name: 'Rosa corrente non disponibile' }).waitFor()
  scenario='preparazione'
  await page.reload()
  await page.getByRole('button', {name:'Salva bozza',exact:true}).waitFor()
  await page.getByRole('heading', {name:'2026-27 · Giornata 5 · Preparazione',exact:true}).waitFor()
  assert.ok(await page.getByText('Prosecco – Roburro',{exact:true}).isVisible())
  for(let i=1;i<=11;i++) await page.getByLabel(`Convocazione Calciatore ${i}`,{exact:true}).selectOption('titolari')
  await page.getByRole('button', {name:'Salva bozza',exact:true}).click()
  await page.getByText(/Bozza salvata il/).waitFor()
  await page.reload()
  await page.getByText(/Ultima bozza:/).waitFor()
  assert.equal(await page.getByLabel('Convocazione Calciatore 1',{exact:true}).inputValue(),'titolari')
  assert.ok(await page.getByText('la bozza non vale come consegna ufficiale.',{exact:true}).isVisible())
  assert.equal(invii, 2)
  assert.deepEqual(errori, [])
  console.log('Schiera: invio, panchina, persistenza, modulo, conflitto, scadenza, mobile, rosa assente e bozza senza turno OK.')
} finally { await browser.close() }
