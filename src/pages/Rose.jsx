import { useMemo, useState, useDeferredValue } from 'react'
import TeamBadge from '../components/TeamBadge'
import {
  rosters, teams, ROSTER_SEASONS, rosterOf, rosterSummary, financesOf, getTeam,
} from '../lib/data'
import './Rose.css'

const ROLES = ['P', 'D', 'C', 'A']
const LATEST = ROSTER_SEASONS[ROSTER_SEASONS.length - 1]

export default function Rose() {
  const [season, setSeason] = useState(LATEST)
  const [role, setRole] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('cost')
  const query = useDeferredValue(q)

  const rows = useMemo(() => {
    const norm = query.trim().toLowerCase()
    let out = rosters.filter(
      (r) =>
        r.season === season &&
        (!role || r.role === role) &&
        (!norm ||
          r.player.toLowerCase().includes(norm) ||
          (r.club ?? '').toLowerCase().includes(norm))
    )
    const cmp = {
      cost: (a, b) => (b.cost ?? 0) - (a.cost ?? 0),
      fm: (a, b) => (b.fm ?? -1) - (a.fm ?? -1),
      apps: (a, b) => (b.apps ?? -1) - (a.apps ?? -1),
      player: (a, b) => a.player.localeCompare(b.player),
    }[sort]
    return [...out].sort(cmp)
  }, [season, role, query, sort])

  // riepilogo crediti per squadra nella stagione scelta
  const budgets = useMemo(
    () =>
      teams
        .map((t) => ({ team: t, ...rosterSummary(rosterOf(season, t.id)) }))
        .filter((b) => b.size > 0)
        .sort((a, b) => b.spent - a.spent),
    [season]
  )

  const maxSpent = Math.max(1, ...budgets.map((b) => b.spent))
  const finanze = financesOf(season)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Mercato</p>
        <h1>Rose e crediti</h1>
        <p className="lede">
          Ogni rosa vale 6-9-9-7 e si costruisce con 250 crediti più 3 per gli Under.
          Qui trovi chi ha comprato chi, a quanto, e come è andata.
        </p>
      </header>

      {/* ------------------------------------------------------- finanze */}
      {finanze.length > 0 && (
        <section className="block">
          <h2 className="section-title">Bilancio crediti · {season}</h2>
          <p className="lede fin-lede">
            I crediti iniziali sono 250 più i risparmi dell'anno prima, premi e
            penalità. Il saldo scambi è quanto una società ha incassato (o speso)
            comprando e vendendo fuori asta.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="left">Società</th>
                  <th>Iniziali</th>
                  <th>Spesi</th>
                  <th>Scambi</th>
                  <th>Residui</th>
                  <th>Riportati</th>
                  <th>Premi/Pen.</th>
                  <th>FFP</th>
                </tr>
              </thead>
              <tbody>
                {finanze.map((f) => (
                  <tr key={f.team}>
                    <td className="left"><TeamBadge id={f.team} size="sm" /></td>
                    <td className="num muted">{f.initial ?? '—'}</td>
                    <td className="num strong">{f.spent ?? '—'}</td>
                    <td className={`num ${f.trades ? 'gold-text' : 'muted'}`}>
                      {f.trades ? (f.trades > 0 ? `+${f.trades}` : f.trades) : '—'}
                    </td>
                    <td className="num">{f.left ?? '—'}</td>
                    <td className="num muted">{f.carried ?? '—'}</td>
                    <td className="num muted">{f.bonus ?? '—'}</td>
                    <td className="num muted">{f.ffp ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- budget bars */}
      <section className="block">
        <h2 className="section-title">Crediti investiti · {season}</h2>
        <div className="budget-list">
          {budgets.map((b) => (
            <div key={b.team.id} className="budget">
              <TeamBadge id={b.team.id} size="sm" />
              <div className="bar">
                <span
                  style={{
                    width: `${(b.spent / maxSpent) * 100}%`,
                    background: b.team.color,
                  }}
                />
              </div>
              <span className="num spent">{b.spent}</span>
              <span className="num size muted">{b.size} cal.</span>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- table */}
      <section className="block">
        <h2 className="section-title">Tutti i calciatori</h2>

        <div className="controls">
          <div className="field">
            <label htmlFor="ro-season">Stagione</label>
            <select id="ro-season" value={season} onChange={(e) => setSeason(e.target.value)}>
              {[...ROSTER_SEASONS].reverse().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="ro-q">Cerca</label>
            <input
              id="ro-q"
              type="search"
              placeholder="Calciatore o club…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="ro-sort">Ordina per</label>
            <select id="ro-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="cost">Costo</option>
              <option value="fm">Fantamedia</option>
              <option value="apps">Presenze</option>
              <option value="player">Nome</option>
            </select>
          </div>

          <div className="seg role-seg">
            <button aria-pressed={role === ''} onClick={() => setRole('')}>Tutti</button>
            {ROLES.map((r) => (
              <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <p className="result-count num">{rows.length} calciatori</p>

        {rows.length === 0 ? (
          <p className="empty">Nessun risultato.</p>
        ) : (
          <div className="table-wrap tall">
            <table>
              <thead>
                <tr>
                  <th className="left">R</th>
                  <th className="left">Calciatore</th>
                  <th className="left">Club</th>
                  <th className="left">Società</th>
                  <th>Costo</th>
                  <th>Pres.</th>
                  <th>MV</th>
                  <th>FM</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={i}>
                    <td className="left">
                      <span className={`badge role-${p.role}`}>{p.role}</span>
                    </td>
                    <td className="left strong">{p.player}</td>
                    <td className="left muted num club">{p.club ?? '—'}</td>
                    <td className="left"><TeamBadge id={p.team} size="sm" /></td>
                    <td className="num">{p.cost ?? '—'}</td>
                    <td className="num muted">{p.apps ?? '—'}</td>
                    <td className="num muted">{p.mv?.toFixed(2) ?? '—'}</td>
                    <td className="num">{p.fm?.toFixed(2) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
