import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import {
  rosters, ROSTER_SEASONS, rosterOf, financesOf, ACTIVE_TEAMS,
} from '../lib/data'
import './Asta.css'

const RUOLI = [
  { k: 'P', nome: 'Portieri' },
  { k: 'D', nome: 'Difensori' },
  { k: 'C', nome: 'Centrocampisti' },
  { k: 'A', nome: 'Attaccanti' },
]

export default function Asta() {
  const stagioni = [...ROSTER_SEASONS].reverse()
  const [season, setSeason] = useState(stagioni[0])

  const righe = useMemo(
    () => rosters.filter((r) => r.season === season),
    [season]
  )
  const finanze = financesOf(season)

  const top = useMemo(
    () => [...righe].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).slice(0, 15),
    [righe]
  )

  /** Spesa per ruolo di ogni società. */
  const perRuolo = useMemo(() => {
    return ACTIVE_TEAMS.map((t) => {
      const rosa = rosterOf(season, t.id)
      if (!rosa.length) return null
      const spesa = { P: 0, D: 0, C: 0, A: 0 }
      for (const p of rosa) spesa[p.role] += p.cost ?? 0
      const tot = Object.values(spesa).reduce((a, b) => a + b, 0)
      return { team: t.id, spesa, tot }
    }).filter(Boolean).sort((a, b) => b.tot - a.tot)
  }, [season])

  const maxTot = Math.max(1, ...perRuolo.map((p) => p.tot))
  const totale = righe.reduce((n, r) => n + (r.cost ?? 0), 0)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Mercato</p>
        <h1>Asta</h1>
        <p className="lede">
          Dal 2025/26 l'asta è libera: niente più liste, le società chiamano i
          calciatori a turno con venti secondi per la chiamata e otto per il
          rilancio. I portieri si prendono a blocchi di due club di Serie A.
        </p>
      </header>

      <div className="controls">
        <div className="field">
          <label htmlFor="as-season">Stagione</label>
          <select id="as-season" value={season} onChange={(e) => setSeason(e.target.value)}>
            {stagioni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="asta-tot">
          <span><b className="num">{totale.toLocaleString('it-IT')}</b> crediti spesi</span>
          <span><b className="num">{righe.length}</b> assegnazioni</span>
        </div>
      </div>

      <section className="block">
        <h2 className="section-title">Gli acquisti più cari</h2>
        <div className="top-grid">
          {top.map((p, i) => (
            <div key={i} className="top-card card">
              <span className="pos num">{i + 1}</span>
              <div className="top-body">
                <strong>{p.player}</strong>
                <span className="top-meta">
                  <span className={`badge role-${p.role}`}>{p.role}</span>
                  {p.club && <span className="num club">{p.club}</span>}
                </span>
                <TeamBadge id={p.team} size="sm" label="short" />
              </div>
              <span className="prezzo num">{p.cost}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2 className="section-title">Come hanno speso · {season}</h2>
        <p className="lede">
          Ripartizione della spesa per reparto. Il regolamento sconta i rinnovi
          dei difensori del 50% e dei centrocampisti del 25%, quindi le rose con
          molti contratti in difesa costano meno di quanto sembri.
        </p>
        <div className="ruoli">
          {perRuolo.map((p) => (
            <div key={p.team} className="ruolo-riga">
              <TeamBadge id={p.team} size="sm" />
              <span className="stack">
                {RUOLI.map((r) => (
                  <i
                    key={r.k}
                    className={`seg-${r.k}`}
                    style={{ width: `${(p.spesa[r.k] / maxTot) * 100}%` }}
                    title={`${r.nome}: ${p.spesa[r.k]} crediti`}
                  />
                ))}
              </span>
              <span className="num tot">{p.tot}</span>
            </div>
          ))}
        </div>
        <div className="legenda-ruoli">
          {RUOLI.map((r) => (
            <span key={r.k}>
              <i className={`seg-${r.k}`} /> {r.nome}
            </span>
          ))}
        </div>
      </section>

      {finanze.length > 0 && (
        <section className="block">
          <h2 className="section-title">Budget di partenza</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="left">Società</th>
                  <th>Crediti iniziali</th>
                  <th>Spesi</th>
                  <th>Residui</th>
                  <th>% usata</th>
                </tr>
              </thead>
              <tbody>
                {finanze.map((f) => (
                  <tr key={f.team}>
                    <td className="left"><TeamBadge id={f.team} size="sm" /></td>
                    <td className="num muted">{f.initial ?? '—'}</td>
                    <td className="num strong">{f.spent ?? '—'}</td>
                    <td className="num">{f.left ?? '—'}</td>
                    <td className="num muted">
                      {f.initial ? `${Math.round((f.spent / f.initial) * 100)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
