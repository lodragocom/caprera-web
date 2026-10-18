import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stagioneAttiva, roseAttuali } from '../src/lib/stagioni.js'
test('la stagione aperta prevale sull’ultimo archivio concluso', () => {
  assert.equal(stagioneAttiva([{id:'2025-26',ordine:10,conclusa:true},{id:'2026-27',ordine:11,conclusa:false}]).id,'2026-27')
  assert.equal(stagioneAttiva([]),null)
})
test('la rosa corrente non si mescola con quella di fine anno', () => {
  const righe=[{societa:'a',momento:'fine',nome:'Prima'},{societa:'a',momento:'corrente',nome:'Adesso'},{societa:'b',momento:'fine',nome:'Storico'}]
  assert.deepEqual(roseAttuali(righe).map(r=>r.nome),['Adesso','Storico'])
})
test('la fotografia corrente non cancella le rose delle stagioni precedenti',()=>{
  const righe=[{societa:'a',stagione:'2025-26',momento:'fine'},{societa:'a',stagione:'2026-27',momento:'fine'},{societa:'a',stagione:'2026-27',momento:'corrente'}]
  assert.deepEqual(roseAttuali(righe),[righe[0],righe[2]])
})
