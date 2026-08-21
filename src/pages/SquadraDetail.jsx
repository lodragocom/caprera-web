import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { getTeam, logoUrl } from '../lib/core'
import { siglaCoppa } from '../lib/coppe'
import { Bacheca, PercorsoCoppe } from '../components/CoppeSocieta'
import CreditiSocieta from '../components/CreditiSocieta'
import {
  useArchivio, classificaPerpetua, bacheca as bachecaDi, partiteDi, rosa as rosaDi,
} from '../lib/archivio'
import { Pagina, Sezione, Numero } from '../components/moto'
import './SquadraDetail.css'

export default function SquadraDetail() {
  const { id } = useParams()
  const team = getTeam(id)

  const cl = useArchivio('perpetua', classificaPerpetua)
  const ba = useArchivio(['bacheca', id], () => bachecaDi(id), [id])

  /* Carriera e andamento: si contano dalle cento righe di classifica. */
  const { career, history } = useMemo(() => {
    const sue = (cl.dati ?? []).filter((r) => r.societa === id)
      .sort((a, b) => a.stagione.localeCompare(b.stagione))
    const c = {
      seasons: sue.length, played: 0, won: 0, points: 0,
      goalsFor: 0, goalsAgainst: 0, titles: [], best: null,
    }
    for (const r of sue) {
      c.played += r.giocate; c.won += r.vinte; c.points += r.punti
      c.goalsFor += r.gol_fatti; c.goalsAgainst += r.gol_subiti
      if (c.best === null || r.posizione < c.best) c.best = r.posizione
      if (r.posizione === 1) c.titles.push(r.stagione)
    }
    c.goalDiff = c.goalsFor - c.goalsAgainst
    c.winRate = c.played ? Math.round((c.won / c.played) * 100) : 0
    return {
      career: c,
      history: sue.map((r) => ({ season: r.stagione, position: r.posizione, points: r.punti })),
    }
  }, [cl.dati, id])

  const coppeVinte = (ba.dati ?? []).filter((t) => t.competizione !== 'campionato').length

  if (!team) {
    return (
      <div className="page container">
        <p className="empty">
          Società non trovata. <Link to="/squadre">Torna all'elenco</Link>.
        </p>
      </div>
    )
  }

  return (
    <Pagina className="page container wide">
      {/* ------------------------------------------------------- header */}
      <header className="team-hero card" style={{ '--accent': team.color }}>
        <img src={logoUrl(team)} alt="" className="hero-logo" />
        <div>
          <p className="eyebrow">{team.code} · dal {career.seasons ? history[0]?.season : '—'}</p>
          <h1>{team.name}</h1>
          {team.formerNames.length > 0 && (
            <p className="former">
              Già {team.formerNames.join(' · ')}
            </p>
          )}
          {career.titles.length > 0 && (
            <p className="titles">
              ★ Campione {career.titles.join(', ')}
            </p>
          )}
        </div>
      </header>

      <div className="kpi-row">
        <Kpi label="Stagioni" value={career.seasons} />
        <Kpi label="Partite" value={career.played} />
        <Kpi label="Punti" value={career.points} />
        <Kpi label="Vittorie" value={`${career.winRate}%`} />
        <Kpi label="Gol fatti" value={career.goalsFor} />
        <Kpi label="Diff. reti" value={career.goalDiff > 0 ? `+${career.goalDiff}` : career.goalDiff} />
        <Kpi label="Miglior piazz." value={career.best ? `${career.best}º` : '—'} />
        <Kpi label="Titoli" value={career.titles.length} gold />
        <Kpi label="Coppe" value={coppeVinte} gold />
      </div>

      {/* ------------------------------------------------------ history */}
      <section className="block">
        <h2 className="section-title">Andamento per stagione</h2>
        <Sezione stato={cl} righe={4}>
          <PositionChart history={history} color={team.color} />
        </Sezione>
      </section>

      {/* ------------------------------------------------------- trofei */}
      <Bacheca teamId={id} />
      <PercorsoCoppe teamId={id} />

      {/* primo pezzo del sito che legge dal database e non da un file */}
      <CreditiSocieta teamId={id} />

      <Rosa teamId={id} />

      {/* ------------------------------------------------------ matches */}
      <SeasonMatches teamId={id} />
    </Pagina>
  )
}

/** La rosa di una stagione, dal database. */
function Rosa({ teamId }) {
  const cl = useArchivio('perpetua', classificaPerpetua)
  const stagioni = useMemo(
    () => [...new Set((cl.dati ?? []).filter((r) => r.societa === teamId)
      .map((r) => r.stagione))].sort().reverse(),
    [cl.dati, teamId]
  )
  const [scelta, setScelta] = useState('')
  const stagione = scelta && stagioni.includes(scelta) ? scelta : stagioni[0]
  const stato = useArchivio(['rosa', stagione, teamId],
    () => (stagione ? rosaDi(stagione, teamId) : Promise.resolve([])), [stagione, teamId])

  const righe = stato.dati ?? []
  const riepilogo = useMemo(() => {
    const perRuolo = { P: 0, D: 0, C: 0, A: 0 }
    let spesi = 0; let somma = 0; let quanti = 0
    for (const p of righe) {
      perRuolo[p.ruolo] = (perRuolo[p.ruolo] ?? 0) + 1
      spesi += p.costo ?? 0
      if (p.fm != null) { somma += Number(p.fm); quanti += 1 }
    }
    return { perRuolo, spesi, quanti: righe.length,
             fmMedia: quanti ? (somma / quanti).toFixed(2) : null }
  }, [righe])

  if (!stagioni.length) return null

  return (
    <section className="block">
      <h2 className="section-title">Rosa</h2>
      <div className="controls">
        <div className="field">
          <label htmlFor="sd-stagione">Stagione</label>
          <select id="sd-stagione" value={stagione} onChange={(e) => setScelta(e.target.value)}>
            {stagioni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="roster-meta">
          <span><b className="num">{riepilogo.quanti}</b> calciatori</span>
          <span><b className="num">{riepilogo.spesi}</b> crediti spesi</span>
          {riepilogo.fmMedia && <span>FM media <b className="num">{riepilogo.fmMedia}</b></span>}
          <span className="num roles">
            {riepilogo.perRuolo.P}P · {riepilogo.perRuolo.D}D · {riepilogo.perRuolo.C}C · {riepilogo.perRuolo.A}A
          </span>
        </div>
      </div>

      <Sezione stato={stato} righe={10} vuoto="Nessuna rosa registrata.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">R</th><th className="left">Calciatore</th>
                <th className="left">Club</th><th>Costo</th>
                <th>Pres.</th><th>MV</th><th>FM</th>
              </tr>
            </thead>
            <tbody>
              {[...righe].sort((a, b) =>
                'PDCA'.indexOf(a.ruolo) - 'PDCA'.indexOf(b.ruolo) || (b.costo ?? 0) - (a.costo ?? 0))
                .map((p, i) => (
                <tr key={i}>
                  <td className="left"><span className={`badge role-${p.ruolo}`}>{p.ruolo}</span></td>
                  <td className="left strong">{p.nome}</td>
                  <td className="left muted num club">{p.club ?? '—'}</td>
                  <td className="num">{p.costo ?? '—'}</td>
                  <td className="num muted">{p.presenze ?? '—'}</td>
                  <td className="num muted">{p.mv != null ? Number(p.mv).toFixed(2) : '—'}</td>
                  <td className="num">{p.fm != null ? Number(p.fm).toFixed(2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sezione>
    </section>
  )
}

function Kpi({ label, value, gold }) {
  return (
    <div className="kpi card">
      <strong className={`num${gold ? ' gold-text' : ''}`}>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

/** Grafico a linee: posizione in classifica per stagione (1 in alto). */
function PositionChart({ history, color }) {
  if (history.length < 2) return <p className="muted">Dati insufficienti.</p>

  const W = 760
  const H = 220
  const padX = 46
  const padY = 26
  const stepX = (W - padX * 2) / Math.max(1, history.length - 1)
  const y = (pos) => padY + ((pos - 1) / 9) * (H - padY * 2)
  const points = history.map((h, i) => [padX + i * stepX, y(h.position)])
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
           aria-label="Posizione in classifica per stagione">
        {[1, 3, 5, 7, 10].map((p) => (
          <g key={p}>
            <line x1={padX} x2={W - padX} y1={y(p)} y2={y(p)}
                  stroke="rgba(255,255,255,.07)" />
            <text x={padX - 10} y={y(p) + 4} textAnchor="end"
                  className="chart-label">{p}º</text>
          </g>
        ))}
        <path d={path} fill="none" stroke={color} strokeWidth="2.5"
              strokeLinejoin="round" strokeLinecap="round" />
        {points.map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={history[i].position === 1 ? 6 : 4.5}
                    fill={history[i].position === 1 ? 'var(--gold-500)' : color}
                    stroke="var(--navy-850)" strokeWidth="2" />
            <text x={px} y={H - 6} textAnchor="middle" className="chart-label">
              {history[i].season.slice(2)}
            </text>
            <title>{`${history[i].season}: ${history[i].position}º, ${history[i].points} pt`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

const AMBITI = [
  ['tutte', 'Tutte'],
  ['campionato', 'Campionato'],
  ['coppe', 'Coppe'],
]

/**
 * Le partite di una stagione, campionato e coppe insieme.
 *
 * Arrivano tutte dalla stessa vista del database, `v_gare`, gia' orientata
 * dalla parte della societa': `gol_fatti` e `gol_subiti` sono i suoi, non
 * quelli di casa. Una lettura sola per stagione.
 */
function SeasonMatches({ teamId }) {
  const cl = useArchivio('perpetua', classificaPerpetua)
  // solo le stagioni in cui questa societa' ha giocato: le societa' storiche
  // non devono ritrovarsi in elenco annate che non le riguardano
  const stagioni = useMemo(
    () => [...new Set((cl.dati ?? []).filter((r) => r.societa === teamId)
      .map((r) => r.stagione))].sort().reverse(),
    [cl.dati, teamId]
  )
  const [scelta, setScelta] = useState('')
  const season = scelta && stagioni.includes(scelta) ? scelta : stagioni[0]
  const [ambito, setAmbito] = useState('tutte')

  const stato = useArchivio(['partiteDi', season, teamId],
    () => (season ? partiteDi(season, teamId) : Promise.resolve([])), [season, teamId])

  const righe = useMemo(() => {
    const out = []
    for (const g of stato.dati ?? []) {
      const coppa = g.competizione !== 'campionato'
      if (ambito === 'coppe' && !coppa) continue
      if (ambito === 'campionato' && coppa) continue
      out.push({
        coppa,
        sigla: coppa ? siglaCoppa(g.competizione) : `${g.giornata}ª`,
        giocata: g.giocata,
        casa: g.in_casa, avversario: g.avversario,
        gf: g.gol_fatti, gs: g.gol_subiti,
        titolo: coppa ? g.competizione : `${g.giornata}ª giornata`,
      })
    }
    // prima il campionato in ordine di giornata, poi le coppe
    return out.sort((a, b) => Number(a.coppa) - Number(b.coppa))
  }, [stato.dati, ambito])

  const coppe = righe.filter((r) => r.coppa).length

  return (
    <section className="block">
      <h2 className="section-title">Partite</h2>
      <div className="controls">
        <div className="field">
          <label htmlFor="sm-season">Stagione</label>
          <select id="sm-season" value={season ?? ''} onChange={(e) => setScelta(e.target.value)}>
            {stagioni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sm-ambito">Competizione</label>
          <select id="sm-ambito" value={ambito} onChange={(e) => setAmbito(e.target.value)}>
            {AMBITI.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <p className="roster-meta">
          <span><b className="num">{righe.length}</b> partite</span>
          <span><b className="num">{coppe}</b> di coppa</span>
        </p>
      </div>

      <Sezione stato={stato} righe={8} vuoto="Nessuna partita.">
      <div className="mini-matches">
        {righe.map((m, i) => {
          const res = !m.giocata ? null : m.gf > m.gs ? 'V' : m.gf === m.gs ? 'N' : 'P'
          return (
            <div key={i} className={m.coppa ? 'mini card di-coppa' : 'mini card'} title={m.titolo}>
              <span className="num rnd">{m.sigla}</span>
              <span className={`ha${m.casa ? ' is-home' : ''}`}>{m.casa ? 'C' : 'T'}</span>
              <TeamBadge id={m.avversario} size="sm" label="short" />
              {res ? (
                <>
                  <span className="num mini-score">{m.gf}–{m.gs}</span>
                  <i className={`dot dot-${res}`}>{res}</i>
                </>
              ) : (
                <span className="num muted mini-score">—</span>
              )}
            </div>
          )
        })}
      </div>
      </Sezione>
    </section>
  )
}
