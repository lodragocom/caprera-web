import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { useAuth } from '../lib/auth'
import {
  getTeam, logoUrl, careerOf, positionHistory, standings, seasons,
  LAST_PLAYED_SEASON, rosterOf, rosterSummary, ROSTER_SEASONS,
  financesOf, FINANCE_SEASONS, contracts, CONTRACT_SEASONS,
  matchesOf, formOf,
} from '../lib/data'
import './AreaMister.css'

const TETTO = { D: 3, C: 3, A: 2 }
const RUOLI = ['P', 'D', 'C', 'A']

export default function AreaMister() {
  const { sessione, esci, anteprima } = useAuth()
  if (!sessione) return <Navigate to="/login" replace />

  const team = getTeam(sessione.team)
  const stagioneRosa = ROSTER_SEASONS[ROSTER_SEASONS.length - 1]
  const rosa = rosterOf(stagioneRosa, team.id)
  const riepilogo = rosterSummary(rosa)
  const career = careerOf(team.id)
  const storia = positionHistory(team.id)
  const finanze = financesOf(FINANCE_SEASONS[FINANCE_SEASONS.length - 1])
    .find((f) => f.team === team.id)

  const ultimaContratti = CONTRACT_SEASONS[CONTRACT_SEASONS.length - 1]
  const contrattiAttivi = contracts.filter(
    (c) => c.team === team.id && c.to === ultimaContratti
  )

  const posizione = standings[LAST_PLAYED_SEASON]?.find((r) => r.team === team.id)
  const forma = formOf(LAST_PLAYED_SEASON, team.id, 5)

  const [nota, setNota] = useState('')

  return (
    <div className="page container wide area">
      {anteprima && (
        <div className="avviso card anteprima-top">
          <strong>Anteprima dell'area riservata.</strong> Stai vedendo i dati di{' '}
          {team.name} senza esserti autenticato. Con il login vero ogni mister
          vedrà solo la propria società.{' '}
          <button className="link-btn" onClick={esci}>Esci</button>
        </div>
      )}

      {/* ------------------------------------------------------- intestazione */}
      <header className="area-hero card" style={{ '--accent': team.color }}>
        <img src={logoUrl(team)} alt="" />
        <div>
          <p className="eyebrow">
            {sessione.mister ? `Mister ${sessione.mister}` : 'Area personale'}
          </p>
          <h1>{team.name}</h1>
          <p className="area-sub">
            {career.seasons} stagioni · {career.points} punti ·{' '}
            {career.titles.length
              ? `campione ${career.titles.join(', ')}`
              : 'nessun titolo, per ora'}
          </p>
        </div>
        <button className="btn btn-ghost esci" onClick={esci}>Esci</button>
      </header>

      {/* -------------------------------------------------------------- KPI */}
      <div className="kpi-row">
        <Kpi label={`Posizione ${LAST_PLAYED_SEASON}`} value={posizione ? `${posizione.position}º` : '—'} />
        <Kpi label="Punti" value={posizione?.points ?? '—'} />
        <Kpi label="Diff. reti" value={posizione ? (posizione.goalDiff > 0 ? `+${posizione.goalDiff}` : posizione.goalDiff) : '—'} />
        <Kpi label="Miglior piazz." value={career.best ? `${career.best}º` : '—'} />
        <Kpi label="Titoli" value={career.titles.length} gold />
        <Kpi label="% vittorie" value={`${career.winRate}%`} />
      </div>

      <div className="area-griglia">
        {/* --------------------------------------------------- colonna sinistra */}
        <div className="col">
          <section className="pannello card">
            <h2>Situazione contratti</h2>
            <p className="pannello-sub">
              Slot occupati sul tetto del regolamento. È il numero da guardare
              prima di ogni operazione di mercato.
            </p>
            <div className="slot-mini">
              {['D', 'C', 'A'].map((r) => {
                const usati = contrattiAttivi.filter((c) => c.role === r).length
                const max = TETTO[r]
                const pieno = usati >= max
                return (
                  <div key={r} className={`sm${pieno ? ' pieno' : ''}`}>
                    <span className={`badge role-${r}`}>{r}</span>
                    <strong className="num">{usati}<i>/{max}</i></strong>
                    <span>
                      {pieno
                        ? 'pieno'
                        : `${max - usati} liber${max - usati === 1 ? 'o' : 'i'}`}
                    </span>
                  </div>
                )
              })}
            </div>
            {contrattiAttivi.length > 0 ? (
              <ul className="lista-contratti">
                {contrattiAttivi.map((c, i) => (
                  <li key={i}>
                    <span className={`badge role-${c.role}`}>{c.role}</span>
                    <b>{c.player}</b>
                    {c.under && <em className="u">Under</em>}
                    <span className="num scad">fino al {c.to}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vuoto">Nessun contratto attivo nei dati disponibili.</p>
            )}
            <Link to="/contratti" className="more-link">Tutti i contratti →</Link>
          </section>

          <section className="pannello card">
            <h2>Bacheca</h2>
            {career.titles.length ? (
              <div className="trofei">
                {career.titles.map((t) => (
                  <div key={t} className="trofeo-mini">
                    <span className="coppa-icona">🏆</span>
                    <div>
                      <strong>Lega Caprera</strong>
                      <span className="num">{t}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="vuoto">
                La bacheca è vuota. Il miglior piazzamento è
                {' '}<b>{career.best}º</b>.
              </p>
            )}
            <p className="pannello-sub">
              Solo il campionato: i trofei di coppa arriveranno quando i tabelloni
              saranno in archivio.
            </p>
          </section>

          <section className="pannello card">
            <h2>Il tuo racconto</h2>
            <p className="pannello-sub">
              Storia della società, soprannomi, imprese e disfatte. Comparirà sulla
              scheda pubblica.
            </p>
            <textarea
              rows="6"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder={`Racconta ${team.name}: come nasce il nome, l'anno d'oro, la delusione che ancora brucia…`}
            />
            <p className="nota-salva">
              {anteprima
                ? 'In anteprima il testo non viene salvato.'
                : 'Salvato automaticamente.'}
            </p>
          </section>
        </div>

        {/* ---------------------------------------------------- colonna destra */}
        <div className="col">
          <section className="pannello card">
            <h2>Crediti</h2>
            {finanze ? (
              <>
                <div className="crediti">
                  <Voce label="Iniziali" v={finanze.initial} />
                  <Voce label="Spesi all'asta" v={finanze.spent} forte />
                  <Voce label="Saldo scambi" v={finanze.trades} segno />
                  <Voce label="Residui" v={finanze.left} />
                  <Voce label="Riportati" v={finanze.carried} />
                  <Voce label="Premi e penalità" v={finanze.bonus} segno />
                </div>
                <Link to="/rose" className="more-link">Bilancio di tutte →</Link>
              </>
            ) : (
              <p className="vuoto">Dati finanziari non disponibili per questa stagione.</p>
            )}
          </section>

          <section className="pannello card">
            <h2>Rosa {stagioneRosa}</h2>
            <div className="rosa-sintesi">
              {RUOLI.map((r) => (
                <span key={r} className="rs">
                  <i className={`badge role-${r}`}>{r}</i>
                  <b className="num">{riepilogo.byRole[r]}</b>
                </span>
              ))}
              <span className="rs tot">
                <i>crediti</i>
                <b className="num">{riepilogo.spent}</b>
              </span>
            </div>
            <ul className="lista-rosa">
              {rosa.slice(0, 12).map((p, i) => (
                <li key={i}>
                  <span className={`badge role-${p.role}`}>{p.role}</span>
                  <b>{p.player}</b>
                  <span className="num costo">{p.cost}</span>
                </li>
              ))}
            </ul>
            {rosa.length > 12 && (
              <p className="pannello-sub">…e altri {rosa.length - 12} calciatori.</p>
            )}
            <Link to={`/squadre/${team.id}`} className="more-link">Scheda completa →</Link>
          </section>

          <section className="pannello card">
            <h2>Andamento</h2>
            <div className="andamento">
              {storia.map((h) => (
                <div key={h.season} className="anno">
                  <span className="num a-lab">{h.season.slice(2)}</span>
                  <span className="a-bar">
                    <i
                      style={{
                        height: `${((11 - h.position) / 10) * 100}%`,
                        background: h.position === 1 ? 'var(--gold-500)' : team.color,
                      }}
                      title={`${h.season}: ${h.position}º, ${h.points} punti`}
                    />
                  </span>
                  <span className="num a-pos">{h.position}</span>
                </div>
              ))}
            </div>
            {forma.length > 0 && (
              <>
                <p className="pannello-sub">Ultime 5 di {LAST_PLAYED_SEASON}</p>
                <div className="forma-mini">
                  {forma.map((f, i) => (
                    <i key={i} className={`dot dot-${f.result}`} title={`${f.round}ª · ${f.score}`}>
                      {f.result}
                    </i>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, value, gold }) {
  return (
    <div className="kpi card">
      <strong className={`num${gold ? ' gold-text' : ''}`}>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function Voce({ label, v, forte, segno }) {
  if (v == null) return null
  const testo = segno && v > 0 ? `+${v}` : v
  return (
    <div className="voce">
      <span>{label}</span>
      <b className={`num${forte ? ' forte' : ''}${segno && v ? ' segno' : ''}`}>{testo}</b>
    </div>
  )
}
