import { Link } from 'react-router-dom'
import { ACTIVE_TEAMS, HISTORIC_TEAMS, logoUrl, careerOf } from '../lib/core'
import { trofeiDi } from '../lib/coppe'
import './Squadre.css'

const byPoints = (a, b) => b.career.points - a.career.points

export default function Squadre() {
  const attive = ACTIVE_TEAMS.map((t) => ({ ...t, career: careerOf(t.id) })).sort(byPoints)
  const storiche = HISTORIC_TEAMS.map((t) => ({ ...t, career: careerOf(t.id) })).sort(byPoints)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Partecipanti</p>
        <h1>Le società</h1>
        <p className="lede">
          Dieci S.r.l. fantacalcistiche, alcune fondate nel 2016. Ordinate per punti
          totali conquistati in campionato.
        </p>
      </header>

      <div className="team-grid">
        {attive.map((t) => (
          <TeamCard key={t.id} t={t} />
        ))}
      </div>

      {storiche.length > 0 && (
        <section className="storiche">
          <h2 className="section-title">Non più in attività</h2>
          <p className="lede">
            Società che hanno partecipato al campionato in passato. I loro risultati
            restano nell'archivio e nella classifica perpetua.
          </p>
          <div className="team-grid">
            {storiche.map((t) => (
              <TeamCard key={t.id} t={t} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function TeamCard({ t }) {
  const src = logoUrl(t)
  return (
    <Link to={`/squadre/${t.id}`} className={`team-card card${t.active ? '' : ' inactive'}`}>
      <span className="team-accent" style={{ background: t.color }} />
      {src ? (
        <img src={src} alt="" loading="lazy" />
      ) : (
        <span className="team-crest-fallback" style={{ background: t.color }}>
          {t.code}
        </span>
      )}
      <div className="team-card-body">
        <h2>{t.name}</h2>
        <p className="code num">
          {t.code}
          {!t.active && (
            <span className="years">
              {' · '}
              {t.seasons[0]} – {t.seasons[t.seasons.length - 1]}
            </span>
          )}
        </p>
        <dl>
          <div>
            <dt>Stagioni</dt>
            <dd className="num">{t.career.seasons}</dd>
          </div>
          <div>
            <dt>Punti</dt>
            <dd className="num">{t.career.points}</dd>
          </div>
          <div>
            <dt>Vittorie</dt>
            <dd className="num">{t.career.winRate}%</dd>
          </div>
          <div>
            <dt>Titoli</dt>
            <dd className="num gold-text">{t.career.titles.length || '—'}</dd>
          </div>
          <div>
            <dt>Coppe</dt>
            <dd className="num gold-text">
              {trofeiDi(t.id).filter((x) => x.id !== 'campionato').length || '—'}
            </dd>
          </div>
        </dl>
      </div>
    </Link>
  )
}
