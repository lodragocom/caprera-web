import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { standings, seasons, teams, getTeam } from '../lib/core'
import { bachecaTrofei, STAGIONI } from '../lib/coppe'
import './AlboOro.css'

export default function AlboOro() {
  const stagioni = useMemo(
    () => seasons.filter((s) => standings[s]?.length).reverse(),
    []
  )

  /** Quante volte ogni società ha chiuso 1ª, 2ª, 3ª e ultima. */
  const bacheca = useMemo(() => {
    const acc = new Map()
    for (const s of stagioni) {
      const tabella = standings[s]
      for (const r of tabella) {
        const cur = acc.get(r.team) ?? { team: r.team, oro: 0, argento: 0, bronzo: 0, ultimo: 0, titoli: [] }
        if (r.position === 1) { cur.oro += 1; cur.titoli.push(s) }
        else if (r.position === 2) cur.argento += 1
        else if (r.position === 3) cur.bronzo += 1
        if (r.position === tabella.length) cur.ultimo += 1
        acc.set(r.team, cur)
      }
    }
    return [...acc.values()].sort(
      (a, b) => b.oro - a.oro || b.argento - a.argento || b.bronzo - a.bronzo
    )
  }, [stagioni])

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Archivio</p>
        <h1>Albo d'oro</h1>
        <p className="lede">
          Il campionato di Lega Caprera, stagione per stagione, e tutti i trofei
          vinti da ogni società. I tabelloni completi delle coppe sono{' '}
          <Link to="/coppe">nella pagina Coppe</Link>.
        </p>
      </header>


      <section className="block">
        <h2 className="section-title">Bacheca</h2>
        <div className="bacheca">
          {bacheca.map((b) => (
            <div key={b.team} className="trofeo card">
              <TeamBadge id={b.team} size="lg" />
              <div className="medaglie">
                <span className="m oro" title="Primi posti">{b.oro}</span>
                <span className="m argento" title="Secondi posti">{b.argento}</span>
                <span className="m bronzo" title="Terzi posti">{b.bronzo}</span>
              </div>
              {b.titoli.length > 0 && (
                <p className="anni num">{b.titoli.join(' · ')}</p>
              )}
              {bachecaTrofei(b.team).filter((t) => t.id !== 'campionato').length > 0 && (
                <p className="coppe-mini">
                  {bachecaTrofei(b.team)
                    .filter((t) => t.id !== 'campionato')
                    .map((t) => (
                      <span key={t.id} title={t.stagioni.join(' · ')}>
                        {t.nome}{t.n > 1 && <b> ×{t.n}</b>}
                      </span>
                    ))}
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="note">
          Le tre medaglie sono, nell'ordine, primi / secondi / terzi posti in
          campionato. Sotto, le coppe vinte in {STAGIONI.length} stagioni: passa
          il puntatore sopra per vedere gli anni.
        </p>
      </section>

      <section className="block">
        <h2 className="section-title">Stagione per stagione</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">Stagione</th>
                <th className="left">Campione</th>
                <th>Pt</th>
                <th className="left">Seconda</th>
                <th className="left">Terza</th>
                <th className="left">Ultima</th>
              </tr>
            </thead>
            <tbody>
              {stagioni.map((s) => {
                const t = standings[s]
                return (
                  <tr key={s}>
                    <td className="left num season-cell">{s}</td>
                    <td className="left"><TeamBadge id={t[0].team} size="sm" /></td>
                    <td className="num strong">{t[0].points}</td>
                    <td className="left muted-badge">
                      <TeamBadge id={t[1].team} size="sm" label="short" />
                    </td>
                    <td className="left muted-badge">
                      <TeamBadge id={t[2].team} size="sm" label="short" />
                    </td>
                    <td className="left muted-badge">
                      <TeamBadge id={t[t.length - 1].team} size="sm" label="short" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
