/**
 * Dati "leggeri" — anagrafica squadre, classifiche, riepilogo.
 * Vengono caricati in ogni pagina, quindi qui NON entrano
 * matches.json e rosters.json (che pesano ~560 KB e sono importati
 * solo dalle rotte che ne hanno bisogno, tramite lazy loading).
 */
import teams from '../data/teams.json'
import standings from '../data/standings.json'
import seasons from '../data/seasons.json'
import summary from '../data/summary.json'

export { teams, standings, seasons, summary }

export const CURRENT_SEASON = summary.currentSeason
export const LAST_PLAYED_SEASON = summary.lastPlayedSeason

/** Stagioni con risultati completi, dalla piu' recente. */
export const PLAYED_SEASONS = seasons.filter((s) => standings[s]?.length).reverse()

/** Le 10 società in attività. `teams` include anche quelle storiche. */
export const ACTIVE_TEAMS = teams.filter((t) => t.active)

/** Società non più in attività, presenti solo nell'archivio storico. */
export const HISTORIC_TEAMS = teams.filter((t) => !t.active)

const teamById = new Map(teams.map((t) => [t.id, t]))

export function getTeam(id) {
  return teamById.get(id)
}

export function teamName(id) {
  return teamById.get(id)?.name ?? '—'
}

/** Le società storiche non hanno un logo: in quel caso torna null. */
export function logoUrl(team) {
  return team?.logo ? `${import.meta.env.BASE_URL}logos/${team.logo}` : null
}

/**
 * I tre marchi della Federazione, disegnati da Salvo per i dieci anni:
 *  - lo stemma istituzionale (FC, tricolore, due stelle, 2016)
 *  - il badge della Caprera League, il volto della competizione
 *  - la composizione celebrativa 2016-2026
 * Sono SVG: restano nitidi a ogni dimensione e pesano meno di un PNG grande.
 */
export const federazioneLogo = `${import.meta.env.BASE_URL}logos/federazione.svg`
export const federazioneStemma = `${import.meta.env.BASE_URL}logos/federazione-stemma.svg`
export const capreraLogo = `${import.meta.env.BASE_URL}logos/caprera-league.svg`
export const dieciAnni = `${import.meta.env.BASE_URL}logos/dieci-anni.svg`
export const dieciAnniBlocco = `${import.meta.env.BASE_URL}logos/dieci-anni-blocco.svg`

/** Statistiche complessive di una squadra su tutte le stagioni giocate. */
export function careerOf(teamId) {
  const acc = {
    seasons: 0, played: 0, won: 0, drawn: 0, lost: 0,
    goalsFor: 0, goalsAgainst: 0, points: 0, titles: [], best: null,
  }
  for (const season of seasons) {
    const row = standings[season]?.find((r) => r.team === teamId)
    if (!row) continue
    acc.seasons += 1
    for (const k of ['played', 'won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst', 'points']) {
      acc[k] += row[k]
    }
    if (acc.best === null || row.position < acc.best) acc.best = row.position
    if (row.position === 1) acc.titles.push(season)
  }
  acc.goalDiff = acc.goalsFor - acc.goalsAgainst
  acc.winRate = acc.played ? Math.round((acc.won / acc.played) * 100) : 0
  return acc
}

/** Andamento posizione per stagione, per i grafici. */
export function positionHistory(teamId) {
  return seasons
    .map((season) => {
      const row = standings[season]?.find((r) => r.team === teamId)
      return row ? { season, position: row.position, points: row.points } : null
    })
    .filter(Boolean)
}
