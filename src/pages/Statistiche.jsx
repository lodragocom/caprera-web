import { useState } from 'react'
import './Statistiche.css'

const SHINY_URL = 'https://caprera.shinyapps.io/caprera/'

export default function Statistiche() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Dashboard</p>
        <h1>Statistiche</h1>
        <p className="lede">
          La dashboard interattiva della Federazione, con analisi storiche, confronti
          e grafici su tutte le stagioni. È un'applicazione R Shiny di proprietà della
          lega, integrata qui dentro.
        </p>
      </header>

      <div className="shiny-bar">
        <span className={`status${loaded ? ' on' : ''}`}>
          {loaded ? 'Dashboard caricata' : 'Caricamento in corso…'}
        </span>
        <a
          href={SHINY_URL}
          target="_blank"
          rel="noreferrer"
          className="open-link"
        >
          Apri a schermo intero ↗
        </a>
      </div>

      <div className="shiny-frame">
        {!loaded && (
          <div className="shiny-skeleton">
            <div className="spinner" />
            <p>La dashboard può richiedere qualche secondo al primo avvio.</p>
          </div>
        )}
        <iframe
          src={SHINY_URL}
          title="Dashboard statistiche Caprera League"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          allow="fullscreen"
        />
      </div>

      <p className="note">
        Se la dashboard non si carica, il servizio potrebbe essere in stand-by:
        <a href={SHINY_URL} target="_blank" rel="noreferrer"> aprila in una nuova scheda</a> per
        risvegliarlo.
      </p>
    </div>
  )
}
