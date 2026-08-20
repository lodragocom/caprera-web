/**
 * Formazioni giornata per giornata, dalla sezione "In campo" di Fantapazz.
 *
 * Dieci stagioni di formazioni fanno ~14 MB: troppo per il pacchetto del sito.
 * Qui viaggia solo l'indice (poche righe per stagione) e il file della singola
 * stagione si scarica quando serve, con `caricaStagione`.
 */
import indice from '../data/lineups-index.json'

const FILE = import.meta.glob('../data/lineups/*.json')

export const STAGIONI_FORMAZIONI = indice.stagioni.map((s) => s.stagione)
export const ULTIMA_STAGIONE = STAGIONI_FORMAZIONI[STAGIONI_FORMAZIONI.length - 1]

/** Righe di indice di una stagione: giornate, turni di coppa, societa'. */
export function indiceDi(stagione) {
  return indice.stagioni.find((s) => s.stagione === stagione) ?? null
}

/** Stagioni in cui una societa' ha giocato. */
export function stagioniDi(teamId) {
  return indice.stagioni.filter((s) => s.squadre.includes(teamId)).map((s) => s.stagione)
}

const cache = new Map()

/** Scarica (una volta sola) le formazioni di una stagione. */
export async function caricaStagione(stagione) {
  if (cache.has(stagione)) return cache.get(stagione)
  const carica = FILE[`../data/lineups/${stagione}.json`]
  if (!carica) return null
  const m = await carica()
  const dati = m.default ?? m
  cache.set(stagione, dati)
  return dati
}

/* Sigle per i bottoni dei turni di coppa: per esteso occupano quattro righe. */
const SIGLA = [
  ['Qualificazione Champions League', 'Qual. CL'],
  ['Qualificazione Champions', 'Qual. CL'],
  ['Champions League', 'CL'],
  ['Europa League', 'EL'],
  ['Conference League', 'ConfL'],
  ['Supercoppa Italiana', 'SC Italiana'],
  ['Supercoppa Europea', 'SC Europea'],
  ['Coppa Italia', 'Coppa Italia'],
]

function abbrevia(turno) {
  const [comp, ...resto] = turno.split(' - ')
  const sigla = SIGLA.find(([lungo]) => comp.startsWith(lungo))?.[1] ?? comp
  const fase = resto.join(' - ')
    .replace(/^Giornata\s*/, 'G')
    .replace(/Andata/, 'A')
    .replace(/Ritorno/, 'R')
    .replace(/^Finali$/, 'Finale')
    .replace(/Semifinali/, 'Semi')
  return fase ? `${sigla} · ${fase}` : sigla
}

/**
 * Tutti gli impegni di una societa' in una stagione, campionato e coppe, in
 * ordine: prima le 36 giornate, poi i turni di coppa. Ogni voce ha una chiave
 * con cui ritrovare la partita.
 */
export function impegniDi(dati, teamId) {
  if (!dati) return []
  const gioca = (p) => p.casa === teamId || p.fuori === teamId
  const out = dati.giornate
    .filter((g) => g.partite.some(gioca))
    .map((g) => ({ chiave: `g${g.giornata}`, breve: `${g.giornata}ª`, titolo: `${g.giornata}ª giornata`, coppa: false }))
  for (const t of dati.coppe ?? []) {
    if (t.partite.some(gioca)) {
      out.push({ chiave: `c${t.turno}`, breve: abbrevia(t.turno), titolo: t.turno, coppa: true })
    }
  }
  return out
}

/**
 * La partita di una societa' in una giornata o in un turno di coppa, gia'
 * orientata: `mia` e' sempre la formazione della societa' richiesta, `sua`
 * quella dell'avversario.
 */
export function partitaDi(dati, teamId, chiave) {
  const gioca = (x) => x.casa === teamId || x.fuori === teamId
  let p = null
  if (String(chiave).startsWith('c')) {
    const t = (dati?.coppe ?? []).find((x) => `c${x.turno}` === chiave)
    p = t?.partite.find(gioca) ?? null
  } else {
    const n = Number(String(chiave).replace('g', ''))
    const g = dati?.giornate.find((x) => x.giornata === n)
    p = g?.partite.find(gioca) ?? null
  }
  if (!p) return null
  const inCasa = p.casa === teamId
  return {
    inCasa,
    avversario: inCasa ? p.fuori : p.casa,
    gol: inCasa ? p.golCasa : p.golFuori,
    golSubiti: inCasa ? p.golFuori : p.golCasa,
    fp: inCasa ? p.fpCasa : p.fpFuori,
    fpAvversario: inCasa ? p.fpFuori : p.fpCasa,
    mia: p.lati[inCasa ? 0 : 1],
    sua: p.lati[inCasa ? 1 : 0],
  }
}

/**
 * Dispone gli undici sul campo: una riga per reparto, i giocatori distribuiti
 * a uguale distanza. Le percentuali sono coordinate dentro il campo, con la
 * porta difesa in basso e l'attacco in alto.
 */
export function disponi(titolari) {
  const y = { P: 92, D: 71, C: 46, A: 20 }
  const out = []
  for (const r of ['P', 'D', 'C', 'A']) {
    const gruppo = titolari.filter((g) => g.ruolo === r)
    gruppo.forEach((g, i) => {
      // i giocatori di un reparto si spartiscono la larghezza in parti uguali
      out.push({ ...g, x: ((i + 1) / (gruppo.length + 1)) * 100, y: y[r] })
    })
  }
  return out
}

/** Somma dei bonus di una formazione, per capire da dove vengono i fantapunti. */
export function contaBonus(lato) {
  const conta = new Map()
  for (const g of [...lato.titolari, ...lato.panchina]) {
    if (g.voto == null) continue
    for (const b of g.bonus) {
      const c = conta.get(b.id) ?? { ...b, n: 0 }
      c.n += 1
      conta.set(b.id, c)
    }
  }
  return [...conta.values()].sort((a, b) => b.n - a.n)
}

/** Chi ha giocato davvero: titolari con voto, piu' le riserve entrate. */
export function schierati(lato) {
  return {
    titolari: lato.titolari.filter((g) => g.voto != null),
    entrati: lato.panchina.filter((g) => g.entrato),
    assenti: lato.titolari.filter((g) => g.voto == null),
  }
}
