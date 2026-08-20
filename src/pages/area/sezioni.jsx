import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import {
  getTeam, careerOf, positionHistory, standings,
  LAST_PLAYED_SEASON, rosterOf, rosterSummary, ROSTER_SEASONS,
  financesOf, FINANCE_SEASONS, contracts, CONTRACT_SEASONS, formOf,
} from '../../lib/data'
import { bachecaTrofei, percorsoDi, STAGIONE_COPPE } from '../../lib/coppe'
import { Bacheca, PercorsoCoppe } from '../../components/CoppeSocieta'
import './sezioni.css'

const TETTO = { D: 3, C: 3, A: 2 }
const RUOLI = ['P', 'D', 'C', 'A']

/** Dati della societa' in sessione, calcolati una volta per sezione. */
function useSocieta() {
  const { sessione, anteprima } = useAuth()
  const team = getTeam(sessione.team)
  const stagioneRosa = ROSTER_SEASONS[ROSTER_SEASONS.length - 1]
  const stagioneContratti = CONTRACT_SEASONS[CONTRACT_SEASONS.length - 1]
  return {
    anteprima,
    team,
    stagioneRosa,
    rosa: rosterOf(stagioneRosa, team.id),
    career: careerOf(team.id),
    storia: positionHistory(team.id),
    finanze: financesOf(FINANCE_SEASONS[FINANCE_SEASONS.length - 1])
      .find((f) => f.team === team.id),
    contrattiAttivi: contracts.filter(
      (c) => c.team === team.id && c.to === stagioneContratti
    ),
    tuttiContratti: contracts.filter((c) => c.team === team.id),
    posizione: standings[LAST_PLAYED_SEASON]?.find((r) => r.team === team.id),
    forma: formOf(LAST_PLAYED_SEASON, team.id, 5),
    coppe: bachecaTrofei(team.id).filter((t) => t.id !== 'campionato'),
  }
}

/* ==================================================== 1 · Panoramica */
export function Panoramica() {
  const d = useSocieta()

  return (
    <>
      <header>
        <p className="eyebrow">Panoramica</p>
        <h1>Buongiorno, {d.team.name}</h1>
      </header>

      <div className="kpi-row">
        <Kpi label={`Posizione ${LAST_PLAYED_SEASON}`} value={d.posizione ? `${d.posizione.position}º` : '—'} />
        <Kpi label="Punti" value={d.posizione?.points ?? '—'} />
        <Kpi label="Diff. reti" value={d.posizione ? segno(d.posizione.goalDiff) : '—'} />
        <Kpi label="Titoli" value={d.career.titles.length} gold />
        <Kpi label="Coppe vinte" value={d.coppe.reduce((n, c) => n + c.n, 0)} gold />
        <Kpi label="Crediti residui" value={d.finanze?.left ?? '—'} />
        <Kpi label="Slot liberi" value={liberiTot(d.contrattiAttivi)} />
      </div>

      <div className="due">
        <section className="pannello card">
          <h2>Da tenere d'occhio</h2>
          <ul className="avvisi">
            {avvisi(d).map((a, i) => (
              <li key={i} className={a.tipo}>
                <b>{a.titolo}</b>
                <span>{a.testo}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="pannello card">
          <h2>Ultime 5 · {LAST_PLAYED_SEASON}</h2>
          {d.forma.length ? (
            <>
              <div className="forma-mini">
                {d.forma.map((f, i) => (
                  <i key={i} className={`dot dot-${f.result}`} title={`${f.round}ª · ${f.score}`}>
                    {f.result}
                  </i>
                ))}
              </div>
              <ul className="ultime">
                {d.forma.map((f, i) => (
                  <li key={i}>
                    <span className="num g">{f.round}ª</span>
                    <span className="avversario">
                      <em>{f.home ? 'in casa con' : 'in casa di'}</em>
                      {getTeam(f.opponent)?.name ?? f.opponent}
                    </span>
                    <b className="num">{f.score}</b>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="vuoto">Nessuna partita registrata.</p>
          )}

          {d.coppe.length > 0 && (
            <p className="coppe-mister">
              {d.coppe.map((c) => (
                <span key={c.id} title={c.stagioni.join(' · ')}>
                  {c.nome}{c.n > 1 && <b> ×{c.n}</b>}
                </span>
              ))}
            </p>
          )}
        </section>
      </div>
    </>
  )
}

/* ========================================================= 2 · Rosa */
export function Rosa() {
  const d = useSocieta()
  const r = rosterSummary(d.rosa)

  return (
    <>
      <header>
        <p className="eyebrow">Stagione {d.stagioneRosa}</p>
        <h1>La mia rosa</h1>
      </header>

      <div className="kpi-row">
        {RUOLI.map((ruolo) => (
          <Kpi key={ruolo} label={nomeRuolo(ruolo)} value={r.byRole[ruolo]} />
        ))}
        <Kpi label="Crediti spesi" value={r.spent} gold />
        <Kpi label="Calciatori" value={r.size} />
      </div>

      {RUOLI.map((ruolo) => {
        const gruppo = d.rosa.filter((p) => p.role === ruolo)
        if (!gruppo.length) return null
        return (
          <section key={ruolo} className="pannello card reparto">
            <h2>
              <span className={`badge role-${ruolo}`}>{ruolo}</span>
              {nomeRuolo(ruolo)}
              <em>{gruppo.reduce((n, p) => n + (p.cost ?? 0), 0)} crediti</em>
            </h2>
            <ul className="lista-rosa">
              {gruppo.map((p, i) => (
                <li key={i}>
                  <b>{p.player}</b>
                  {p.club && <span className="num club">{p.club}</span>}
                  <span className="num costo">{p.cost}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}

/* ==================================================== 3 · Contratti */
export function Contratti() {
  const d = useSocieta()

  return (
    <>
      <header>
        <p className="eyebrow">Jobs Act</p>
        <h1>Contratti</h1>
      </header>

      <section className="pannello card">
        <h2>Slot per ruolo</h2>
        <p className="pannello-sub">
          Il tetto del regolamento dal 2025/26. Senza slot libero non si può
          firmare, rinnovare, né ereditare un contratto in uno scambio.
        </p>
        <div className="slot-mini">
          {['D', 'C', 'A'].map((ruolo) => {
            const usati = d.contrattiAttivi.filter((c) => c.role === ruolo).length
            const max = TETTO[ruolo]
            const pieno = usati >= max
            return (
              <div key={ruolo} className={`sm${pieno ? ' pieno' : ''}`}>
                <span className={`badge role-${ruolo}`}>{ruolo}</span>
                <strong className="num">{usati}<i>/{max}</i></strong>
                <span>
                  {pieno ? 'pieno' : `${max - usati} liber${max - usati === 1 ? 'o' : 'i'}`}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="pannello card">
        <h2>Attivi</h2>
        {d.contrattiAttivi.length ? (
          <ul className="lista-contratti">
            {d.contrattiAttivi.map((c, i) => (
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
      </section>

      <section className="pannello card">
        <h2>Storico</h2>
        <p className="pannello-sub">
          Tutti i contratti mai stipulati dalla società, dal più recente.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">R</th>
                <th className="left">Calciatore</th>
                <th>Anni</th>
                <th className="left">Periodo</th>
              </tr>
            </thead>
            <tbody>
              {[...d.tuttiContratti]
                .sort((a, b) => b.from.localeCompare(a.from) || a.player.localeCompare(b.player))
                .map((c, i) => (
                  <tr key={i}>
                    <td className="left"><span className={`badge role-${c.role}`}>{c.role}</span></td>
                    <td className="left strong">
                      {c.player}{c.under && <span className="under"> ★</span>}
                    </td>
                    <td className="num">{c.years}</td>
                    <td className="left num periodo">
                      {c.from === c.to ? c.from : `${c.from} → ${c.to}`}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Link to="/contratti" className="more-link">Contratti di tutta la lega →</Link>
      </section>
    </>
  )
}

/* ====================================================== 4 · Crediti */
export function Crediti() {
  const d = useSocieta()

  if (!d.finanze) {
    return (
      <>
        <header>
          <p className="eyebrow">Cura Caprera</p>
          <h1>Crediti</h1>
        </header>
        <p className="vuoto">Dati finanziari non disponibili per questa stagione.</p>
      </>
    )
  }

  const f = d.finanze
  return (
    <>
      <header>
        <p className="eyebrow">Cura Caprera</p>
        <h1>Crediti</h1>
      </header>

      <div className="kpi-row">
        <Kpi label="Iniziali" value={f.initial} />
        <Kpi label="Spesi all'asta" value={f.spent} />
        <Kpi label="Residui" value={f.left} gold />
        <Kpi label="Riportati" value={f.carried} />
      </div>

      <section className="pannello card">
        <h2>Come si compone il budget</h2>
        <p className="pannello-sub">
          250 crediti di base, più metà dei risparmi dell'anno prima, più premi e
          penalità. Il saldo scambi è quanto hai incassato o speso fuori asta.
        </p>
        <div className="flusso">
          <Riga label="Crediti iniziali" v={f.initial} />
          <Riga label="Spesi all'asta" v={f.spent != null ? -f.spent : null} />
          {f.trades ? <Riga label="Saldo scambi" v={f.trades} /> : null}
          <Riga label="Residui" v={f.left} totale />
        </div>
      </section>

      <section className="pannello card">
        <h2>Voci accessorie</h2>
        <div className="flusso">
          <Riga label="Crediti riportati" v={f.carried} />
          <Riga label="Premi e penalità" v={f.bonus} />
          <Riga label="Bonus Fair Play Finanziario" v={f.ffp} />
        </div>
        <Link to="/rose" className="more-link">Bilancio di tutte le società →</Link>
      </section>
    </>
  )
}

/* ======================================================= 5 · Storia */
export function Storia() {
  const d = useSocieta()
  const [nota, setNota] = useState('')

  return (
    <>
      <header>
        <p className="eyebrow">Identità</p>
        <h1>Storia e racconto</h1>
      </header>

      <div className="kpi-row">
        <Kpi label="Stagioni" value={d.career.seasons} />
        <Kpi label="Partite" value={d.career.played} />
        <Kpi label="Punti" value={d.career.points} />
        <Kpi label="% vittorie" value={`${d.career.winRate}%`} />
        <Kpi label="Miglior piazz." value={d.career.best ? `${d.career.best}º` : '—'} />
        <Kpi label="Titoli" value={d.career.titles.length} gold />
        <Kpi label="Coppe vinte" value={d.coppe.reduce((n, c) => n + c.n, 0)} gold />
      </div>

      <div className="due">
        <section className="pannello card">
          <h2>Bacheca</h2>
          {d.career.titles.length ? (
            <div className="trofei">
              {d.career.titles.map((t) => (
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
              Bacheca vuota. Miglior piazzamento: <b>{d.career.best}º</b>.
            </p>
          )}
        </section>

        <section className="pannello card">
          <h2>Andamento</h2>
          <div className="andamento">
            {d.storia.map((h) => (
              <div key={h.season} className="anno">
                <span className="num a-lab">{h.season.slice(2)}</span>
                <span className="a-bar">
                  <i
                    style={{
                      height: `${((11 - h.position) / 10) * 100}%`,
                      background: h.position === 1 ? 'var(--gold-500)' : d.team.color,
                    }}
                    title={`${h.season}: ${h.position}º, ${h.points} punti`}
                  />
                </span>
                <span className="num a-pos">{h.position}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="pannello card">
        <h2>Il tuo racconto</h2>
        <p className="pannello-sub">
          Come nasce il nome, l'anno d'oro, la delusione che ancora brucia.
          Comparirà sulla scheda pubblica della società.
        </p>
        <textarea
          rows="8"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder={`Racconta ${d.team.name}…`}
        />
        <p className="nota-salva">
          {d.anteprima
            ? 'In anteprima il testo non viene salvato.'
            : 'Salvato automaticamente.'}
        </p>
      </section>
    </>
  )
}

/* ========================================================= 6 · Coppe */
export function Coppe() {
  const d = useSocieta()
  const corrente = percorsoDi(d.team.id, STAGIONE_COPPE)
  const vinteQuest = corrente.filter((c) => c.vinta)

  return (
    <>
      <header>
        <p className="eyebrow">Competizioni</p>
        <h1>Le coppe di {d.team.name}</h1>
      </header>

      <div className="kpi-row">
        <Kpi label="Coppe vinte" value={d.coppe.reduce((n, c) => n + c.n, 0)} gold />
        <Kpi label="Competizioni diverse" value={d.coppe.length} />
        <Kpi label={`In corsa ${STAGIONE_COPPE}`} value={corrente.length} />
        <Kpi label={`Vinte ${STAGIONE_COPPE}`} value={vinteQuest.length} gold />
        <Kpi label="Titoli di lega" value={d.career.titles.length} gold />
      </div>

      {/* Quest'anno prima di tutto: e' la stagione che il mister sta vivendo. */}
      <section className="pannello card">
        <h2>Stagione {STAGIONE_COPPE}</h2>
        {corrente.length ? (
          <ul className="esiti-anno">
            {corrente.map((c) => (
              <li key={c.id} className={c.vinta ? 'vinta' : ''}>
                <b>{c.nome}</b>
                <span>{c.esito}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="vuoto">Nessuna competizione registrata per questa stagione.</p>
        )}
      </section>

      {d.coppe.length > 0 && (
        <section className="pannello card">
          <h2>Quante volte</h2>
          <ul className="conteggio-coppe">
            {d.coppe.map((c) => (
              <li key={c.id}>
                <b>{c.nome}</b>
                <span className="num">×{c.n}</span>
                <em>{c.stagioni.join(', ')}</em>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Bacheca teamId={d.team.id} titolo="Bacheca completa" />
      <PercorsoCoppe teamId={d.team.id} titolo="Stagione per stagione" />
    </>
  )
}

/* ===================================================== utilità */
function Kpi({ label, value, gold }) {
  return (
    <div className="kpi card">
      <strong className={`num${gold ? ' gold-text' : ''}`}>{value ?? '—'}</strong>
      <span>{label}</span>
    </div>
  )
}

function Riga({ label, v, totale }) {
  if (v == null) return null
  return (
    <div className={`friga${totale ? ' totale' : ''}`}>
      <span>{label}</span>
      <b className="num">{v > 0 && !totale ? `+${v}` : v}</b>
    </div>
  )
}

const segno = (n) => (n > 0 ? `+${n}` : n)

const nomeRuolo = (r) =>
  ({ P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' }[r])

function liberiTot(attivi) {
  return ['D', 'C', 'A'].reduce(
    (n, r) => n + Math.max(0, TETTO[r] - attivi.filter((c) => c.role === r).length),
    0
  )
}

/** Avvisi ricavati dai dati: slot pieni, contratti in scadenza, crediti bassi. */
function avvisi(d) {
  const out = []
  const ultima = CONTRACT_SEASONS[CONTRACT_SEASONS.length - 1]

  for (const r of ['D', 'C', 'A']) {
    const usati = d.contrattiAttivi.filter((c) => c.role === r).length
    if (usati >= TETTO[r]) {
      out.push({
        tipo: 'rosso',
        titolo: `Slot ${nomeRuolo(r).toLowerCase()} pieno`,
        testo: `${usati} su ${TETTO[r]}. Non puoi firmare né ereditare contratti in questo ruolo.`,
      })
    }
  }

  const scadenza = d.contrattiAttivi.filter((c) => c.to === ultima)
  if (scadenza.length) {
    out.push({
      tipo: 'giallo',
      titolo: `${scadenza.length} contratt${scadenza.length === 1 ? 'o' : 'i'} in scadenza`,
      testo: `${scadenza.map((c) => c.player).join(', ')} — da rinnovare pagando metà clausola, o svincolare.`,
    })
  }

  if (d.finanze?.left != null && d.finanze.left < 10) {
    out.push({
      tipo: 'giallo',
      titolo: 'Pochi crediti residui',
      testo: `${d.finanze.left} crediti. Solo metà dei risparmi si riporta alla stagione successiva.`,
    })
  }

  if (!out.length) {
    out.push({
      tipo: 'verde',
      titolo: 'Tutto in ordine',
      testo: 'Nessuno slot pieno, nessun contratto in scadenza imminente.',
    })
  }
  return out
}
