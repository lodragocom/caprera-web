import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { federazioneStemma, capreraLogo } from '../lib/core'
import { useAuth } from '../lib/auth'
import { apriConsenso } from '../lib/consenso'
import './Layout.css'

/**
 * Il menu rispecchia quello della dashboard della Federazione (Lega / Clubs),
 * così chi usa entrambe si orienta allo stesso modo.
 * `soon: true` = sezione presente nella dashboard ma non ancora qui.
 */
const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/classifica', label: 'Classifica' },
  {
    label: 'Lega',
    items: [
      { to: '/risultati', label: 'Calendario' },
      { to: '/giocatori', label: 'Giocatori' },
      { to: '/albo-doro', label: "Albo d'oro" },
      { to: '/coppe', label: 'Coppe' },
      { to: '/asta', label: 'Asta' },
      { to: '/regolamento', label: 'Regolamento' },
      { to: '/assicurazioni', label: 'Assicurazioni' },
    ],
  },
  {
    label: 'Clubs',
    items: [
      { to: '/squadre', label: 'Società' },
      { to: '/rose', label: 'Rose e crediti' },
      { to: '/contratti', label: 'Contratti' },
      { to: '/stats', label: 'Record e stats' },
      { to: '/ranking', label: 'Ranking' },
    ],
  },
  { to: '/statistiche', label: 'Statistiche' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [aperto, setAperto] = useState(null)
  const navRef = useRef(null)
  const { sessione } = useAuth()
  const { pathname } = useLocation()

  // ogni cambio di rotta chiude sia il menu mobile sia la tendina aperta
  useEffect(() => {
    setAperto(null)
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function fuori(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setAperto(null)
    }
    document.addEventListener('click', fuori)
    return () => document.removeEventListener('click', fuori)
  }, [])

  return (
    <>
      <header className="site-header">
        <div className="container wide header-inner">
          <Link to="/" className="brand">
            <img src={federazioneStemma} alt="" width="42" height="42" />
            <span>
              <strong>Federazione Caprera</strong>
              <em>Governo Tricolore · dal 2016</em>
            </span>
          </Link>

          <button
            className="burger"
            aria-label="Apri il menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`site-nav${open ? ' open' : ''}`} ref={navRef}>
            {NAV.map((v) =>
              v.items ? (
                <div key={v.label} className="dd">
                  <button
                    className={`dd-trigger${aperto === v.label ? ' on' : ''}`}
                    aria-expanded={aperto === v.label}
                    onClick={() => setAperto((a) => (a === v.label ? null : v.label))}
                  >
                    {v.label}
                    <i aria-hidden="true">▾</i>
                  </button>
                  {aperto === v.label && (
                    <div className="dd-menu">
                      {v.items.map((it) =>
                        it.soon ? (
                          <span key={it.label} className="dd-soon">
                            {it.label}
                            <em>presto</em>
                          </span>
                        ) : (
                          <NavLink key={it.to} to={it.to}>
                            {it.label}
                          </NavLink>
                        )
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink key={v.to} to={v.to} end={v.end}>
                  {v.label}
                </NavLink>
              )
            )}
            <NavLink to={sessione ? '/area' : '/login'} className="accesso">
              {sessione ? 'Area mister' : 'Accedi'}
            </NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container wide footer-inner">
          <div>
            <img src={capreraLogo} alt="Caprera League" width="64" height="64" />
          </div>
          <div className="footer-cols">
            <div>
              <h4>Lega</h4>
              <Link to="/classifica">Classifica</Link>
              <Link to="/risultati">Calendario</Link>
              <Link to="/giocatori">Giocatori</Link>
              <Link to="/albo-doro">Albo d'oro</Link>
              <Link to="/coppe">Coppe</Link>
              <Link to="/asta">Asta</Link>
              <Link to="/regolamento">Regolamento</Link>
            </div>
            <div>
              <h4>Clubs</h4>
              <Link to="/squadre">Società</Link>
              <Link to="/rose">Rose e crediti</Link>
              <Link to="/contratti">Contratti</Link>
              <Link to="/stats">Record e stats</Link>
              <Link to="/ranking">Ranking</Link>
              <Link to="/statistiche">Dashboard</Link>
            </div>
            <div>
              <h4>Presidenza</h4>
              <a href="mailto:federazionecaprera@gmail.com">
                federazionecaprera@gmail.com
              </a>
              <a href="https://federazionecaprera.com/" target="_blank" rel="noreferrer">
                Sito storico
              </a>
              <a href="https://twitter.com/CapreraLeague" target="_blank" rel="noreferrer">
                @CapreraLeague
              </a>
              <Link to="/login">Area mister</Link>
              <span className="muted">
                Valgono solo le comunicazioni scritte via email.
              </span>
            </div>
          </div>
        </div>
        <div className="container wide copyright">
          © {new Date().getFullYear()} Federazione Caprera · Tutti i diritti riservati
          {/* In fondo e senza enfasi, ma su ogni pagina: e' li' che si cercano. */}
          <span className="copyright-legale">
            <Link to="/privacy">Privacy</Link>
            <Link to="/termini">Termini</Link>
            <button type="button" onClick={apriConsenso}>Cookie</button>
          </span>
        </div>
      </footer>
    </>
  )
}
