import { useMemo } from 'react'
import TeamBadge from '../components/TeamBadge'
import { standings, seasons } from '../lib/data'
import './Ranking.css'

/** Numero di stagioni considerate nel coefficiente. */
const FINESTRA = 5

/**
 * Ranking Caprera calcolato dai risultati di campionato.
 *
 * Il regolamento usa un "Ranking Caprera Uefa" per comporre i due gironi di
 * qualificazione a Champions ed Europa League, ma non ne pubblica la formula.
 * Qui si usa un coefficiente in stile UEFA: punti delle ultime cinque
 * stagioni, pesati in modo decrescente (la più recente vale di più).
 *
 * NON è il ranking ufficiale della Federazione: quello vive nella dashboard.
 */
function coefficiente() {
  const ultime = seasons.filter((s) => standings[s]?.length).slice(-FINESTRA)
  const pesi = ultime.map((_, i) => (i + 1) / ultime.length) // 0.2 … 1.0

  const acc = new Map()
  ultime.forEach((s, i) => {
    for (const r of standings[s]) {
      const cur = acc.get(r.team) ?? { team: r.team, punti: 0, dettaglio: [] }
      cur.punti += r.points * pesi[i]
      cur.dettaglio.push({ season: s, points: r.points, position: r.position, peso: pesi[i] })
      acc.set(r.team, cur)
    }
  })

  return {
    ultime,
    righe: [...acc.values()]
      .map((r) => ({ ...r, punti: +r.punti.toFixed(1) }))
      .sort((a, b) => b.punti - a.punti),
  }
}

export default function Ranking() {
  const { ultime, righe } = useMemo(coefficiente, [])
  const max = Math.max(...righe.map((r) => r.punti))

  // Gironi CL/EL: dispari in uno, pari nell'altro (regolamento §5.3)
  const gironeA = righe.filter((_, i) => i % 2 === 0)
  const gironeB = righe.filter((_, i) => i % 2 === 1)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Coefficienti</p>
        <h1>Ranking Caprera</h1>
        <p className="lede">
          Serve a comporre i due gironi di qualificazione a Champions ed Europa
          League: le posizioni dispari in un girone, le pari nell'altro.
        </p>
      </header>

      <div className="avviso card">
        <strong>Ranking non ufficiale.</strong> Il regolamento cita il "Ranking
        Caprera Uefa" senza pubblicarne la formula. Questo è ricalcolato dai punti
        di campionato delle ultime {ultime.length} stagioni ({ultime[0]} –
        {' '}{ultime[ultime.length - 1]}), pesati in modo decrescente: la stagione
        più recente vale il doppio della più lontana. Quello ufficiale è nella
        dashboard della Federazione.
      </div>

      <section className="block">
        <h2 className="section-title">Coefficiente</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">#</th>
                <th className="left">Società</th>
                {ultime.map((s) => (
                  <th key={s} className="num-head">{s.slice(2)}</th>
                ))}
                <th>Coeff.</th>
                <th className="left">Peso</th>
              </tr>
            </thead>
            <tbody>
              {righe.map((r, i) => (
                <tr key={r.team} className={i < 2 ? 'podium' : undefined}>
                  <td className="num pos">{i + 1}</td>
                  <td className="left"><TeamBadge id={r.team} size="sm" /></td>
                  {ultime.map((s) => {
                    const d = r.dettaglio.find((x) => x.season === s)
                    return (
                      <td key={s} className="num muted" title={d ? `${d.position}º posto` : ''}>
                        {d ? d.points : '—'}
                      </td>
                    )
                  })}
                  <td className="num strong">{r.punti}</td>
                  <td className="left">
                    <span className="coef-bar">
                      <i style={{ width: `${(r.punti / max) * 100}%` }} />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="block">
        <h2 className="section-title">Gironi che ne deriverebbero</h2>
        <p className="lede">
          Secondo il regolamento: 1ª, 3ª, 5ª, 7ª, 9ª in un girone; 2ª, 4ª, 6ª, 8ª,
          10ª nell'altro. Dieci giornate, le prime due di ogni girone vanno in
          Champions, terza e quarta in Europa League, le ultime due in Conference.
        </p>
        <div className="gironi">
          <Girone titolo="Girone dispari" squadre={gironeA} righe={righe} />
          <Girone titolo="Girone pari" squadre={gironeB} righe={righe} />
        </div>
      </section>
    </div>
  )
}

function Girone({ titolo, squadre, righe }) {
  return (
    <div className="girone card">
      <h3>{titolo}</h3>
      <ol>
        {squadre.map((s) => (
          <li key={s.team}>
            <span className="num seed">{righe.indexOf(s) + 1}ª</span>
            <TeamBadge id={s.team} size="sm" />
            <span className="num coef">{s.punti}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
