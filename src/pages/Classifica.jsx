import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import {
  standings, seasons, LAST_PLAYED_SEASON, formOf, teams,
} from '../lib/data'
import './Classifica.css'

const playedSeasons = seasons.filter((s) => standings[s]?.length).reverse()

export default function Classifica() {
  const [season, setSeason] = useState(LAST_PLAYED_SEASON)
  const [mode, setMode] = useState('classifica') // classifica | fantapunti | storico

  const table = useMemo(() => {
    const rows = [...(standings[season] ?? [])]
    if (mode === 'fantapunti') {
      rows.sort((a, b) => b.fantapoints - a.fantapoints)
    }
    return rows
  }, [season, mode])

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Lega Caprera</p>
        <h1>Classifica</h1>
        <p className="lede">
          Tre punti per la vittoria, uno per il pareggio. A parità: differenza reti,
          gol fatti, fantapunti — come da regolamento.
        </p>
      </header>

      <div className="controls">
        <div className="seg">
          {['classifica', 'fantapunti', 'storico'].map((m) => (
            <button
              key={m}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m === 'classifica' ? 'Campionato' : m === 'fantapunti' ? 'Fantapunti' : 'Storico'}
            </button>
          ))}
        </div>

        {mode !== 'storico' && (
          <div className="field">
            <label htmlFor="season">Stagione</label>
            <select
              id="season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              {playedSeasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {mode === 'storico' ? <AllTime /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">#</th>
                <th className="left">Società</th>
                <th>G</th>
                <th>V</th>
                <th>N</th>
                <th>P</th>
                <th>GF</th>
                <th>GS</th>
                <th>DR</th>
                <th>FP</th>
                <th>Pt</th>
                <th className="left form-col">Forma</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r, i) => (
                <tr key={r.team} className={i < 3 ? 'podium' : i === table.length - 1 ? 'last' : undefined}>
                  <td className="num pos">{mode === 'fantapunti' ? i + 1 : r.position}</td>
                  <td className="left"><TeamBadge id={r.team} size="sm" /></td>
                  <td className="num muted">{r.played}</td>
                  <td className="num">{r.won}</td>
                  <td className="num">{r.drawn}</td>
                  <td className="num">{r.lost}</td>
                  <td className="num muted">{r.goalsFor}</td>
                  <td className="num muted">{r.goalsAgainst}</td>
                  <td className="num">{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</td>
                  <td className={`num ${mode === 'fantapunti' ? 'strong' : 'muted'}`}>
                    {r.fantapoints.toLocaleString('it-IT')}
                  </td>
                  <td className={`num ${mode === 'classifica' ? 'strong' : ''}`}>{r.points}</td>
                  <td className="left form-col">
                    <Form season={season} team={r.team} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="note">
        Le posizioni si riferiscono al solo campionato. Coppa Italia, Champions,
        Europa e Conference League seguono tabelloni separati.
      </p>
    </div>
  )
}

function Form({ season, team }) {
  const form = formOf(season, team, 5)
  if (!form.length) return <span className="muted">—</span>
  return (
    <span className="form">
      {form.map((f, i) => (
        <i key={i} className={`dot dot-${f.result}`} title={`${f.round}ª · ${f.score}`}>
          {f.result}
        </i>
      ))}
    </span>
  )
}

/** Classifica perpetua: somma di tutte le stagioni. */
function AllTime() {
  const rows = useMemo(() => {
    const acc = new Map()
    for (const season of seasons) {
      for (const r of standings[season] ?? []) {
        const cur = acc.get(r.team) ?? {
          team: r.team, seasons: 0, played: 0, won: 0, drawn: 0,
          lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0, titles: 0,
        }
        cur.seasons += 1
        for (const k of ['played', 'won', 'drawn', 'lost', 'goalsFor', 'goalsAgainst', 'points']) {
          cur[k] += r[k]
        }
        if (r.position === 1) cur.titles += 1
        acc.set(r.team, cur)
      }
    }
    return [...acc.values()]
      .map((r) => ({
        ...r,
        goalDiff: r.goalsFor - r.goalsAgainst,
        ppg: +(r.points / r.played).toFixed(2),
      }))
      .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff)
  }, [])

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="left">#</th>
            <th className="left">Società</th>
            <th>St</th>
            <th>G</th>
            <th>V</th>
            <th>N</th>
            <th>P</th>
            <th>GF</th>
            <th>GS</th>
            <th>DR</th>
            <th>Pt</th>
            <th>Pt/G</th>
            <th>Titoli</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.team} className={i < 3 ? 'podium' : undefined}>
              <td className="num pos">{i + 1}</td>
              <td className="left"><TeamBadge id={r.team} size="sm" /></td>
              <td className="num muted">{r.seasons}</td>
              <td className="num muted">{r.played}</td>
              <td className="num">{r.won}</td>
              <td className="num">{r.drawn}</td>
              <td className="num">{r.lost}</td>
              <td className="num muted">{r.goalsFor}</td>
              <td className="num muted">{r.goalsAgainst}</td>
              <td className="num">{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</td>
              <td className="num strong">{r.points}</td>
              <td className="num muted">{r.ppg}</td>
              <td className="num gold-text">{r.titles || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
