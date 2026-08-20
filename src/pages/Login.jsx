import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ACTIVE_TEAMS, logoUrl, capreraLogo } from '../lib/core'
import { useAuth } from '../lib/auth'
import './Login.css'

export default function Login() {
  const { entra } = useAuth()
  const nav = useNavigate()
  const [scelta, setScelta] = useState(null)
  const [nome, setNome] = useState('')

  function conferma() {
    if (!scelta) return
    entra(scelta, nome.trim())
    nav('/area')
  }

  return (
    <div className="page container login-page">
      <div className="login-box card">
        <img src={capreraLogo} alt="" className="login-crest" />
        <p className="eyebrow">Area riservata</p>
        <h1>Entra come mister</h1>

        <div className="avviso card anteprima">
          <strong>Anteprima.</strong> L'autenticazione vera non è ancora attiva:
          per ora si sceglie la propria società da questo elenco, senza password.
          Serve a provare la struttura dell'area personale. Quando ci sarà il
          login, l'accesso avverrà via email e nessuno potrà vedere i dati di
          un'altra società.
        </div>

        <p className="login-lab">La tua società</p>
        <div className="scelta-grid">
          {ACTIVE_TEAMS.map((t) => (
            <button
              key={t.id}
              className={`scelta${scelta === t.id ? ' on' : ''}`}
              style={scelta === t.id ? { borderColor: t.color } : undefined}
              onClick={() => setScelta(t.id)}
              aria-pressed={scelta === t.id}
            >
              <img src={logoUrl(t)} alt="" loading="lazy" />
              <span>{t.short ?? t.name}</span>
            </button>
          ))}
        </div>

        <label className="campo">
          <span>Il tuo nome (facoltativo)</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Come ti chiamano in chat"
            onKeyDown={(e) => e.key === 'Enter' && conferma()}
          />
        </label>

        <button className="btn btn-primary login-go" disabled={!scelta} onClick={conferma}>
          {scelta ? 'Entra' : 'Scegli una società'}
        </button>
      </div>
    </div>
  )
}
