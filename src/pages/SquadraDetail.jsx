import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import {
  getTeam, logoUrl, careerOf, positionHistory, seasons, standings,
  matchesOf, rosterOf, rosterSummary, ROSTER_SEASONS,
} from '../lib/data'
import { Bacheca, PercorsoCoppe } from '../components/CoppeSocieta'
import { trofeiDi, gareCoppaDi, siglaCoppa } from '../lib/coppe'
import './SquadraDetail.css'

export default function SquadraDetail() {
  const { id } = useParams()
  const team = getTeam(id)

  const rosterSeasons = useMemo(
    () => ROSTER_SEASONS.filter((s) => rosterOf(s, id).length > 0).reverse(),
    [id]
  )
  const [season, setSeason] = useState(rosterSeasons[0])

  if (!team) {
    return (
      <div className="page container">
        <p className="empty">
          Società non trovata. <Link to="/squadre">Torna all'elenco</Link>.
        </p>
      </div>
    )
  }

  const career = careerOf(id)
  const history = positionHistory(id)
  const roster = season ? rosterOf(season, id) : []
  const summary = rosterSummary(roster)

  return (
    <div className="page container wide">
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
        <Kpi label="Coppe" value={trofeiDi(id).filter((t) => t.id !== 'campionato').length} gold />
      </div>

      {/* ------------------------------------------------------ history */}
      <section className="block">
        <h2 className="section-title">Andamento per stagione</h2>
        <PositionChart history={history} color={team.color} />
      </section>

      {/* ------------------------------------------------------- trofei */}
      <Bacheca teamId={id} />
      <PercorsoCoppe teamId={id} />

      {/* -------------------------------------------------------- roster */}
      {rosterSeasons.length > 0 && (
        <section className="block">
          <h2 className="section-title">Rosa</h2>

          <div className="controls">
            <div className="field">
              <label htmlFor="sd-season">Stagione</label>
              <select
                id="sd-season"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              >
                {rosterSeasons.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="roster-meta">
              <span><b className="num">{summary.size}</b> calciatori</span>
              <span><b className="num">{summary.spent}</b> crediti spesi</span>
              {summary.avgFm && <span>FM media <b className="num">{summary.avgFm}</b></span>}
              <span className="num roles">
                {summary.byRole.P}P · {summary.byRole.D}D · {summary.byRole.C}C · {summary.byRole.A}A
              </span>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="left">R</th>
                  <th className="left">Calciatore</th>
                  <th className="left">Club</th>
                  <th>Costo</th>
                  <th>Pres.</th>
                  <th>MV</th>
                  <th>FM</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((p, i) => (
                  <tr key={i}>
                    <td className="left">
                      <span className={`badge role-${p.role}`}>{p.role}</span>
                    </td>
                    <td className="left strong">{p.player}</td>
                    <td className="left muted num club">{p.club ?? '—'}</td>
                    <td className="num">{p.cost ?? '—'}</td>
                    <td className="num muted">{p.apps ?? '—'}</td>
                    <td className="num muted">{p.mv?.toFixed(2) ?? '—'}</td>
                    <td className="num">{p.fm?.toFixed(2) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ matches */}
      <SeasonMatches teamId={id} />
    </div>
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
 * Le due fonti hanno forma diversa (il calendario e' in matches.json, le
 * coppe in cups.json) e qui vengono ridotte alla stessa riga: sigla del
 * turno, casa o trasferta, avversario, risultato.
 */
function SeasonMatches({ teamId }) {
  // solo le stagioni in cui questa societa' ha giocato: le societa' storiche
  // non devono ritrovarsi in elenco annate che non le riguardano
  const played = useMemo(
    () => seasons.filter((s) => standings[s]?.length && matchesOf(s, teamId).length).reverse(),
    [teamId]
  )
  const [season, setSeason] = useState(played[0])
  const [ambito, setAmbito] = useState('tutte')

  const righe = useMemo(() => {
    const out = []
    if (ambito !== 'coppe') {
      for (const m of matchesOf(season, teamId)) {
        out.push({
          sigla: `${m.round}ª`, coppa: false, giocata: m.played,
          casa: m.home === teamId, avversario: m.home === teamId ? m.away : m.home,
          gf: m.home === teamId ? m.homeGoals : m.awayGoals,
          gs: m.home === teamId ? m.awayGoals : m.homeGoals,
          titolo: `${m.round}ª giornata`,
        })
      }
    }
    if (ambito !== 'campionato') {
      for (const g of gareCoppaDi(teamId, season)) {
        out.push({
          sigla: siglaCoppa(g.competizioneId), coppa: true, giocata: true,
          casa: g.casa === teamId, avversario: g.casa === teamId ? g.fuori : g.casa,
          gf: g.casa === teamId ? g.golCasa : g.golFuori,
          gs: g.casa === teamId ? g.golFuori : g.golCasa,
          titolo: `${g.competizione} · ${g.turno}`,
        })
      }
    }
    return out
  }, [teamId, season, ambito])

  const coppe = righe.filter((r) => r.coppa).length

  return (
    <section className="block">
      <h2 className="section-title">Partite</h2>
      <div className="controls">
        <div className="field">
          <label htmlFor="sm-season">Stagione</label>
          <select id="sm-season" value={season} onChange={(e) => setSeason(e.target.value)}>
            {played.map((s) => <option key={s} value={s}>{s}</option>)}
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
    </section>
  )
}
