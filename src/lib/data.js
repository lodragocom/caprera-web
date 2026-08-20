/**
 * Dati "pesanti" — calendario completo e rose storiche.
 * Importa questo modulo solo da rotte lazy, mai dal bundle iniziale.
 * Per anagrafica/classifiche usa ./core.js.
 */
import matches from '../data/matches.json'
import rosters from '../data/rosters.json'
import listone from '../data/listone.json'
import contracts from '../data/contracts.json'
import finances from '../data/finances.json'

export { matches, rosters, listone, contracts, finances }

/** Contratti di una societa', dal piu' recente. */
export function contractsOf(teamId) {
  return contracts
    .filter((c) => c.team === teamId)
    .sort((a, b) => b.from.localeCompare(a.from) || a.player.localeCompare(b.player))
}

/** Stagioni coperte dai contratti, crescenti. */
export const CONTRACT_SEASONS = [
  ...new Set(contracts.flatMap((c) => [c.from, c.to])),
].sort()

/** Finanze di una stagione (array ordinato per spesa), o [] se assenti. */
export function financesOf(season) {
  return finances[season] ?? []
}

export const FINANCE_SEASONS = Object.keys(finances).sort()
export * from './core'

/** Partite di una stagione, opzionalmente filtrate per squadra. */
export function matchesOf(season, teamId = null) {
  return matches.filter(
    (m) =>
      m.season === season &&
      (!teamId || m.home === teamId || m.away === teamId)
  )
}

/** Numero di giornate in calendario per una stagione. */
export function roundsOf(season) {
  return matchesOf(season).reduce((max, m) => Math.max(max, m.round), 0)
}

const ROLE_ORDER = { P: 0, D: 1, C: 2, A: 3 }

/** Rosa di una squadra in una stagione, ordinata per ruolo e costo. */
export function rosterOf(season, teamId) {
  return rosters
    .filter((r) => r.season === season && r.team === teamId)
    .sort(
      (a, b) =>
        ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
        (b.cost ?? 0) - (a.cost ?? 0) ||
        a.player.localeCompare(b.player)
    )
}

/** Stagioni per cui esiste una rosa registrata. */
export const ROSTER_SEASONS = [...new Set(rosters.map((r) => r.season))].sort()

/** Riepilogo crediti/slot di una rosa. */
export function rosterSummary(roster) {
  const byRole = { P: 0, D: 0, C: 0, A: 0 }
  let spent = 0
  let apps = 0
  let fmSum = 0
  let fmCount = 0

  for (const p of roster) {
    byRole[p.role] = (byRole[p.role] ?? 0) + 1
    spent += p.cost ?? 0
    apps += p.apps ?? 0
    if (p.fm != null) {
      fmSum += p.fm
      fmCount += 1
    }
  }

  return {
    byRole,
    spent,
    apps,
    size: roster.length,
    avgFm: fmCount ? +(fmSum / fmCount).toFixed(2) : null,
  }
}

/** Forma recente: ultime N partite giocate, dalla piu' recente. */
export function formOf(season, teamId, n = 5) {
  return matchesOf(season, teamId)
    .filter((m) => m.played)
    .slice(-n)
    .reverse()
    .map((m) => {
      const home = m.home === teamId
      const gf = home ? m.homeGoals : m.awayGoals
      const ga = home ? m.awayGoals : m.homeGoals
      return {
        result: gf > ga ? 'V' : gf === ga ? 'N' : 'P',
        opponent: home ? m.away : m.home,
        score: `${gf}-${ga}`,
        home,
        round: m.round,
      }
    })
}
