import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import { useArchivio, tuttePartite, tutteLeRose, classificaPerpetua } from '../lib/archivio'
import { Pagina, Sezione, CorpoTabella, Riga, Cascata, Voce } from '../components/moto'
import './Stats.css'

/** Presenze minime perché una fantamedia voglia dire qualcosa. */
const PRESENZE_MINIME = 20

/** Le rose portano la lettera; una scheda-record ha spazio per la parola. */
const RUOLO = { P: 'portiere', D: 'difensore', C: 'centrocampista', A: 'attaccante' }

/**
 * Tutti i record, calcolati dai risultati e dalle rose.
 *
 * `soloStagione` restringe il calcolo a un anno: i record diventano i record
 * di quella stagione. Sono gli stessi dati già in memoria, filtrati — non una
 * seconda lettura dal database.
 *
 * Ogni record può non esistere: una stagione senza fantamedie registrate non
 * ha un miglior marcatore, e la pagina deve dirlo invece di inventarne uno.
 * Per questo si torna `null` e non uno zero.
 */
function calcola(partite, rose, soloStagione) {
  const dentro = (s) => !soloStagione || s === soloStagione

  const matches = (partite ?? [])
    .filter((p) => dentro(p.stagione))
    .map((p) => ({
      season: p.stagione, round: p.giornata, home: p.casa, away: p.fuori,
      homeGoals: p.gol_casa, awayGoals: p.gol_fuori,
      homeFp: Number(p.fp_casa), awayFp: Number(p.fp_fuori), played: p.giocata,
    }))
  const rosters = (rose ?? [])
    .filter((r) => dentro(r.stagione))
    .map((r) => ({
      season: r.stagione, team: r.societa, player: r.nome, role: r.ruolo,
      club: r.club, cost: r.costo, apps: r.presenze,
      mv: r.mv == null ? null : Number(r.mv), fm: r.fm == null ? null : Number(r.fm),
    }))

  const giocate = matches.filter((m) => m.played)

  let piuLarga = null
  let piuGol = null
  let miglioreFp = null
  let peggioreFp = null

  for (const m of giocate) {
    const scarto = Math.abs(m.homeGoals - m.awayGoals)
    const tot = m.homeGoals + m.awayGoals
    if (!piuLarga || scarto > piuLarga.scarto) piuLarga = { ...m, scarto }
    if (!piuGol || tot > piuGol.tot) piuGol = { ...m, tot }
    for (const lato of ['home', 'away']) {
      const fp = m[`${lato}Fp`]
      if (fp == null || Number.isNaN(fp)) continue
      const rec = { season: m.season, round: m.round, team: m[lato], fp }
      if (!miglioreFp || fp > miglioreFp.fp) miglioreFp = rec
      if (!peggioreFp || fp < peggioreFp.fp) peggioreFp = rec
    }
  }

  /* Striscia di vittorie più lunga. Dentro una stagione sola è la striscia di
     quell'anno; su tutte, attraversa le stagioni come è giusto che faccia. */
  const perSquadra = new Map()
  for (const m of giocate) {
    for (const [lato, opp] of [['home', 'away'], ['away', 'home']]) {
      const id = m[lato]
      if (!id) continue
      if (!perSquadra.has(id)) perSquadra.set(id, [])
      perSquadra.get(id).push({
        season: m.season, round: m.round,
        vinta: m[`${lato}Goals`] > m[`${opp}Goals`],
      })
    }
  }
  let striscia = null
  for (const [id, lista] of perSquadra) {
    lista.sort((a, b) => a.season.localeCompare(b.season) || a.round - b.round)
    let cur = 0
    for (const p of lista) {
      cur = p.vinta ? cur + 1 : 0
      if (cur > (striscia?.n ?? 0)) striscia = { team: id, n: cur, season: p.season }
    }
  }

  const conCosto = rosters.filter((r) => r.cost != null)
  const caro = conCosto.length
    ? conCosto.reduce((max, r) => (r.cost > max.cost ? r : max))
    : null

  const fm = rosters
    .filter((r) => r.fm != null && (r.apps ?? 0) >= PRESENZE_MINIME)
    .sort((a, b) => b.fm - a.fm)[0] ?? null

  /* Il grafico: media gol a partita e fantapunti medi di squadra, che sono
     la stessa storia vista dai due lati. Sempre su tutte le stagioni: è una
     serie storica, restringerla a un anno la annullerebbe. */
  const tutte = (partite ?? []).filter((p) => p.giocata)
  const anni = [...new Set(tutte.map((p) => p.stagione))].sort()
  const golStagione = anni.map((s) => {
    const ms = tutte.filter((p) => p.stagione === s)
    const gol = ms.reduce((n, p) => n + p.gol_casa + p.gol_fuori, 0)
    const fp = ms.reduce((n, p) => n + Number(p.fp_casa) + Number(p.fp_fuori), 0)
    return {
      season: s,
      gol,
      media: +(gol / ms.length).toFixed(2),
      fp: +(fp / (ms.length * 2)).toFixed(1),
    }
  })

  return { piuLarga, piuGol, miglioreFp, peggioreFp, striscia, caro, fm,
           golStagione, giocate: giocate.length }
}

export default function Stats() {
  const [quando, setQuando] = useState('')      // '' = di sempre
  const [ordine, setOrdine] = useState({ k: 'points', giu: true })

  const pa = useArchivio('tuttePartite', tuttePartite)
  const ro = useArchivio('tutteLeRose', tutteLeRose)
  const cl = useArchivio('perpetua', classificaPerpetua)

  const anni = useMemo(
    () => [...new Set((pa.dati ?? []).map((p) => p.stagione))].sort().reverse(),
    [pa.dati]
  )
  const r = useMemo(() => calcola(pa.dati, ro.dati, quando), [pa.dati, ro.dati, quando])

  const pronto = pa.dati && ro.dati
  const stato = pa.errore ? pa : ro.errore ? ro : { ...pa, caricamento: !pronto }

  const periodo = quando || 'di sempre'

  if (!pronto) {
    return (
      <Pagina className="page container wide st">
        <header className="page-head">
          <p className="eyebrow">Archivio</p>
          <h1>Record e statistiche</h1>
        </header>
        <Sezione stato={stato} righe={8}><span /></Sezione>
      </Pagina>
    )
  }

  const gap = r.golStagione.length
    ? { min: Math.min(...r.golStagione.map((g) => g.media)),
        max: Math.max(...r.golStagione.map((g) => g.media)) }
    : { min: 0, max: 1 }
  /* La barra parte da chi ne ha fatti meno: da zero, 2,65 e 3,53 sarebbero
     due barre lunghe uguali e il grafico non direbbe niente. */
  const largo = (v) => 6 + (gap.max === gap.min ? 94
    : ((v - gap.min) / (gap.max - gap.min)) * 94)

  return (
    <Pagina className="page container wide st">
      <header className="st-testa">
        <div>
          <p className="eyebrow">Archivio</p>
          <h1>Record e statistiche</h1>
        </div>
        <label className="st-quando">
          <span>Periodo</span>
          <select value={quando} onChange={(e) => setQuando(e.target.value)}>
            <option value="">Di sempre</option>
            {anni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </header>

      <p className="lede">
        {quando
          ? <>Stagione {quando}, {r.giocate} partite giocate. </>
          : <>Dieci stagioni, {r.giocate.toLocaleString('it-IT')} partite giocate. </>}
        Tutto quello che segue è calcolato dai risultati, non inserito a mano.
      </p>

      <section className="block">
        <h2 className="section-title">I record {periodo}</h2>
        <Cascata className="record-grid" tetto={8}>
          <Voce><Record
            titolo="Vittoria più larga"
            r={r.piuLarga}
            valore={(m) => `${m.homeGoals}–${m.awayGoals}`}
            dettaglio={(m) => (
              <><TeamBadge id={m.home} size="sm" label="short" />
                <em>contro</em>
                <TeamBadge id={m.away} size="sm" label="short" /></>
            )}
            nota={(m) => `${m.season} · ${m.round}ª giornata`}
          /></Voce>
          <Voce><Record
            titolo="Partita con più gol"
            r={r.piuGol}
            valore={(m) => `${m.homeGoals}–${m.awayGoals}`}
            dettaglio={(m) => (
              <><TeamBadge id={m.home} size="sm" label="short" />
                <em>contro</em>
                <TeamBadge id={m.away} size="sm" label="short" /></>
            )}
            nota={(m) => `${m.season} · ${m.round}ª giornata`}
          /></Voce>
          <Voce><Record
            titolo="Miglior punteggio"
            r={r.miglioreFp}
            valore={(m) => m.fp.toFixed(1)}
            dettaglio={(m) => <TeamBadge id={m.team} size="sm" />}
            nota={(m) => `${m.season} · ${m.round}ª giornata`}
          /></Voce>
          <Voce><Record
            titolo="Peggior punteggio"
            r={r.peggioreFp}
            valore={(m) => m.fp.toFixed(1)}
            dettaglio={(m) => <TeamBadge id={m.team} size="sm" />}
            nota={(m) => `${m.season} · ${m.round}ª giornata`}
          /></Voce>
          <Voce><Record
            titolo="Striscia di vittorie"
            r={r.striscia}
            valore={(m) => m.n}
            dettaglio={(m) => <TeamBadge id={m.team} size="sm" />}
            nota={(m) => `conclusa nel ${m.season}`}
          /></Voce>
          <Voce><Record
            titolo="Acquisto più caro"
            r={r.caro}
            valore={(m) => m.cost}
            dettaglio={(m) => (
              <><span className="nome-rec">{m.player}</span>
                <TeamBadge id={m.team} size="sm" label="short" /></>
            )}
            nota={(m) => [m.season, RUOLO[m.role]].filter(Boolean).join(' · ')}
            manca="Le rose di questa stagione non hanno i costi."
          /></Voce>
          <Voce><Record
            titolo="Miglior fantamedia"
            r={r.fm}
            valore={(m) => m.fm.toFixed(2)}
            dettaglio={(m) => (
              <><span className="nome-rec">{m.player}</span>
                <TeamBadge id={m.team} size="sm" label="short" /></>
            )}
            nota={(m) => `${m.season} · ${m.apps} presenze`}
            manca={`Nessun calciatore con almeno ${PRESENZE_MINIME} presenze e una fantamedia registrata.`}
          /></Voce>
        </Cascata>
      </section>

      <section className="block">
        <h2 className="section-title">Gol per stagione</h2>
        <p className="lede">
          Media gol a partita, e accanto i fantapunti medi di una squadra in una
          giornata. Il gradino del 2020-21 è il cambio della scala: da quell'anno
          un gol in più costa quattro fantapunti invece di sei, e gli stessi
          punteggi si traducono in più gol. I fantapunti, intanto, sono saliti
          appena.
        </p>
        <div className="barre">
          {r.golStagione.map((g) => (
            <div key={g.season}
                 className={`barra-riga ${g.season === quando ? 'segnata' : ''}`}>
              <button type="button" className="s-lab num"
                      onClick={() => setQuando(quando === g.season ? '' : g.season)}>
                {g.season}
              </button>
              <span className="barra">
                <i style={{ width: `${largo(g.media)}%` }} />
              </span>
              <span className="num s-val">{g.media.toFixed(2)}</span>
              <span className="num s-fp">{g.fp} fp</span>
              <span className="num s-tot muted">{g.gol} gol</span>
            </div>
          ))}
        </div>
        <p className="st-nota">
          La scala è cambiata tre volte in dieci anni; le versioni prima del
          2025-26 sono ricostruite dai risultati, non lette dal regolamento.
          Tocca una stagione per portare i record qui sopra su quell'anno.
        </p>
      </section>

      <section className="block">
        <h2 className="section-title">Miglior stagione di ogni società</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">Società</th>
                <th className="left">Stagione</th>
                <Col k="position" o={ordine} v={setOrdine}>Pos.</Col>
                <Col k="points" o={ordine} v={setOrdine}>Punti</Col>
                <Col k="goalsFor" o={ordine} v={setOrdine}>GF</Col>
                <Col k="goalsAgainst" o={ordine} v={setOrdine}>GS</Col>
                <Col k="goalDiff" o={ordine} v={setOrdine}>DR</Col>
              </tr>
            </thead>
            <CorpoTabella>
              {ordina(migliori(cl.dati), ordine).map((m) => (
                <Riga key={m.team}>
                  <td className="left"><TeamBadge id={m.team} size="sm" /></td>
                  <td className="left num season-cell">{m.season}</td>
                  <td className="num">{m.position}º</td>
                  <td className="num strong">{m.points}</td>
                  <td className="num muted">{m.goalsFor}</td>
                  <td className="num muted">{m.goalsAgainst}</td>
                  <td className={`num ${m.goalDiff > 0 ? 'su' : m.goalDiff < 0 ? 'giu' : ''}`}>
                    {m.goalDiff > 0 ? `+${m.goalDiff}` : m.goalDiff}
                  </td>
                </Riga>
              ))}
            </CorpoTabella>
          </table>
        </div>
      </section>
    </Pagina>
  )
}

/**
 * La miglior stagione di ogni società.
 *
 * `goalDiff` prima non veniva calcolata mai: la tabella aveva una colonna DR
 * che leggeva un campo inesistente e mostrava una cella vuota su ogni riga.
 */
function migliori(classifica) {
  const best = new Map()
  for (const r of classifica ?? []) {
    const row = {
      team: r.societa, points: r.punti, position: r.posizione,
      played: r.giocate, goalsFor: r.gol_fatti, goalsAgainst: r.gol_subiti,
      goalDiff: (r.gol_fatti ?? 0) - (r.gol_subiti ?? 0),
      season: r.stagione,
    }
    const cur = best.get(row.team)
    if (!cur || row.points > cur.points) best.set(row.team, row)
  }
  return [...best.values()]
}

function ordina(righe, { k, giu }) {
  return [...righe].sort((a, b) => (giu ? b[k] - a[k] : a[k] - b[k]))
}

function Col({ k, o, v, children }) {
  const attiva = o.k === k
  return (
    <th>
      <button type="button" className={`ord ${attiva ? 'on' : ''}`}
              onClick={() => v({ k, giu: attiva ? !o.giu : true })}>
        {children}{attiva && <i>{o.giu ? '▾' : '▴'}</i>}
      </button>
    </th>
  )
}

/**
 * Una scheda-record.
 *
 * `r` può essere `null`: succede scegliendo una stagione che quel record non
 * ce l'ha — le rose 2025-26, per esempio, hanno i costi ma non le fantamedie.
 * In quel caso la scheda dice cosa manca. Non mostra uno zero: uno zero è una
 * risposta, e qui la risposta non c'è.
 */
function Record({ titolo, r, valore, dettaglio, nota, manca }) {
  if (!r) {
    return (
      <div className="record card vuoto">
        <span className="r-tit">{titolo}</span>
        <p className="r-manca">{manca ?? 'Non ci sono dati per questo periodo.'}</p>
      </div>
    )
  }
  return (
    <div className="record card">
      <span className="r-tit">{titolo}</span>
      <strong className="r-val num">{valore(r)}</strong>
      <div className="r-det">{dettaglio(r)}</div>
      <span className="r-nota num">{nota(r)}</span>
    </div>
  )
}
