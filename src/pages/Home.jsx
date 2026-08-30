import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import {
  ACTIVE_TEAMS, capreraLogo, federazioneStemma, dieciAnniBlocco, logoUrl, summary,
  CURRENT_SEASON, LAST_PLAYED_SEASON,
} from '../lib/core'
import { useArchivio, classifica, classificaPerpetua } from '../lib/archivio'
import { Sezione } from '../components/moto'
import './Home.css'

const { totals, nextRound } = summary

export default function Home() {
  const cl = useArchivio(['classifica', LAST_PLAYED_SEASON],
    () => classifica(LAST_PLAYED_SEASON))
  const pe = useArchivio('perpetua', classificaPerpetua)

  /* La classifica dell'ultima stagione, con i nomi di prima. */
  const table = useMemo(
    () => (cl.dati ?? []).map((r) => ({
      team: r.societa, position: r.posizione, points: r.punti,
      played: r.giocate, goalDiff: r.gol_fatti - r.gol_subiti,
    })),
    [cl.dati]
  )

  /* L'albo: il primo di ogni stagione, dalla piu' recente. */
  const albo = useMemo(() => {
    const m = new Map()
    for (const r of pe.dati ?? []) {
      if (r.posizione === 1) m.set(r.stagione, { season: r.stagione, team: r.societa, points: r.punti })
    }
    return [...m.values()].sort((a, b) => b.season.localeCompare(a.season))
  }, [pe.dati])

  return (
    <div className="page home">
      {/* ---------------------------------------------------------- hero */}
      <section className="hero">
        <div className="container wide hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Stagione {CURRENT_SEASON} · Decima edizione</p>
            <h1>
              Dieci società.<br />
              Trentasei giornate.<br />
              <span className="gold">Un solo Governo Tricolore.</span>
            </h1>
            <p className="lede">
              La Federazione Caprera è una lega di fantacalcio con un regolamento
              costituzionale, un mercato a contratti pluriennali e un archivio di
              risultati che risale al 2016. Qui trovi classifiche, rose e statistiche
              di ogni stagione.
            </p>
            <div className="hero-cta">
              <Link to="/classifica" className="btn btn-primary">
                Vedi la classifica
              </Link>
              <Link to="/squadre" className="btn btn-ghost">
                Le società
              </Link>
            </div>
          </div>
          <div className="hero-crest">
            <img src={capreraLogo} alt="Stemma della Caprera League" />
          </div>
        </div>
      </section>

      {/* Dieci anni di Federazione: la stagione 2025-26 è la decima.
          La striscia è composta qui e non è un'immagine unica, così si allarga
          con la pagina e le scritte restano nel carattere del sito. */}
      <section className="decennale">
        <div className="container wide decennale-riga">
          {/* La League sta a sinistra e la Federazione a destra: nell'hero, qui
              sopra, il badge della League e' gia' sulla destra, e trovarselo due
              volte incolonnato sarebbe una ripetizione. */}
          <div className="lato">
            <img src={capreraLogo} alt="Stemma della Caprera League" />
            <p className="motto">Governare è un gioco serio</p>
          </div>

          <div className="centro">
            <img src={dieciAnniBlocco} alt="2016-2026, dieci anni di Caprera" />
          </div>

          <div className="lato">
            <img src={federazioneStemma} alt="Stemma della Federazione Caprera" />
            <p className="motto tricolore">Fantacalcio · Politica · Riforme</p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- stats */}
      <section className="container wide">
        <div className="stat-row">
          <Stat value={totals.seasons} label="Stagioni" />
          <Stat value={totals.matches.toLocaleString('it-IT')} label="Partite giocate" />
          <Stat value={totals.goals.toLocaleString('it-IT')} label="Gol totali" />
          <Stat value={totals.players.toLocaleString('it-IT')} label="Calciatori tesserati" />
        </div>
      </section>

      {/* --------------------------------------------------- teams strip */}
      <section className="container wide block">
        <h2 className="section-title">Le società {CURRENT_SEASON}</h2>
        <div className="team-strip">
          {ACTIVE_TEAMS.map((t) => (
            <Link key={t.id} to={`/squadre/${t.id}`} className="team-chip card">
              <img src={logoUrl(t)} alt="" loading="lazy" />
              <span>{t.name}</span>
              {t.titles.length > 0 && (
                <em title={`${t.titles.length} titoli`}>★ {t.titles.length}</em>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------- last standings */}
      <section className="container wide block">
        <div className="two-col">
          <div>
            <h2 className="section-title">Classifica {LAST_PLAYED_SEASON}</h2>
            <Sezione stato={cl} righe={10}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th className="left">#</th>
                    <th className="left">Società</th>
                    <th>G</th>
                    <th>DR</th>
                    <th>Pt</th>
                  </tr>
                </thead>
                <tbody>
                  {table.map((r) => (
                    <tr key={r.team} className={r.position <= 3 ? 'podium' : undefined}>
                      <td className="num pos">{r.position}</td>
                      <td className="left">
                        <TeamBadge id={r.team} size="sm" />
                      </td>
                      <td className="num muted">{r.played}</td>
                      <td className="num">
                        {r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}
                      </td>
                      <td className="num strong">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </Sezione>
            <Link to="/classifica" className="more-link">
              Tutte le classifiche →
            </Link>
          </div>

          <div>
            <h2 className="section-title">Albo d'oro</h2>
            <Sezione stato={pe} righe={10}>
            <ol className="albo">
              {albo.map((a) => (
                <li key={a.season}>
                  <span className="num season">{a.season}</span>
                  <TeamBadge id={a.team} size="sm" />
                  <span className="num muted">{a.points} pt</span>
                </li>
              ))}
            </ol>
            </Sezione>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ next fixtures */}
      {nextRound && (
        <section className="container wide block">
          <h2 className="section-title">
            Prossima giornata · {CURRENT_SEASON} · {nextRound.round}ª
          </h2>
          <div className="fixture-grid">
            {nextRound.fixtures.map((m, i) => (
              <div key={i} className="fixture card">
                <TeamBadge id={m.home} size="sm" label="short" />
                <span className="vs">vs</span>
                <TeamBadge id={m.away} size="sm" label="short" />
              </div>
            ))}
          </div>
          <Link to="/risultati" className="more-link">
            Calendario completo →
          </Link>
        </section>
      )}

      {/* --------------------------------------------------------- rules */}
      <section className="container wide block">
        <h2 className="section-title">Come funziona</h2>
        <div className="rule-grid">
          <RuleCard
            title="Rosa 6-9-9-7"
            body="Sei portieri (due club di Serie A), nove difensori, nove centrocampisti, sette attaccanti. 250 crediti all'asta, più tre per gli Under."
          />
          <RuleCard
            title="Jobs Act"
            body="Contratti pluriennali con clausola rescissoria. Tetto agli slot: 3 difensori, 3 centrocampisti, 2 attaccanti sotto contratto."
          />
          <RuleCard
            title="Cura Caprera"
            body="I crediti si accumulano di anno in anno. Premi, penalità e assicurazioni regolano il fair play finanziario della lega."
          />
          <RuleCard
            title="Asta libera"
            body="Dal 2025/26 niente più liste: le società chiamano i calciatori a turno, venti secondi per la chiamata e otto per il rilancio."
          />
        </div>
      </section>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="stat card">
      <strong className="num">{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function RuleCard({ title, body }) {
  return (
    <div className="rule card">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  )
}
