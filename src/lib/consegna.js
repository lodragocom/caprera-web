/** Regole lette dal database: nessun modulo o limite duplicato qui. */
export function problemiFormazione(rosa, regole, modulo, titolari, panchina) {
  const errori = []
  if (!regole?.moduli_ammessi?.includes(modulo)) errori.push('Scegli un modulo ammesso.')
  if (titolari.length !== 11) errori.push(`Scegli 11 titolari: ne hai selezionati ${titolari.length}.`)
  if (!Number.isInteger(regole?.panchinari)) errori.push('Regole della panchina non disponibili.')
  else if (panchina.length > regole.panchinari) errori.push(`Puoi convocare al massimo ${regole.panchinari} riserve.`)
  const tutti = [...titolari, ...panchina]
  if (new Set(tutti).size !== tutti.length) errori.push('Un giocatore compare più volte.')
  const giocatori = new Map(rosa.map((g) => [g.id, g]))
  if (tutti.some((id) => !giocatori.has(id))) errori.push('Un giocatore non appartiene alla rosa disponibile.')
  if (regole?.moduli_ammessi?.includes(modulo) && titolari.length === 11) {
    const attesi = [1, ...modulo.split('-').map(Number)]
    if (['P', 'D', 'C', 'A'].some((r, i) =>
      titolari.filter((id) => giocatori.get(id)?.ruolo === r).length !== attesi[i])) {
      errori.push(`I ruoli dei titolari devono rispettare il ${modulo}.`)
    }
  }
  return errori
}
