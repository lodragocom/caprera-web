import { NavLink, Outlet, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { getTeam, logoUrl } from '../lib/core'
import './AreaLayout.css'

/**
 * Guscio della dashboard privata: barra laterale propria, niente menu
 * pubblico. Serve a far capire subito che si e' dentro l'area della
 * propria societa' e non piu' sul sito pubblico.
 */
const VOCI = [
  { to: '/area', end: true, label: 'Panoramica', icona: '◈' },
  { to: '/area/rosa', label: 'La mia rosa', icona: '☰' },
  { to: '/area/formazioni', label: 'Formazioni', icona: '⬡' },
  { to: '/area/contratti', label: 'Contratti', icona: '✎' },
  { to: '/area/crediti', label: 'Crediti', icona: '◎' },
  { to: '/area/coppe', label: 'Coppe', icona: '❖' },
  { to: '/area/storia', label: 'Storia e racconto', icona: '❦' },
]

export default function AreaLayout() {
  const { sessione, esci, anteprima } = useAuth()
  if (!sessione) return <Navigate to="/login" replace />

  const team = getTeam(sessione.team)

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link to="/" className="dash-brand" title="Torna al sito pubblico">
          <span className="freccia">←</span> Sito pubblico
        </Link>

        <div className="dash-team" style={{ '--accent': team.color }}>
          <img src={logoUrl(team)} alt="" />
          <div>
            <strong>{team.name}</strong>
            <span>{sessione.mister ? `Mister ${sessione.mister}` : 'Area privata'}</span>
          </div>
        </div>

        <nav className="dash-nav">
          {VOCI.map((v) => (
            <NavLink key={v.to} to={v.to} end={v.end}>
              <i aria-hidden="true">{v.icona}</i>
              {v.label}
            </NavLink>
          ))}
        </nav>

        <button className="dash-esci" onClick={esci}>Esci</button>

        {anteprima && (
          <p className="dash-anteprima">
            Anteprima senza autenticazione. Con il login vero ogni mister vedrà
            solo la propria società.
          </p>
        )}
      </aside>

      <main className="dash-main">
        <Outlet />
      </main>
    </div>
  )
}
