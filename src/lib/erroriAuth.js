/** Traduce solo gli errori riconosciuti, senza inventare requisiti. */
export function traduciErroreAuth(m = '') {
  const t = m.toLowerCase()
  if (t.includes('invalid login credentials')) {
    return 'Email o password non corrispondono. Se è la prima volta, devi prima creare la password.'
  }
  if (t.includes('email not confirmed')) {
    return 'Devi ancora confermare l’email: cerca il messaggio della Federazione, anche fra la posta indesiderata.'
  }
  if (t.includes('user already registered')) {
    return 'Questa email è già registrata: entra con la tua password, o falla reimpostare.'
  }
  if (t.includes('should be different') || t.includes('same_password')) {
    return 'La nuova password è identica a quella di adesso: scegline un’altra.'
  }
  if (t.includes('rate limit') || t.includes('too many')) {
    return 'Troppi tentativi ravvicinati. Aspetta un minuto e riprova.'
  }
  const lunghezza = /^password should be at least (\d+) characters\.?$/i.exec(m.trim())
  if (lunghezza) return `La password è troppo corta: servono almeno ${lunghezza[1]} caratteri.`
  // "at least" puo' riguardare simboli, maiuscole o tempi di attesa.
  // Il dettaglio del server deve restare leggibile, anche se in inglese.
  if (t.includes('password')) return `La password non è stata accettata. Dettaglio: ${m}`
  return m
}
