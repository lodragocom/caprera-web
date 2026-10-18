import { test } from 'node:test'
import assert from 'node:assert/strict'
import { problemiFormazione } from '../src/lib/consegna.js'

const rosa = ['P', 'D', 'D', 'D', 'C', 'C', 'C', 'C', 'A', 'A', 'A', 'P'].map((ruolo, i) => ({ id: i + 1, ruolo }))
const regole = { moduli_ammessi: ['3-4-3', '4-4-2'], panchinari: 15 }
const titolari = rosa.slice(0, 11).map((g) => g.id)
test('undici coerenti con il modulo e riserve facoltative', () => {
  assert.deepEqual(problemiFormazione(rosa, regole, '3-4-3', titolari, []), [])
  assert.deepEqual(problemiFormazione(rosa, regole, '3-4-3', titolari, [12]), [])
})
test('rifiuta duplicati, giocatori esterni e modulo incoerente', () => {
  assert.ok(problemiFormazione(rosa, regole, '3-4-3', titolari, [1]).length)
  assert.ok(problemiFormazione(rosa, regole, '3-4-3', titolari, [99]).length)
  assert.ok(problemiFormazione(rosa, regole, '4-4-2', titolari, []).length)
  assert.ok(problemiFormazione(rosa, regole, '4-2-4', titolari, []).length)
})
test('regole assenti e limiti incompleti non autorizzano invii', () => {
  assert.ok(problemiFormazione(rosa, null, '3-4-3', titolari, []).length)
  assert.ok(problemiFormazione(rosa, { ...regole, panchinari: 0 }, '3-4-3', titolari, [12]).length)
})
