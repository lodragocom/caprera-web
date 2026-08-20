import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import {
  contracts, ACTIVE_TEAMS, CONTRACT_SEASONS, getTeam,
} from '../lib/data'
import './Contratti.css'

const RUOLI = ['D', 'C', 'A']
// Tetto slot per ruolo dal 2025/26 (Referendum Jobs Act 06.2025)
const TETTO = { D: 3, C: 3, A: 2 }

export default function Contratti() {
  const [team, setTeam] = useState('')
  const [soloUnder, setSoloUnder] = useState(false)

  const stagioni = CONTRACT_SEASONS
  const righe = useMemo(() => {
    let out = contracts
    if (team) out = out.filter((c) => c.team === team)
    if (soloUnder) out = out.filter((c) => c.under)
    return [...out].sort(
      (a, b) => b.from.localeCompare(a.from) || a.player.localeCompare(b.player)
    )
  }, [team, soloUnder])

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Jobs Act</p>
        <h1>Contratti</h1>
        <p className="lede">
          Ogni estate una società può mettere sotto contratto tre senior — uno per
          ruolo — più un Under. Dal 2025/26 c'è un tetto: 3 difensori, 3
          centrocampisti, 2 attaccanti.
        </p>
      </header>

      <div className="avviso card">
        <strong>Dati provvisori.</strong> Questi {contracts.length} contratti sono
        estratti dal PDF storico della Presidenza, aggiornato a settembre 2024:
        mancano quelli stipulati dopo l'asta 2025/26 e le clausole rescissorie.
        La fonte completa (358 contratti con clausole e salari) è nella dashboard
        della Federazione.
      </div>

      <div className="controls">
        <div className="field">
          <label htmlFor="ct-team">Società</label>
          <select id="ct-team" value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">Tutte</option>
            {ACTIVE_TEAMS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="seg">
          <button aria-pressed={!soloUnder} onClick={() => setSoloUnder(false)}>
            Tutti
          </button>
          <button aria-pressed={soloUnder} onClick={() => setSoloUnder(true)}>
            Solo Under
          </button>
        </div>
        <p className="result-count num">{righe.length} contratti</p>
      </div>

      {team && <Slot teamId={team} />}

      <p className="legenda">
        La barra mostra le stagioni coperte dal contratto: una casella per
        stagione, da {stagioni[0]} a {stagioni[stagioni.length - 1]}.
        Le caselle piene sono gli anni in cui il calciatore era sotto contratto.
      </p>

      <div className="table-wrap tall">
        <table>
          <thead>
            <tr>
              <th className="left">R</th>
              <th className="left">Calciatore</th>
              {!team && <th className="left">Società</th>}
              <th>Anni</th>
              <th className="left">Scadenza</th>
              <th className="left cov-head">
                <span className="gantt-head">
                  {stagioni.map((st) => (
                    <i key={st}><b>{st.slice(2)}</b></i>
                  ))}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {righe.map((c, i) => (
              <tr key={i}>
                <td className="left">
                  <span className={`badge role-${c.role}`}>{c.role}</span>
                </td>
                <td className="left strong">
                  {c.player}
                  {c.under && <span className="under" title="Under">★</span>}
                </td>
                {!team && (
                  <td className="left"><TeamBadge id={c.team} size="sm" label="short" /></td>
                )}
                <td className="num">{c.years}</td>
                <td className="left num periodo">
                  {c.from === c.to ? c.from : `${c.from} → ${c.to}`}
                </td>
                <td className="left">
                  <Barra from={c.from} to={c.to} stagioni={stagioni} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Barra orizzontale che mostra le stagioni coperte dal contratto. */
function Barra({ from, to, stagioni }) {
  const i0 = stagioni.indexOf(from)
  const i1 = stagioni.indexOf(to)
  return (
    <span className="gantt" title={`${from} → ${to}`}>
      {stagioni.map((s, i) => (
        <i
          key={s}
          className={i >= i0 && i <= i1 ? 'on' : ''}
          title={s}
        />
      ))}
    </span>
  )
}

/**
 * Slot occupati per ruolo. Conta i contratti che coprono l'ultima stagione
 * presente nei dati — approssimazione onesta finche' non arriva la fonte
 * completa con le date di scadenza reali.
 */
function Slot({ teamId }) {
  const ultima = CONTRACT_SEASONS[CONTRACT_SEASONS.length - 1]
  const attivi = contracts.filter((c) => c.team === teamId && c.to === ultima)
  const team = getTeam(teamId)

  return (
    <div className="slot-row">
      {RUOLI.map((r) => {
        const usati = attivi.filter((c) => c.role === r).length
        const max = TETTO[r]
        return (
          <div key={r} className="slot card">
            <span className={`badge role-${r}`}>{r}</span>
            <strong className="num">
              {usati}<span className="su">/{max}</span>
            </strong>
            <span className="slot-label">
              {usati >= max ? 'pieno' : `${max - usati} liber${max - usati === 1 ? 'o' : 'i'}`}
            </span>
            <span className="slot-bar">
              {Array.from({ length: max }, (_, i) => (
                <i key={i} className={i < usati ? 'on' : ''}
                   style={i < usati ? { background: team?.color } : undefined} />
              ))}
            </span>
          </div>
        )
      })}
    </div>
  )
}
