/**
 * Le formazioni, dal database.
 *
 * Prima erano quindici megabyte di file, un JSON per stagione, che il sito si
 * scaricava interi per mostrare una giornata sola. Adesso si chiede la singola
 * partita che si sta guardando e le altre 2.474 restano dove sono.
 *
 * Le funzioni che dispongono i giocatori sul campo e contano i bonus non sono
 * cambiate: quelle non hanno mai avuto niente a che fare con dove stavano i
 * dati.
 */
import { supabase } from './supabase'
import { partiteDi, formazioniPartita, bonusTipi } from './archivio'

/* Sigle per i bottoni dei turni di coppa: per esteso occupano quattro righe. */
const SIGLA = {
  'coppa-italia': 'Coppa Italia',
  'qualificazione-champions': 'Qual. CL',
  champions: 'CL',
  'europa-league': 'EL',
  'conference-league': 'ConfL',
  'supercoppa-italiana': 'SC Italiana',
  'supercoppa-europea': 'SC Europea',
}

function abbrevia(competizione, turno) {
  const sigla = SIGLA[competizione] ?? competizione
  const fase = (turno ?? '')
    .replace(/^Giornata\s*/, 'G')
    .replace(/Andata/, 'A')
    .replace(/Ritorno/, 'R')
    .replace(/^Finali$/, 'Finale')
    .replace(/Semifinali/, 'Semi')
  return fase ? `${sigla} · ${fase}` : sigla
}

/** Le stagioni in cui una societa' ha giocato. */
export async function stagioniDi(teamId) {
  const { data, error } = await supabase.from('v_gare')
    .select('stagione').eq('societa', teamId).eq('competizione', 'campionato')
  if (error) throw new Error(error.message)
  return [...new Set((data ?? []).map((r) => r.stagione))].sort()
}

/**
 * Tutti gli impegni di una societa' in una stagione, campionato e coppe.
 * Ogni voce porta con se' l'id della partita: e' quello che poi si chiede.
 */
export async function impegniDi(teamId, stagione) {
  const [gare, turni] = await Promise.all([
    partiteDi(stagione, teamId),
    (async () => {
      const { data, error } = await supabase.from('turni').select('id, nome')
      if (error) throw new Error(error.message)
      return new Map((data ?? []).map((t) => [t.id, t.nome]))
    })(),
  ])
  const out = []
  for (const g of gare ?? []) {
    if (g.competizione === 'campionato') {
      out.push({
        chiave: g.id, breve: `${g.giornata}ª`, titolo: `${g.giornata}ª giornata`,
        coppa: false, giornata: g.giornata,
      })
    } else {
      const nome = turni.get(g.turno)
      out.push({
        chiave: g.id, breve: abbrevia(g.competizione, nome),
        titolo: `${g.competizione} · ${nome ?? ''}`.trim(), coppa: true,
      })
    }
  }
  return out.sort((a, b) =>
    Number(a.coppa) - Number(b.coppa) || (a.giornata ?? 0) - (b.giornata ?? 0))
}

/**
 * La partita, gia' orientata: `mia` e' sempre la formazione della societa'
 * richiesta, `sua` quella dell'avversario.
 */
export async function partitaDi(partitaId, teamId, stagione) {
  const [lati, gare, nomiBonus] = await Promise.all([
    formazioniPartita(partitaId),
    partiteDi(stagione, teamId),
    bonusTipi(),
  ])
  const g = (gare ?? []).find((x) => x.id === partitaId)
  if (!g) return null
  const nomi = new Map((nomiBonus ?? []).map((b) => [b.id, b.nome]))
  const vesti = (lato) => lato && {
    ...lato,
    titolari: lato.titolari.map((x) => vestiGiocatore(x, nomi)),
    panchina: lato.panchina.map((x) => vestiGiocatore(x, nomi)),
  }
  const mia = vesti(lati.find((l) => l.societa === teamId))
  const sua = vesti(lati.find((l) => l.societa !== teamId))
  if (!mia) return null
  return {
    inCasa: g.in_casa,
    avversario: g.avversario,
    gol: g.gol_fatti,
    golSubiti: g.gol_subiti,
    fp: Number(g.fantapunti),
    fpAvversario: Number(g.fantapunti_avversario),
    mia, sua,
  }
}

function vestiGiocatore(g, nomi) {
  return {
    ...g,
    voto: g.voto == null ? null : Number(g.voto),
    bonus: (g.bonus ?? []).map((b) => ({ id: b.id, nome: nomi.get(b.id) ?? b.id })),
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
