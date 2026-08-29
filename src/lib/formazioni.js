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
  /*
   * L'esito viaggia con l'impegno, e non costa niente: `partiteDi` legge gia'
   * gol e fantapunti di ogni gara, e prima li buttavamo via tenendo solo il
   * numero della giornata. Con l'esito attaccato, la striscia per scegliere la
   * giornata smette di essere un elenco di numeri e diventa l'andamento della
   * stagione - si naviga e si legge con lo stesso gesto.
   */
  const comune = (g) => ({
    esito: !g.giocata ? null
      : g.gol_fatti > g.gol_subiti ? 'V' : g.gol_fatti === g.gol_subiti ? 'N' : 'P',
    gol: g.gol_fatti, golSubiti: g.gol_subiti,
    fp: g.fantapunti, fpAvversario: g.fantapunti_avversario,
    avversario: g.avversario, inCasa: g.in_casa, giocata: g.giocata,
  })

  const out = []
  for (const g of gare ?? []) {
    if (g.competizione === 'campionato') {
      out.push({
        chiave: g.id, breve: `${g.giornata}ª`, titolo: `${g.giornata}ª giornata`,
        coppa: false, giornata: g.giornata, ...comune(g),
      })
    } else {
      const nome = turni.get(g.turno)
      out.push({
        chiave: g.id, breve: abbrevia(g.competizione, nome),
        titolo: `${g.competizione} · ${nome ?? ''}`.trim(), coppa: true, ...comune(g),
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
/*
 * Quanto si allarga una linea, secondo quanti sono.
 *
 * Dividere la larghezza in parti uguali - (i+1)/(n+1) - e' la cosa ovvia ed e'
 * sbagliata in due casi su cinque. Due punte a 33 e 67 stanno larghe come due
 * ali; quattro difensori a 20-40-60-80 tengono i terzini dentro al campo
 * invece che sulla fascia.
 *
 * Questi numeri vengono dalle tabelle di react-native-football-formation
 * (arbab-io, MIT), che per ventitre moduli scrive le coordinate a mano invece
 * di calcolarle. Guardandole tutte insieme la regola che ne esce e' sempre la
 * stessa, ed e' l'unica cosa che ho preso: **i due esterni vanno sulla fascia,
 * gli interni restano vicini**. Le loro coordinate no - sono indicizzate per
 * numero di maglia (1-11), che noi non abbiamo: sappiamo solo il ruolo.
 *
 * Le loro tabelle sono leggermente asimmetriche (una linea da cinque fa
 * 14-32-49-66-82); qui le ho rese simmetriche, perche' l'asimmetria non
 * significa niente e si vede.
 */
const LARGHEZZE = {
  1: [50],
  2: [36, 64],
  3: [25, 50, 75],
  4: [12, 37, 63, 88],
  5: [14, 32, 50, 68, 86],
}

function larghezze(n) {
  if (LARGHEZZE[n]) return LARGHEZZE[n]
  // oltre i cinque non capita, ma se capitasse meglio in parti uguali che nulla
  return Array.from({ length: n }, (_, i) => ((i + 1) / (n + 1)) * 100)
}

export function disponi(titolari, modulo) {
  const per = (r) => titolari.filter((g) => g.ruolo === r)
  const [P, D, C, A] = ['P', 'D', 'C', 'A'].map(per)

  /*
   * Le linee vengono dal modulo, non dai ruoli.
   *
   * Con i soli ruoli un 4-2-3-1 diventava quattro file - portiere, difesa,
   * **tutti** i centrocampisti in fila, attacco - e in campo si vedeva un
   * 4-5-1 che nessuno ha mai schierato. Il modulo dice come stavano davvero:
   * il primo numero e' la difesa, l'ultimo l'attacco, quelli in mezzo sono
   * le linee di centrocampo.
   *
   * Ma il modulo e' una stringa che arriva da Fantapazz, quindi si usa solo
   * se **torna con i giocatori che abbiamo**: se i conti non quadrano si
   * ricade sulle quattro file di prima, che sara' approssimativa ma non
   * inventa una disposizione.
   */
  const parti = String(modulo ?? '').split('-').map(Number)
    .filter((x) => Number.isFinite(x) && x > 0)
  const centrali = parti.slice(1, -1)
  const quadra = parti.length >= 3
    && parti[0] === D.length
    && parti[parti.length - 1] === A.length
    && centrali.reduce((a, b) => a + b, 0) === C.length

  let linee
  if (quadra) {
    const mid = []
    let i = 0
    for (const n of centrali) { mid.push(C.slice(i, i + n)); i += n }
    linee = [P, D, ...mid, A]
  } else {
    linee = [P, D, C, A]
  }
  linee = linee.filter((l) => l.length)

  /* Il portiere sta sulla sua riga; gli altri reparti si distribuiscono fra
     l'area e il limite dell'area avversaria. */
  const fuori = linee.slice(1)
  const out = []
  linee.forEach((gruppo, k) => {
    const y = k === 0 ? 88
      : fuori.length === 1 ? 45
      : 70 - ((k - 1) * (70 - 12)) / (fuori.length - 1)
    const x = larghezze(gruppo.length)
    gruppo.forEach((g, i) => out.push({ ...g, x: x[i], y }))
  })
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
