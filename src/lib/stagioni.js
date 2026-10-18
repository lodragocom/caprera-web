/** La stagione aperta viene dal database, mai dall'ultimo export storico. */
export function stagioneAttiva(anni = []) {
  const ordinate = [...anni].sort((a, b) => b.ordine - a.ordine)
  return ordinate.find((a) => !a.conclusa) ?? ordinate[0] ?? null
}

/** Una sola fotografia per societa': corrente quando esiste, altrimenti fine. */
export function roseAttuali(righe = []) {
  const chiave = r => `${r.stagione ?? ''}/${r.societa}`
  const correnti = new Set(righe.filter((r) => r.momento === 'corrente').map(chiave))
  return righe.filter((r) => r.momento === (correnti.has(chiave(r)) ? 'corrente' : 'fine'))
}
