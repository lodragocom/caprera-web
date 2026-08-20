import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import {
  seasons, ACTIVE_TEAMS, HISTORIC_TEAMS, matchesOf, roundsOf, CURRENT_SEASON,
} from '../lib/data'
import { competizioniDi, turniDi } from '../lib/coppe'
import './Risultati.css'

export default function Risultati() {
  const [season, setSeason] = useState(CURRENT_SEASON)
  const [team, setTeam] = useState('')
  const [comp, setComp] = useState('campionato')

  const rounds = roundsOf(season)
  const [round, setRound] = useState(null) // null = tutte

  const coppe = useMemo(() => competizioniDi(season), [season])

  /**
   * Un solo elenco di blocchi, sia per il campionato sia per le coppe: le
   * giornate diventano "1ª giornata", i turni di coppa "Quarti Andata" e via
   * dicendo. Cosi' sotto non serve distinguere.
   */
  const blocchi = useMemo(() => {
    if (comp !== 'campionato') return turniDi(comp, season, team || null)

    let ms = matchesOf(season, team || null)
    if (round != null) ms = ms.filter((m) => m.round === round)
    const map = new Map()
    for (const m of ms) {
      if (!map.has(m.round)) map.set(m.round, [])
      map.get(m.round).push(m)
    }
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([r, partite]) => ({ titolo: `${r}ª giornata`, partite }))
  }, [comp, season, team, round])

  function changeSeason(s) {
    setSeason(s)
    setRound(null)
    // una coppa puo' non esistere nella stagione scelta
    if (comp !== 'campionato' && !competizioniDi(s).some((c) => c.id === comp)) {
      setComp('campionato')
    }
  }

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Calendario</p>
        <h1>Risultati</h1>
        <p className="lede">
          Campionato e coppe, partita per partita. Il punteggio grande è il
          risultato in gol, quello piccolo i fantapunti realizzati.
        </p>
      </header>

      <div className="controls">
        <div className="field">
          <label htmlFor="rs">Stagione</label>
          <select id="rs" value={season} onChange={(e) => changeSeason(e.target.value)}>
            {[...seasons].reverse().map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rc">Competizione</label>
          <select id="rc" value={comp} onChange={(e) => setComp(e.target.value)}>
            <option value="campionato">Campionato</option>
            {coppe.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rt">Società</label>
          <select id="rt" value={team} onChange={(e) => setTeam(e.target.value)}>
            <option value="">Tutte</option>
            {ACTIVE_TEAMS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
            {HISTORIC_TEAMS.length > 0 && (
              <optgroup label="Non piu' in attivita'">
                {HISTORIC_TEAMS.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {comp === 'campionato' && (
          <div className="field">
            <label htmlFor="rr">Giornata</label>
            <select
              id="rr"
              value={round ?? ''}
              onChange={(e) => setRound(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Tutte</option>
              {Array.from({ length: rounds }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r}>{r}ª giornata</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {blocchi.length === 0 ? (
        <p className="empty">Nessuna partita per questi filtri.</p>
      ) : (
        blocchi.map((b) => (
          <section key={b.titolo} className="round-block">
            <h2 className="round-title">
              <span>{b.titolo}</span>
              {!b.partite.some((m) => m.played) && <em>da giocare</em>}
            </h2>
            <div className="match-grid">
              {b.partite.map((m, i) => (
                <Match key={i} m={m} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}

function Match({ m }) {
  const homeWin = m.played && m.homeGoals > m.awayGoals
  const awayWin = m.played && m.awayGoals > m.homeGoals

  return (
    <article className={`match card${m.played ? '' : ' pending'}`}>
      <div className={`side${homeWin ? ' win' : ''}`}>
        <TeamBadge id={m.home} size="sm" label="short" />
      </div>

      <div className="score">
        {m.played ? (
          <>
            <strong className="num">
              {m.homeGoals}<span className="sep">–</span>{m.awayGoals}
            </strong>
            <span className="num fp">
              {m.homeFp?.toFixed(1)} · {m.awayFp?.toFixed(1)}
            </span>
          </>
        ) : (
          <span className="num tbd">vs</span>
        )}
      </div>

      <div className={`side away${awayWin ? ' win' : ''}`}>
        <TeamBadge id={m.away} size="sm" label="short" />
      </div>
    </article>
  )
}
