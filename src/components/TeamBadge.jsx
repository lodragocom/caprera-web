import { Link } from 'react-router-dom'
import { getTeam, logoUrl } from '../lib/core'
import './TeamBadge.css'

/**
 * Logo + nome squadra, opzionalmente linkato alla scheda.
 *  size    'sm' | 'md' | 'lg'
 *  label   'full' | 'short' | 'code'  — 'short' per tabelle e card fitte
 */
export default function TeamBadge({ id, size = 'md', link = true, label = 'full' }) {
  const team = getTeam(id)
  if (!team) return <span className="muted">—</span>

  const text =
    label === 'code' ? team.code : label === 'short' ? team.short : team.name

  const src = logoUrl(team)

  const inner = (
    <>
      {src ? (
        <img src={src} alt="" loading="lazy" className={`tb-logo tb-${size}`} />
      ) : (
        // società storiche: nessuno stemma disponibile, si usa la sigla
        <span
          className={`tb-logo tb-${size} tb-fallback`}
          style={{ background: team.color }}
          aria-hidden="true"
        >
          {team.code}
        </span>
      )}
      <span className="tb-name" title={team.name}>
        {text}
      </span>
    </>
  )

  return link ? (
    <Link to={`/squadre/${team.id}`} className="team-badge">
      {inner}
    </Link>
  ) : (
    <span className="team-badge">{inner}</span>
  )
}
