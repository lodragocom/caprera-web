import { test } from 'node:test'
import assert from 'node:assert/strict'
import { traduciErroreAuth } from '../src/lib/erroriAuth.js'

test('riporta il minimo richiesto dal server, senza fissarlo a sei', () => {
  assert.equal(traduciErroreAuth('Password should be at least 12 characters.'),
    'La password è troppo corta: servono almeno 12 caratteri.')
})
test('un requisito sui caratteri non diventa un errore di lunghezza', () => {
  const m = 'Password should contain at least one character of each: abc, ABC, 012.'
  assert.ok(traduciErroreAuth(m).includes(m))
  assert.ok(!traduciErroreAuth(m).includes('troppo corta'))
})
test('conserva tempi di attesa e motivi non riconosciuti', () => {
  const m = 'Please wait at least 60 seconds before requesting another email.'
  assert.equal(traduciErroreAuth(m), m)
  assert.ok(traduciErroreAuth('Password is known to be weak and easy to guess.').includes('weak'))
})
