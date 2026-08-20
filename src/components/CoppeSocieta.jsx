import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TeamBadge from './TeamBadge'
import { getTeam } from '../lib/core'
import { trofeiDi, percorsoDi, stagioniCoppeDi } from '../lib/coppe'
import './CoppeSocieta.css'

/**
 * Le coppe viste dalla parte di una societa'.
 *
 * Stesso componente per la scheda pubblica e per la dashboard del mister: il
 * percorso in Coppa Italia e' lo stesso fatto, cambia solo chi lo guarda, e
 * tenerlo in un posto solo evita che le due pagine col tempo si contraddicano.
 */

/* Ogni competizione ha il suo colore, gli stessi della pagina Coppe. */
const COLORE = {
  campionato: '#a8863f',
  'coppa-italia': '#6e0f0f',
  champions: '#2a1a6b',
  'europa-league': '#b0803a',
  'conference-league': '#0f5a3c',
  'supercoppa-europea': '#5a2020',
  'supercoppa-italiana': '#7a1010',
  'qualificazione-champions': '#1f4d7a',
  fantapunti: '#6b1f33',
}

/** Tutti i trofei vinti, dal piu' recente. */
export function Bacheca({ teamId, titolo = 'Bacheca' }) {
  const trofei = trofeiDi(teamId)
  if (!trofei.length) {
    return (
      <section className="block">
        <h2 className="section-title">{titolo}</h2>
        <p className="muted">Bacheca ancora vuota.</p>
      </section>
    )
  }
  return (
    <section className="block">
      <h2 className="section-title">{titolo}</h2>
      <p className="lede">
        {trofei.length} {trofei.length === 1 ? 'trofeo' : 'trofei'}, dal più recente.
      </p>
      <div className="bacheca">
        {trofei.map((t, i) => (
          <Link key={i} to="/coppe" className="trofeo-card card"
                style={{ '--accent': COLORE[t.id] ?? 'var(--gold-500)' }}>
            <span className="coppa-icona" aria-hidden="true">🏆</span>
            <strong>{t.nome}</strong>
            <span className="num anno">{t.stagione}</span>
            {t.aiFantapunti && <em className="dettaglio">ai fantapunti</em>}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* Le gare di un turno, viste dalla societa': in casa o in trasferta. */
function Gara({ p, teamId }) {
  const inCasa = p.casa === teamId
  const gf = inCasa ? p.golCasa : p.golFuori
  const gs = inCasa ? p.golFuori : p.golCasa
  const esito = gf > gs ? 'V' : gf === gs ? 'N' : 'P'
  return (
    <div className="gara">
      <span className={`ha${inCasa ? ' is-home' : ''}`} title={inCasa ? 'in casa' : 'in trasferta'}>
        {inCasa ? 'C' : 'T'}
      </span>
      <TeamBadge id={inCasa ? p.fuori : p.casa} size="sm" label="short" />
      <span className="num gara-score">{gf}–{gs}</span>
      <i className={`dot dot-${esito}`}>{esito}</i>
      <span className="num gara-fp">{inCasa ? p.fpCasa : p.fpFuori} fp</span>
    </div>
  )
}

/** Il cammino di una societa' nelle coppe di una stagione. */
export function PercorsoCoppe({ teamId, titolo = 'Percorso in coppa' }) {
  const stagioni = useMemo(() => stagioniCoppeDi(teamId), [teamId])
  const [stagione, setStagione] = useState(stagioni[0])
  const percorso = useMemo(
    () => (stagione ? percorsoDi(teamId, stagione) : []),
    [teamId, stagione]
  )

  if (!stagioni.length) return null

  return (
    <section className="block">
      <h2 className="section-title">{titolo}</h2>
      <div className="scelta-stagione">
        {stagioni.map((s) => (
          <button key={s} className={s === stagione ? 'on' : ''}
                  onClick={() => setStagione(s)}>{s}</button>
        ))}
      </div>

      <div className="percorso">
        {percorso.map((c) => (
          <article key={c.id} className={c.vinta ? 'tappa card vinta' : 'tappa card'}
                   style={{ '--accent': COLORE[c.id] ?? 'var(--gold-500)' }}>
            <header>
              <h3>{c.nome}</h3>
              <span className={`esito ${c.vinta ? 'oro' : ''}`}>{c.esito}</span>
            </header>
            {c.dettaglio && <p className="tappa-nota">{c.dettaglio}</p>}

            {c.turni.map((t) => (
              <div key={t.titolo} className="turno-mio">
                <h4>{t.titolo}</h4>
                {t.consolazione && (
                  <p className="tappa-nota">
                    Gara fra le due perdenti delle semifinali: la registra Fantapazz,
                    il regolamento non prevede una finale per il terzo posto.
                  </p>
                )}
                {t.sfide.map((s, i) => (
                  <div key={i} className="sfida-mia">
                    {s.legs.map((p, j) => <Gara key={j} p={p} teamId={teamId} />)}
                    {!t.girone && s.vincente && (
                      <p className="verdetto">
                        {verdetto(t.titolo, s.vincente === teamId)}{' '}
                        <strong>{getTeam(s.vincente)?.name}</strong>
                        {s.andataRitorno && <span className="agg"> {aggregato(s, teamId)}</span>}
                        {s.come && <span className="come"> ai {s.come}</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  )
}

/* Dalla finale non si "passa": si vince o si perde. */
function verdetto(titolo, nostra) {
  if (titolo.startsWith('Finale')) return 'vince'
  return nostra ? 'passa' : 'eliminata da'
}

/* Il totale di andata e ritorno letto dalla parte della societa'. */
function aggregato(s, teamId) {
  const i = s.squadre.indexOf(teamId)
  return i === 1 ? `${s.aggregato[1]}-${s.aggregato[0]}` : `${s.aggregato[0]}-${s.aggregato[1]}`
}
