import { useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import { ACTIVE_TEAMS } from '../lib/core'
import { useArchivio, classificaPerpetua } from '../lib/archivio'
import { Pagina, Sezione, Numero, CorpoTabella, Riga } from '../components/moto'
import './Ranking.css'

/** Le finestre fra cui si può scegliere. `0` vuol dire "tutte". */
const FINESTRE = [
  { n: 3, etichetta: '3 stagioni' },
  { n: 5, etichetta: '5 stagioni' },
  { n: 0, etichetta: 'Tutte' },
]

/**
 * Ranking Caprera calcolato dai risultati di campionato.
 *
 * Il regolamento usa un "Ranking Caprera Uefa" per comporre i due gironi di
 * qualificazione a Champions ed Europa League, ma non ne pubblica la formula.
 * Qui se ne ricostruisce una in stile UEFA: i punti delle ultime stagioni,
 * pesati in modo decrescente.
 *
 * NON è il ranking ufficiale della Federazione: quello vive nella dashboard.
 *
 * I pesi sono `(i+1)/n`: su cinque stagioni vanno da 0,2 a 1,0, quindi la più
 * recente conta *cinque* volte la più lontana, non il doppio. La pagina lo
 * diceva sbagliato e adesso lo dice giusto — e lo dice calcolandolo, così se
 * si cambia la finestra il testo resta vero.
 */
function coefficiente(righeClassifica, finestra) {
  /*
   * Solo le società in attività. Su una finestra lunga il database restituisce
   * anche chi non c'è più — La Casata dei Draghi ha giocato fino al 2018 — e
   * un club sciolto si prendeva un posto nei gironi di quest'anno, che ne
   * diventavano uno da sei e uno da cinque. Il coefficiente serve a comporre
   * i gironi: chi non gioca non entra nel conto.
   */
  const inAttivita = new Set(ACTIVE_TEAMS.map((t) => t.id))

  const perStagione = new Map()
  for (const r of righeClassifica ?? []) {
    if (!inAttivita.has(r.societa)) continue
    if (!perStagione.has(r.stagione)) perStagione.set(r.stagione, [])
    perStagione.get(r.stagione).push(r)
  }
  const tutte = [...perStagione.keys()].sort()
  const ultime = finestra > 0 ? tutte.slice(-finestra) : tutte
  const pesi = ultime.map((_, i) => (i + 1) / ultime.length)

  const acc = new Map()
  ultime.forEach((s, i) => {
    for (const r of perStagione.get(s) ?? []) {
      const cur = acc.get(r.societa)
        ?? { team: r.societa, grezzo: 0, dr: 0, stagioni: 0, dettaglio: [] }
      cur.grezzo += r.punti * pesi[i]
      cur.dr += (r.gol_fatti ?? 0) - (r.gol_subiti ?? 0)
      cur.stagioni += 1
      cur.dettaglio.push({ stagione: s, punti: r.punti, posizione: r.posizione, peso: pesi[i] })
      acc.set(r.societa, cur)
    }
  })

  /*
   * L'ordine qui non è cosmetico: decide in quale dei due gironi finisce una
   * società. Subbuteo e Roburro, sulle ultime cinque stagioni, arrivano allo
   * stesso identico coefficiente (162,2) — e senza un criterio dichiarato
   * sarebbe l'ordine di lettura del database a mandarne una in un girone e una
   * nell'altro. A pari coefficiente decide la stagione più recente, poi la
   * differenza reti nella finestra.
   */
  const righe = [...acc.values()]
    .map((r) => ({ ...r, punti: +r.grezzo.toFixed(1) }))
    .sort((a, b) =>
      b.punti - a.punti
      || (ultimaStagione(b) - ultimaStagione(a))
      || (b.dr - a.dr))

  /* Chi resta pari anche dopo i criteri: va detto, non nascosto. */
  righe.forEach((r, i) => {
    const prima = righe[i - 1]
    const dopo = righe[i + 1]
    r.pari = (prima && prima.punti === r.punti) || (dopo && dopo.punti === r.punti)
    /*
     * Chi non c'era. Il Roburro è entrato nel 2020-21: su dieci stagioni ne ha
     * sei, e le quattro che gli mancano gli tolgono coefficiente senza che
     * abbia perso una partita. Su tre stagioni è terzo, su dieci ottavo — e
     * non perché sia peggiorato. Un numero così va marcato, non lasciato
     * leggere come se fosse confrontabile.
     */
    r.parziale = r.stagioni < ultime.length
  })

  return { ultime, pesi, righe, parziali: righe.some((r) => r.parziale) }
}

const ultimaStagione = (r) => r.dettaglio[r.dettaglio.length - 1]?.punti ?? 0

export default function Ranking() {
  const [finestra, setFinestra] = useState(5)
  const [scelta, setScelta] = useState(null)

  const stato = useArchivio('perpetua', classificaPerpetua)
  const { ultime, righe, parziali } = useMemo(
    () => coefficiente(stato.dati, finestra), [stato.dati, finestra]
  )

  /* La barra va da chi è ultimo a chi è primo: se partisse da zero,
     centoventiquattro e centosessantotto sarebbero due barre quasi uguali e
     il grafico non direbbe niente. */
  const max = Math.max(...righe.map((r) => r.punti), 1)
  const min = Math.min(...righe.map((r) => r.punti), max)
  const largo = (v) => 4 + (max === min ? 96 : ((v - min) / (max - min)) * 96)

  const gironeA = righe.filter((_, i) => i % 2 === 0)
  const gironeB = righe.filter((_, i) => i % 2 === 1)
  const pronto = ultime.length > 0

  return (
    <Pagina className="page container wide rk">
      <header className="rk-testa">
        <div>
          <p className="eyebrow">Coefficienti</p>
          <h1>Ranking Caprera</h1>
        </div>
        <div className="rk-finestra">
          <span>Stagioni contate</span>
          <div className="rk-segmenti">
            {FINESTRE.map((f) => (
              <button key={f.n} type="button"
                      className={finestra === f.n ? 'on' : ''}
                      aria-pressed={finestra === f.n}
                      onClick={() => setFinestra(f.n)}>
                {f.etichetta}
              </button>
            ))}
          </div>
        </div>
      </header>

      <p className="lede">
        Serve a comporre i due gironi di qualificazione a Champions ed Europa
        League: le posizioni dispari in un girone, le pari nell'altro.
      </p>

      <div className="avviso card">
        <strong>Ranking non ufficiale.</strong> Il regolamento cita il "Ranking
        Caprera Uefa" senza pubblicarne la formula.{' '}
        {pronto ? (
          <>
            Questo è ricalcolato dai punti di campionato di {ultime.length}{' '}
            {ultime.length === 1 ? 'stagione' : 'stagioni'} ({ultime[0]} –{' '}
            {ultime[ultime.length - 1]}), pesate in modo decrescente: l'ultima
            vale {ultime.length} volte la prima.
          </>
        ) : (
          <>Si calcola dai punti di campionato delle ultime stagioni, pesate in
            modo decrescente.</>
        )}{' '}
        A pari coefficiente decide la stagione più recente, poi la differenza
        reti. Il ranking ufficiale è nella dashboard della Federazione.
      </div>

      <Sezione stato={stato} righe={10}>
        <section className="block">
          <h2 className="section-title">Coefficiente</h2>
          <div className="table-wrap">
            <table className="rk-tabella">
              <thead>
                <tr>
                  <th className="left">#</th>
                  <th className="left">Società</th>
                  {ultime.map((s) => (
                    <th key={s} className="num-head">{s.slice(2)}</th>
                  ))}
                  <th>Coeff.</th>
                  <th className="left rk-c-scarto">Distacco dal primo</th>
                </tr>
              </thead>
              <CorpoTabella>
                {righe.map((r, i) => (
                  <Riga key={r.team}
                        className={[
                          i < 2 ? 'podium' : '',
                          scelta === r.team ? 'segnata' : '',
                        ].join(' ').trim() || undefined}
                        tabIndex={0}
                        aria-pressed={scelta === r.team}
                        onClick={() => setScelta(scelta === r.team ? null : r.team)}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter' && e.key !== ' ') return
                          e.preventDefault()
                          setScelta(scelta === r.team ? null : r.team)
                        }}>
                    <td className="num pos">{i + 1}</td>
                    <td className="left">
                      <span className="rk-chi">
                        <TeamBadge id={r.team} size="sm" />
                        {r.parziale && (
                          <em className="rk-parziale"
                              title={`${r.stagioni} stagioni su ${ultime.length}`}>
                            {r.stagioni}/{ultime.length}
                          </em>
                        )}
                      </span>
                    </td>
                    {ultime.map((s) => {
                      const d = r.dettaglio.find((x) => x.stagione === s)
                      return (
                        <td key={s} className="num rk-anno">
                          {d ? (
                            <>
                              <b>{d.punti}</b>
                              <i>{d.posizione}º</i>
                            </>
                          ) : <span className="muted">—</span>}
                        </td>
                      )
                    })}
                    <td className="num strong">
                      <Numero valore={r.punti} decimali={1} />
                      {r.pari && <em className="rk-pari" title="a pari coefficiente">=</em>}
                    </td>
                    <td className="left rk-c-scarto">
                      <span className="rk-scarto">
                        <span className="coef-bar">
                          <i style={{ width: `${largo(r.punti)}%` }} />
                        </span>
                        <b>{i === 0 ? '—' : `−${(righe[0].punti - r.punti).toFixed(1)}`}</b>
                      </span>
                    </td>
                  </Riga>
                ))}
              </CorpoTabella>
            </table>
          </div>
          <p className="rk-nota">
            Sotto i punti di ogni stagione c'è la posizione in classifica di
            quell'anno. Tocca una riga per seguire una società nei gironi qui
            sotto. Nel conto entrano solo le dieci società in attività: serve a
            comporre i gironi di quest'anno, e chi si è sciolto non prende un
            posto.
            {parziali && (
              <>
                {' '}<b>Le società marcate con una frazione non hanno giocato
                tutte le stagioni della finestra</b>, e il loro coefficiente non
                è confrontabile con gli altri: quello che manca sono anni, non
                risultati.
              </>
            )}
          </p>
        </section>

        <section className="block">
          <h2 className="section-title">Gironi che ne deriverebbero</h2>
          <p className="lede">
            Secondo il regolamento: 1ª, 3ª, 5ª, 7ª, 9ª in un girone; 2ª, 4ª, 6ª,
            8ª, 10ª nell'altro. Poi si giocano dieci giornate, e sono quelle a
            decidere chi va in Champions, in Europa League e in Conference: la
            posizione nel ranking dà solo il girone di partenza.
          </p>
          <div className="gironi">
            <Girone titolo="Girone dispari" squadre={gironeA} righe={righe}
                    scelta={scelta} scegli={setScelta} />
            <Girone titolo="Girone pari" squadre={gironeB} righe={righe}
                    scelta={scelta} scegli={setScelta} />
          </div>
        </section>
      </Sezione>
    </Pagina>
  )
}

function Girone({ titolo, squadre, righe, scelta, scegli }) {
  return (
    <div className="girone card">
      <h3>{titolo}</h3>
      <ol>
        {squadre.map((s) => (
          <li key={s.team}
              className={scelta === s.team ? 'segnata' : undefined}
              onClick={() => scegli(scelta === s.team ? null : s.team)}>
            <span className="num seed">{righe.indexOf(s) + 1}ª</span>
            <TeamBadge id={s.team} size="sm" />
            <span className="num coef">{s.punti.toFixed(1)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
