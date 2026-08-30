import { NavLink, Outlet, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { ACTIVE_TEAMS, getTeam, logoUrl } from '../lib/core'
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
  { to: '/area/tessera', label: 'La mia tessera', icona: '▤' },
]

/* Il governo della lega. Sta staccata perche' non e' una sezione in piu':
   la vede solo chi ha un incarico con `vede_tutto`, e il resto della lega
   non deve nemmeno sapere che esiste. Nasconderla non e' pero' la sicurezza:
   quella la fanno le funzioni, che si chiudono su caprera.vede_tutto(). */
const VOCI_GOVERNO = [
  { to: '/area/diario', label: 'Diario', icona: '✦' },
  { to: '/area/federazione', label: 'Presidenza', icona: '⚑' },
  { to: '/area/atti', label: 'Atti di governo', icona: '§' },
  { to: '/area/clausole', label: 'Clausole', icona: '⚖' },
  { to: '/area/stagione', label: 'Stagione', icona: '⊞' },
]

export default function AreaLayout() {
  const { sessione, esci, pronto, incarichi, inVisita, guarda } = useAuth()

  // Finche' non si sa, non si decide: rimandare al login un mister che ha la
  // sessione valida e' il modo piu' rapido per fargli credere di essere stato
  // buttato fuori.
  if (!pronto) return <p className="vuoto">Controllo la tessera…</p>
  if (!sessione) return <Navigate to="/login" replace />

  const team = getTeam(sessione.team)
  const oltre = incarichi.filter((i) => i.incarico !== 'mister')
  const vedeTutto = incarichi.some((i) => i.vede_tutto)

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link to="/" className="dash-brand" title="Torna al sito pubblico">
          <span className="freccia">←</span> Sito pubblico
        </Link>

        <div className={`dash-team ${inVisita ? 'in-visita' : ''}`}
             style={{ '--accent': team.color }}>
          <img src={logoUrl(team)} alt="" />
          <div>
            <strong>{team.name}</strong>
            <span>
              {inVisita
                ? 'Stai guardando questa società'
                : sessione.mister ? `Mister ${sessione.mister}` : 'Area privata'}
            </span>
          </div>
        </div>

        {/*
          Il cambio società, per chi ha un incarico che vede tutto.
          Non cambia chi sei per il database - cambia solo cosa chiedi -, ma
          va detto forte lo stesso: guardare la scrivania di un altro senza
          accorgersene e' il modo migliore per credere che un errore sia suo.
        */}
        {vedeTutto && (
          <div className="dash-visita">
            <label htmlFor="dash-societa">Guarda la società</label>
            <select id="dash-societa" value={sessione.team}
                    onChange={(e) => guarda(e.target.value)}>
              {ACTIVE_TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}{t.id === sessione.miaSocieta ? ' — la mia' : ''}
                </option>
              ))}
            </select>
            {inVisita && (
              <button type="button" className="dash-torna" onClick={() => guarda(null)}>
                ← Torna alla mia
              </button>
            )}
          </div>
        )}

        <nav className="dash-nav">
          {VOCI.map((v) => (
            <NavLink key={v.to} to={v.to} end={v.end}>
              <i aria-hidden="true">{v.icona}</i>
              {v.label}
            </NavLink>
          ))}
          {vedeTutto && VOCI_GOVERNO.map((v) => (
            <NavLink key={v.to} to={v.to} className="dash-governo">
              <i aria-hidden="true">{v.icona}</i>
              {v.label}
            </NavLink>
          ))}
        </nav>

        <button className="dash-esci" onClick={esci}>Esci</button>

        {/*
          Gli incarichi oltre a quello di mister: chi li ha vede piu' di una
          societa', e deve saperlo. Chi guida solo la sua non legge niente,
          che e' meglio di leggere "nessun incarico".
        */}
        {oltre.length > 0 && (
          <div className="dash-incarichi">
            <p className="dash-incarichi-tit">Incarichi di lega</p>
            <ul>
              {oltre.map((i) => (
                <li key={i.incarico} className={i.vede_tutto ? 'alto' : ''}>{i.nome}</li>
              ))}
            </ul>
            {oltre.some((i) => i.vede_tutto) && (
              <p className="dash-anteprima">
                Oltre alla tua società vedi anche i dati delle altre.
              </p>
            )}
          </div>
        )}
      </aside>

      <main className="dash-main">
        {inVisita && (
          <p className="dash-avviso-visita">
            Stai guardando l’area di <strong>{team.name}</strong>, non la tua.
            Quello che vedi è quello che vedrà il suo mister.
            <button type="button" onClick={() => guarda(null)}>Torna alla mia</button>
          </p>
        )}
        <Outlet />
      </main>
    </div>
  )
}
