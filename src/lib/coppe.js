/**
 * La logica delle coppe: leggere un tabellone, decidere chi passa, capire
 * dove si e' fermata una societa'.
 *
 * Qui dentro non ci sono dati. Le funzioni ricevono le coppe da fuori - oggi
 * dal database, ieri da cups.json - e restituiscono un verdetto. E' quello
 * che le rende verificabili: le abbiamo controllate su 160 sfide e 34 finali
 * di dieci stagioni, e nessuna di quelle verifiche dipende da dove stavano
 * i dati.
 *
 * Come si decide chi passa in una sfida di andata e ritorno il regolamento
 * non lo scrive. Sommando le due gare e ordinando per gol, fantapunti, gol in trasferta si
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

const FERMATA = {
  'Finale': 'Finalista',
  'Semifinali': 'Eliminata in semifinale',
  'Quarti di finale': 'Eliminata ai quarti',
  'Ottavi di finale': 'Eliminata agli ottavi',
}

/**
 * Lo stesso calcolo, ma su coppe passate da fuori.
 *
 * Serve perche' i dati adesso arrivano dal database e non piu' da cups.json,
 * e il conto e' identico: cambia solo chi porta le carte in tavola. La logica
 * resta una sola - due copie che col tempo si scostano sono il modo piu'
 * sicuro per avere due verita' diverse sulla stessa coppa.
 */
export function percorsoFra(teamId, coppe) {
  const out = []

  for (const c of coppe ?? []) {
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
