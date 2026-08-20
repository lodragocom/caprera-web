/**
 * Coppe e supercoppe: tabelloni e albo d'oro di tutte le stagioni.
 *
 * Modulo a se' stante e non dentro data.js: cosi' l'Albo d'oro puo' mostrare
 * i trofei senza trascinarsi dietro calendario e rose storiche.
 */
import cups from '../data/cups.json'

export const STAGIONE_COPPE = cups.stagione
export const CAMPIONE = cups.campione
export const COPPE_STAGIONE = cups.coppe
export const COPPE_DA_CHIARIRE = cups.daChiarire
export const STAGIONI = cups.stagioni.map((s) => s.stagione).reverse()

export default cups

/** Tutte le coppe di una stagione. */
export function stagioneCoppe(stagione) {
  return cups.stagioni.find((s) => s.stagione === stagione) ?? null
}

/** Tabellone di una coppa in una stagione, o null. */
export function cupOf(id, stagione = STAGIONE_COPPE) {
  return stagioneCoppe(stagione)?.coppe.find((c) => c.id === id) ?? null
}

/** Albo d'oro di una competizione, dalla stagione piu' recente. */
export function alboDi(id) {
  return [...(cups.albo[id] ?? [])].reverse()
}

/** Competizioni che hanno almeno un vincitore in archivio. */
export const COMPETIZIONI = Object.keys(cups.albo)

/**
 * Trofei di una societa': coppe vinte piu' i campionati.
 * Ordinati dal piu' recente, cosi' la bacheca racconta la storia a ritroso.
 */
export function trofeiDi(teamId) {
  const out = []
  for (const s of cups.stagioni) {
    if (s.campione === teamId) {
      out.push({ id: 'campionato', nome: 'Lega Caprera', stagione: s.stagione })
    }
    for (const c of s.coppe) {
      if (c.vincitore === teamId) {
        out.push({ id: c.id, nome: c.nome, stagione: s.stagione,
                   aiFantapunti: c.aiFantapunti })
      }
    }
  }
  return out.reverse()
}

/**
 * Le competizioni giocate in una stagione, oltre al campionato.
 * Ordinate come nel regolamento, con il nome per esteso.
 */
export function competizioniDi(stagione) {
  return (stagioneCoppe(stagione)?.coppe ?? [])
    .filter((c) => c.turni.length)
    .map((c) => ({ id: c.id, nome: c.nome }))
}

/**
 * I turni di una coppa, gia' filtrati per societa'.
 * Ogni turno diventa un blocco con il suo nome e le sue partite, nello stesso
 * formato delle giornate di campionato, cosi' la pagina Risultati li puo'
 * mostrare senza sapere che sono coppe.
 */
export function turniDi(id, stagione, teamId = null) {
  const c = cupOf(id, stagione)
  if (!c) return []
  return c.turni
    .map((t) => ({
      titolo: t.turno,
      partite: t.partite
        .filter((p) => !teamId || p.casa === teamId || p.fuori === teamId)
        .map((p) => ({
          home: p.casa, away: p.fuori,
          homeGoals: p.golCasa, awayGoals: p.golFuori,
          homeFp: p.fpCasa, awayFp: p.fpFuori,
          played: true,
        })),
    }))
    .filter((t) => t.partite.length)
}

/* ----------------------------------------------------------- tabelloni */

/*
 * Come si decide chi passa il turno.
 *
 * Gara secca: gol, poi fantapunti (regolamento, criteri di parita').
 * Andata e ritorno: il regolamento non lo scrive, ma i dati lo dicono da soli.
 * Sommando le due gare e ordinando per gol, fantapunti, gol in trasferta si
 * ritrovano *tutti* e 32 gli accoppiamenti di andata e ritorno di dieci
 * stagioni: la squadra calcolata e' sempre quella che compare nel turno
 * successivo. I gol in trasferta servono due volte sole, nella Coppa Italia
 * 2018-19, dove quarti e semifinale finiscono pari anche nei fantapunti.
 */
const CRITERI = ['gol', 'fantapunti', 'gol in trasferta']

const TITOLO = {
  Quarti: 'Quarti di finale',
  Semifinali: 'Semifinali',
  Finali: 'Finale',
}

/** Somma le gare di una sfida e dice chi passa, e per quale criterio. */
function esito(legs) {
  const t = {}
  const somma = (id, gol, fp, inTrasferta) => {
    const e = (t[id] ??= [0, 0, 0])
    e[0] += gol
    e[1] += fp
    if (inTrasferta) e[2] += gol
  }
  for (const p of legs) {
    somma(p.casa, p.golCasa, p.fpCasa, false)
    somma(p.fuori, p.golFuori, p.fpFuori, true)
  }
  const [[a, va], [b, vb]] = Object.entries(t)
  for (let i = 0; i < CRITERI.length; i += 1) {
    if (va[i] !== vb[i]) {
      return { vincente: va[i] > vb[i] ? a : b, come: i ? CRITERI[i] : null,
               aggregato: [va[0], vb[0]], squadre: [a, b] }
    }
  }
  return { vincente: null, come: null, aggregato: [va[0], vb[0]], squadre: [a, b] }
}

/**
 * Il tabellone di una coppa, turno per turno, con la vincente sempre indicata.
 *
 * Andata e ritorno diventano un turno solo, con le due gare una sotto l'altra
 * e il verdetto in fondo: e' cosi' che si legge un tabellone, non due elenchi
 * separati in cui bisogna ricordarsi il risultato dell'andata.
 *
 * Nei gironi (Giornata 1, 2, ...) il pareggio resta un pareggio: nessuno
 * "passa", quindi non si indica nessuna vincente.
 */
const NOMI_KO = ['Finale', 'Semifinali', 'Quarti di finale', 'Ottavi di finale']

/*
 * Le prime due stagioni Fantapazz non aveva i tabelloni: Champions ed Europa
 * League sono registrate come "Giornata 1..4", ma quattro squadre in quattro
 * giornate sono semifinali e finale di andata e ritorno, non un girone.
 * Riletto cosi', il vincitore calcolato coincide con quello in archivio in
 * tutti e quattro i casi (2016-17 e 2017-18, Champions ed Europa).
 */
function tabelloneAGiornate(coppa) {
  const t = coppa.turni
  const coppie = Math.floor(t.length / 2)
  const out = []
  for (let i = 0; i < coppie; i += 1) {
    const [a, b] = [t[2 * i], t[2 * i + 1]]
    const sfide = a.partite.map((p) => {
      const legs = [p, ...b.partite.filter((r) => (r.casa === p.fuori && r.fuori === p.casa)
        || (r.casa === p.casa && r.fuori === p.fuori))]
      return { legs, ...esito(legs), andataRitorno: legs.length > 1 }
    })
    out.push({ titolo: NOMI_KO[coppie - 1 - i] ?? `Turno ${i + 1}`, sfide })
  }
  return out
}

export function tabelloneDi(coppa) {
  if (!coppa?.turni?.length) return []
  const fatti = new Set()
  const out = []

  const soloGiornate = coppa.turni.every((t) => /^Giornata/.test(t.turno.trim()))
  if (soloGiornate && coppa.vincitore) {
    const turni = tabelloneAGiornate(coppa)
    const ultimo = turni[turni.length - 1]
    if (ultimo && coppa.finalista) {
      const i = ultimo.sfide.findIndex((s) => {
        const q = new Set(s.squadre)
        return q.has(coppa.vincitore) && q.has(coppa.finalista)
      })
      if (i >= 0) {
        ultimo.sfide[i].vincente = coppa.vincitore
        if (coppa.aiFantapunti) ultimo.sfide[i].come = 'fantapunti'
        const [f] = ultimo.sfide.splice(i, 1)
        const resto = ultimo.sfide
        ultimo.sfide = [f]
        if (resto.length) turni.push({ titolo: 'Finale 3º/4º posto', sfide: resto, consolazione: true })
      }
    }
    return turni
  }

  for (const t of coppa.turni) {
    if (fatti.has(t.turno)) continue
    const nome = t.turno.trim()

    // gironi: ogni giornata e' un blocco di partite, senza eliminazione
    if (/^Giornata/.test(nome)) {
      out.push({
        titolo: nome,
        girone: true,
        sfide: t.partite.map((p) => ({
          legs: [p],
          squadre: [p.casa, p.fuori],
          vincente: p.golCasa === p.golFuori ? null : (p.golCasa > p.golFuori ? p.casa : p.fuori),
        })),
      })
      continue
    }

    // andata e ritorno: si uniscono in un turno solo
    let legsDi = (p) => [p]
    let base = nome
    if (nome.endsWith(' Andata')) {
      base = nome.slice(0, -' Andata'.length)
      const rit = coppa.turni.find((x) => x.turno.trim() === `${base} Ritorno`)
      if (rit) {
        fatti.add(rit.turno)
        legsDi = (p) => [p, ...rit.partite.filter(
          (r) => (r.casa === p.fuori && r.fuori === p.casa) || (r.casa === p.casa && r.fuori === p.fuori))]
      }
    }

    const sfide = t.partite.map((p) => {
      const legs = legsDi(p)
      const e = esito(legs)
      return { legs, ...e, andataRitorno: legs.length > 1 }
    })

    // la finale: il vincitore lo dice l'archivio, che applica gia' la regola
    // dei fantapunti in gara secca. Se il turno ha due partite, la seconda e'
    // la finale per il terzo posto.
    const finale = /^Finali/.test(base)
    if (finale && coppa.vincitore && coppa.finalista) {
      const idx = sfide.findIndex((s) => {
        const q = new Set(s.squadre)
        return q.has(coppa.vincitore) && q.has(coppa.finalista)
      })
      if (idx >= 0) {
        sfide[idx].vincente = coppa.vincitore
        if (coppa.aiFantapunti) sfide[idx].come = 'fantapunti'
        const [f] = sfide.splice(idx, 1)
        out.push({ titolo: TITOLO[base] ?? base, sfide: [f] })
        if (sfide.length) out.push({ titolo: 'Finale 3º/4º posto', sfide, consolazione: true })
        continue
      }
    }

    out.push({ titolo: TITOLO[base] ?? base, sfide })
  }
  return out
}

/**
 * Albo d'oro di una competizione, gia' pronto da leggere: i vincitori dal piu'
 * recente, quante edizioni sono state giocate e chi ne ha vinte di piu'.
 */
export function alboLeggibile(id) {
  const righe = alboDi(id)
  const conta = new Map()
  for (const r of righe) conta.set(r.vincitore, (conta.get(r.vincitore) ?? 0) + 1)
  const ordinati = [...conta.entries()].sort((a, b) => b[1] - a[1])
  const massimo = ordinati[0]?.[1] ?? 0
  return {
    righe,
    edizioni: righe.length,
    // puo' esserci un ex aequo in testa
    recordman: ordinati.filter(([, n]) => n === massimo && n > 1).map(([team, n]) => ({ team, n })),
  }
}

/* ------------------------------------------- il percorso di una societa' */

/*
 * Sulle "finaline". Nel turno finale Fantapazz registra due partite: la finale
 * vera e quella fra le due perdenti delle semifinali. Il regolamento Caprera
 * non prevede una finale per il terzo posto - le semifinaliste eliminate di
 * Champions ed Europa League vanno in Conference League (§6) - quindi quella
 * seconda gara qui si mostra ma non conta: chi perde la semifinale risulta
 * "eliminata in semifinale", non "quarta". DA CHIARIRE con la Presidenza.
 */

/* Come si dice "e' arrivata fin qui e li' si e' fermata". */
const FERMATA = {
  'Finale': 'Finalista',
  'Semifinali': 'Eliminata in semifinale',
  'Quarti di finale': 'Eliminata ai quarti',
  'Ottavi di finale': 'Eliminata agli ottavi',
}

/**
 * Il cammino di una societa' in tutte le coppe di una stagione: dove e'
 * arrivata e le gare che ha giocato, turno per turno.
 *
 * Restituisce solo le competizioni a cui ha effettivamente partecipato, cosi'
 * chi non si e' qualificato in Champions non se la ritrova in scheda vuota.
 */
export function percorsoDi(teamId, stagione) {
  const s = stagioneCoppe(stagione)
  if (!s) return []
  const out = []

  for (const c of s.coppe) {
    // la Classifica Fantapunti non e' un tabellone ma una graduatoria
    if (c.classifica) {
      const i = c.classifica.findIndex((r) => r.team === teamId)
      if (i < 0) continue
      out.push({
        id: c.id, nome: c.nome, tipo: 'classifica', turni: [],
        vinta: i === 0, esito: `${i + 1}ª su ${c.classifica.length}`,
        dettaglio: `${c.classifica[i].fantapunti.toLocaleString('it-IT')} fantapunti`,
      })
      continue
    }

    const turni = tabelloneDi(c)
      .map((t) => ({ ...t, sfide: t.sfide.filter((x) => x.squadre?.includes(teamId)) }))
      .filter((t) => t.sfide.length)
    if (!turni.length) continue

    const girone = turni.every((t) => t.girone)
    // la gara fra le due perdenti delle semifinali non elimina nessuno: chi si
    // ferma, si ferma in semifinale. Vedi la nota sotto sulle "finaline".
    const veri = turni.filter((t) => !t.consolazione)
    const ultimo = (veri.length ? veri : turni)[(veri.length ? veri : turni).length - 1]

    let esito
    if (c.vincitore === teamId) esito = 'Vincitrice'
    else if (c.finalista === teamId) esito = 'Finalista'
    else if (girone) esito = 'Fase a gironi'
    else esito = FERMATA[ultimo.titolo] ?? `Fuori: ${ultimo.titolo}`

    out.push({
      id: c.id, nome: c.nome, tipo: girone ? 'girone' : 'coppa', turni,
      vinta: c.vincitore === teamId, esito,
      dettaglio: girone ? `${turni.length} giornate` : null,
    })
  }
  return out
}

/* Sigle brevi: nelle liste fitte "Qualificazione Champions League" non ci sta. */
const SIGLA = {
  'coppa-italia': 'C.Italia',
  champions: 'CL',
  'europa-league': 'EL',
  'conference-league': 'ConfL',
  'supercoppa-italiana': 'SC It.',
  'supercoppa-europea': 'SC Eu.',
  'qualificazione-champions': 'Qual.CL',
  fantapunti: 'FP',
}

export function siglaCoppa(id) {
  return SIGLA[id] ?? id
}

/**
 * Tutte le gare di coppa di una societa' in una stagione, in fila, ciascuna
 * con la competizione e il turno. Serve dove le partite si mostrano di
 * seguito, senza la struttura del tabellone.
 */
export function gareCoppaDi(teamId, stagione) {
  const out = []
  for (const c of percorsoDi(teamId, stagione)) {
    for (const t of c.turni) {
      for (const s of t.sfide) {
        for (const p of s.legs) {
          out.push({ competizione: c.nome, competizioneId: c.id, turno: t.titolo, ...p })
        }
      }
    }
  }
  return out
}

/** Stagioni in cui una societa' compare in almeno una coppa. */
export function stagioniCoppeDi(teamId) {
  return cups.stagioni
    .filter((s) => s.coppe.some((c) => (c.classifica ?? []).some((r) => r.team === teamId)
      || (c.turni ?? []).some((t) => t.partite.some((p) => p.casa === teamId || p.fuori === teamId))))
    .map((s) => s.stagione)
    .reverse()
}

/** Quante volte ogni societa' ha vinto ciascuna competizione. */
export function bachecaTrofei(teamId) {
  const conta = new Map()
  for (const t of trofeiDi(teamId)) {
    const c = conta.get(t.id) ?? { id: t.id, nome: t.nome, n: 0, stagioni: [] }
    c.n += 1
    c.stagioni.push(t.stagione)
    conta.set(t.id, c)
  }
  return [...conta.values()].sort((a, b) => b.n - a.n)
}
