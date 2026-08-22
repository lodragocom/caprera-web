import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { getTeam, logoUrl, LAST_PLAYED_SEASON } from '../lib/core'
import { siglaCoppa } from '../lib/coppe'
import { Bacheca, PercorsoCoppe } from '../components/CoppeSocieta'
import CreditiSocieta from '../components/CreditiSocieta'
import {
  useArchivio, classificaPerpetua, bacheca as bachecaDi, partiteDi, rosa as rosaDi,
  classifica, forma,
} from '../lib/archivio'
import { Pagina, Sezione, Numero, Scheletro } from '../components/moto'
import './SquadraDetail.css'

/**
 * La scheda di una società.
 *
 * Prima era un rotolo unico: identità, carriera, grafico, bacheca, percorso
 * di coppa, crediti, rosa e partite, uno sotto l'altro per cinquemila pixel.
 * Chi cercava la rosa scorreva davanti a tutto il resto ogni volta.
 *
 * Adesso l'identità e i numeri della carriera stanno in cima e non si
 * spostano — sono quelli che si guardano sempre — e il resto sta in quattro
 * sezioni che si scelgono. Non è una tabella nascosta: è che "quanto ha vinto
 * questa squadra in dieci anni" e "chi giocava nel 2019" sono due domande
 * diverse, e nessuno le fa insieme.
 */
const SEZIONI = [
  ['storia', 'Storia e trofei'],
  ['rosa', 'Rosa'],
  ['partite', 'Partite'],
  ['crediti', 'Crediti'],
]

export default function SquadraDetail() {
  const { id } = useParams()
  const team = getTeam(id)
  const [sezione, setSezione] = useState('storia')

  const cl = useArchivio('perpetua', classificaPerpetua)
  const ba = useArchivio(['bacheca', id], () => bachecaDi(id), [id])
  const og = useArchivio(['classifica', LAST_PLAYED_SEASON], () => classifica(LAST_PLAYED_SEASON))
  const fo = useArchivio(['forma', LAST_PLAYED_SEASON], () => forma(LAST_PLAYED_SEASON))

  /* Carriera e andamento: si contano dalle cento righe di classifica. */
  const { career, history } = useMemo(() => {
    const sue = (cl.dati ?? []).filter((r) => r.societa === id)
      .sort((a, b) => a.stagione.localeCompare(b.stagione))
    const c = {
      seasons: sue.length, played: 0, won: 0, drawn: 0, lost: 0, points: 0,
      goalsFor: 0, goalsAgainst: 0, titles: [], best: null,
    }
    for (const r of sue) {
      c.played += r.giocate; c.won += r.vinte; c.drawn += r.pari; c.lost += r.perse
      c.points += r.punti
      c.goalsFor += r.gol_fatti; c.goalsAgainst += r.gol_subiti
      if (c.best === null || r.posizione < c.best) c.best = r.posizione
      if (r.posizione === 1) c.titles.push(r.stagione)
    }
    c.goalDiff = c.goalsFor - c.goalsAgainst
    c.winRate = c.played ? Math.round((c.won / c.played) * 100) : 0
    return {
      career: c,
      history: sue.map((r) => ({ season: r.stagione, position: r.posizione, points: r.punti })),
    }
  }, [cl.dati, id])

  const coppe = (ba.dati ?? []).filter((t) => t.competizione !== 'campionato')
  const posizione = (og.dati ?? []).find((r) => r.societa === id)?.posizione
  const ultime = useMemo(
    () => (fo.dati ?? []).filter((g) => g.societa === id).slice(-5), [fo.dati, id])

  if (!team) {
    return (
      <div className="page container">
        <p className="empty">
          Società non trovata. <Link to="/squadre">Torna all'elenco</Link>.
        </p>
      </div>
    )
  }

  return (
    <Pagina className="page container wide sd" style={{ '--accent': team.color }}>
      {/* ------------------------------------------------------- identità */}
      <header className="sd-hero">
        <div className="sd-stemma">
          <img src={logoUrl(team)} alt="" />
        </div>

        <div className="sd-chi">
          <p className="eyebrow">
            {team.code}
            {career.seasons > 0 && ` · dal ${history[0]?.season}`}
            {!team.active && ' · non più in attività'}
          </p>
          <h1>{team.name}</h1>
          {team.formerNames.length > 0 && <NomiStorici nomi={team.formerNames} />}

          <div className="sd-palmares">
            {career.titles.length > 0 && (
              <span className="sd-trofeo grosso" title={career.titles.join(', ')}>
                <i>★</i>{career.titles.length} {career.titles.length === 1 ? 'titolo' : 'titoli'}
              </span>
            )}
            {coppe.length > 0 && (
              <span className="sd-trofeo">
                <i>❖</i>{coppe.length} {coppe.length === 1 ? 'coppa' : 'coppe'}
              </span>
            )}
            {career.titles.length === 0 && coppe.length === 0 && cl.dati && (
              <span className="sd-trofeo vuoto">Bacheca ancora vuota</span>
            )}
          </div>
        </div>

        {(posizione || ultime.length > 0) && (
          <aside className="sd-ora">
            <p className="eyebrow">{LAST_PLAYED_SEASON}</p>
            {posizione && <strong className="sd-pos">{posizione}<em>º</em></strong>}
            {ultime.length > 0 && (
              <span className="forma">
                {ultime.map((g, i) => (
                  <i key={i} className={`pastiglia p-${g.esito}`}
                     title={`${g.giornata}ª · ${g.gol_fatti}-${g.gol_subiti}${g.avversario ? ` con ${getTeam(g.avversario).name}` : ''}`}>
                    {g.esito}
                  </i>
                ))}
              </span>
            )}
          </aside>
        )}
      </header>

      {/*
        I numeri della carriera, ma solo se l'archivio ha risposto: `career`
        tutto a zero è la somma onesta di zero righe, ma letta in pagina dice
        "questa società non ha mai giocato". Meglio dire che non si legge.
      */}
      {cl.errore ? (
        <p className="guasto">
          Non riesco a leggere l'archivio: {cl.errore}.{' '}
          <button type="button" onClick={() => window.location.reload()}>Riprova</button>
        </p>
      ) : cl.caricamento ? (
        <Scheletro righe={1} alto={70} />
      ) : (
        <div className="sd-numeri">
          <Numeretto etichetta="Stagioni" valore={career.seasons} />
          <Numeretto etichetta="Partite" valore={career.played} />
          <Numeretto etichetta="Punti" valore={career.points} />
          <Numeretto etichetta="Vittorie" valore={`${career.winRate}%`}
                     sotto={`${career.won}V ${career.drawn}N ${career.lost}P`} />
          <Numeretto etichetta="Gol fatti" valore={career.goalsFor} />
          <Numeretto etichetta="Gol subiti" valore={career.goalsAgainst} />
          <Numeretto etichetta="Diff. reti"
                     valore={career.goalDiff > 0 ? `+${career.goalDiff}` : career.goalDiff}
                     tinta={career.goalDiff > 0 ? 'su' : career.goalDiff < 0 ? 'giu' : ''} />
          <Numeretto etichetta="Miglior piazz." valore={career.best ? `${career.best}º` : '—'} oro />
        </div>
      )}

      {/* ------------------------------------------------------- sezioni */}
      <nav className="sd-schede" role="tablist">
        {SEZIONI.map(([k, etichetta]) => (
          <button key={k} role="tab" aria-selected={sezione === k}
                  className={sezione === k ? 'on' : ''} onClick={() => setSezione(k)}>
            {etichetta}
          </button>
        ))}
      </nav>

      {sezione === 'storia' && (
        <>
          <section className="block">
            <h2 className="section-title">Andamento per stagione</h2>
            <Sezione stato={cl} righe={4}>
              <PositionChart history={history} color={team.color} />
            </Sezione>
          </section>
          <Bacheca teamId={id} />
          <PercorsoCoppe teamId={id} />
        </>
      )}

      {sezione === 'rosa' && <Rosa teamId={id} />}
      {sezione === 'partite' && <SeasonMatches teamId={id} />}
      {sezione === 'crediti' && <CreditiSocieta teamId={id} />}
    </Pagina>
  )
}

/**
 * I nomi di prima.
 *
 * Smit ne ha sette e sul telefono occupano tre righe sopra il palmarès, che
 * è la cosa che uno è venuto a vedere. Se ne mostrano tre e si apre il resto
 * a richiesta: la storia c'è, ma non si mette davanti.
 */
function NomiStorici({ nomi }) {
  const [tutti, setTutti] = useState(false)
  const pochi = nomi.slice(0, 3)
  const restanti = nomi.length - pochi.length
  return (
    <p className="sd-gia" title={nomi.join(' · ')}>
      Già {(tutti ? nomi : pochi).join(' · ')}
      {!tutti && restanti > 0 && (
        <>
          {' '}
          <button type="button" onClick={() => setTutti(true)}>
            e altri {restanti}
          </button>
        </>
      )}
    </p>
  )
}

function Numeretto({ etichetta, valore, sotto, oro, tinta }) {
  return (
    <div className="sd-numero">
      <strong className={`${oro ? 'oro' : ''} ${tinta ?? ''}`}>
        {typeof valore === 'number' ? <Numero valore={valore} /> : valore}
      </strong>
      <span>{etichetta}</span>
      {sotto && <em>{sotto}</em>}
    </div>
  )
}

/* ------------------------------------------------------------------ rosa */

const RUOLI = [
  ['tutti', 'Tutti'], ['P', 'Portieri'], ['D', 'Difensori'],
  ['C', 'Centrocampisti'], ['A', 'Attaccanti'],
]

const COLONNE_ROSA = [
  { k: 'costo', t: 'Costo', lungo: 'i costi' },
  { k: 'presenze', t: 'Pres.', lungo: 'le presenze' },
  { k: 'mv', t: 'MV', dec: 2, lungo: 'la media voto' },
  { k: 'fm', t: 'FM', dec: 2, lungo: 'la fantamedia' },
]

/**
 * La rosa di una stagione.
 *
 * Si filtra per reparto e si riordina per qualunque colonna. Trenta calciatori
 * sono troppi per leggerli tutti: quasi sempre si sta cercando "chi era il
 * portiere" o "chi è costato di più", e senza filtro e ordinamento quelle due
 * domande costano una scorsa a occhio ogni volta.
 */
function Rosa({ teamId }) {
  const cl = useArchivio('perpetua', classificaPerpetua)
  const stagioni = useMemo(
    () => [...new Set((cl.dati ?? []).filter((r) => r.societa === teamId)
      .map((r) => r.stagione))].sort().reverse(),
    [cl.dati, teamId]
  )
  const [scelta, setScelta] = useState('')
  const [ruolo, setRuolo] = useState('tutti')
  const [ordine, setOrdine] = useState(null)
  const stagione = scelta && stagioni.includes(scelta) ? scelta : stagioni[0]

  const stato = useArchivio(['rosa', stagione, teamId],
    () => (stagione ? rosaDi(stagione, teamId) : Promise.resolve([])), [stagione, teamId])

  const tutte = stato.dati ?? []
  const righe = useMemo(() => {
    const f = ruolo === 'tutti' ? tutte : tutte.filter((p) => p.ruolo === ruolo)
    if (!ordine) {
      return [...f].sort((a, b) =>
        'PDCA'.indexOf(a.ruolo) - 'PDCA'.indexOf(b.ruolo) || (b.costo ?? 0) - (a.costo ?? 0))
    }
    const { k, giu } = ordine
    return [...f].sort((a, b) => {
      const x = a[k] == null ? -Infinity : Number(a[k])
      const y = b[k] == null ? -Infinity : Number(b[k])
      return giu ? y - x : x - y
    })
  }, [tutte, ruolo, ordine])

  const riepilogo = useMemo(() => {
    const perRuolo = { P: 0, D: 0, C: 0, A: 0 }
    let spesi = 0; let somma = 0; let quanti = 0
    for (const p of tutte) {
      perRuolo[p.ruolo] = (perRuolo[p.ruolo] ?? 0) + 1
      spesi += p.costo ?? 0
      if (p.fm != null) { somma += Number(p.fm); quanti += 1 }
    }
    return { perRuolo, spesi, quanti: tutte.length,
             fmMedia: quanti ? (somma / quanti).toFixed(2) : null }
  }, [tutte])

  /*
   * Le colonne che per questa stagione hanno almeno un valore.
   *
   * Nel 2025-26 l'archivio ha costi e club ma non ancora presenze, media voto
   * e fantamedia: tre colonne intere di trattini, con l'ordinamento che ci
   * lavora sopra senza combinare niente. Una colonna vuota non e' una colonna:
   * si toglie, e si dice perche'.
   */
  const colonne = useMemo(
    () => COLONNE_ROSA.filter((c) => tutte.some((p) => p[c.k] != null)),
    [tutte]
  )
  const mancanti = COLONNE_ROSA.filter((c) => !colonne.includes(c))

  const cambia = (k) => setOrdine((o) =>
    o?.k !== k ? { k, giu: true } : o.giu ? { k, giu: false } : null)

  if (!stagioni.length) return null

  return (
    <section className="block">
      <div className="sd-barra">
        <label className="sd-scelta">
          <span>Stagione</span>
          <select value={stagione} onChange={(e) => setScelta(e.target.value)}>
            {stagioni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <div className="sd-reparti">
          {RUOLI.map(([v, l]) => (
            <button key={v} type="button" className={ruolo === v ? 'on' : ''}
                    onClick={() => setRuolo(v)}>
              {l}
              {v !== 'tutti' && <i>{riepilogo.perRuolo[v] ?? 0}</i>}
            </button>
          ))}
        </div>

        <p className="sd-riepilogo">
          <span><b>{riepilogo.quanti}</b> calciatori</span>
          <span><b>{riepilogo.spesi}</b> crediti</span>
          {riepilogo.fmMedia && <span>FM media <b>{riepilogo.fmMedia}</b></span>}
        </p>
      </div>

      <Sezione stato={stato} righe={10} vuoto="Nessuna rosa registrata.">
        <div className="sd-tabella">
          <table>
            <thead>
              <tr>
                <th className="c-r">R</th>
                <th className="c-nome">Calciatore</th>
                <th className="c-club">Club</th>
                {colonne.map((c) => (
                  <th key={c.k} className="num">
                    <button type="button" className={`ord ${ordine?.k === c.k ? 'on' : ''}`}
                            onClick={() => cambia(c.k)}>
                      {c.t}{ordine?.k === c.k && <i>{ordine.giu ? '▾' : '▴'}</i>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {righe.map((p, i) => (
                <tr key={i}>
                  <td className="c-r"><span className={`badge role-${p.ruolo}`}>{p.ruolo}</span></td>
                  <td className="c-nome">{p.nome}</td>
                  <td className="c-club">{p.club ?? '—'}</td>
                  {colonne.map((c) => (
                    <td key={c.k} className={`num ${ordine?.k === c.k ? 'in-ordine' : ''}`}>
                      {p[c.k] == null ? '—'
                        : c.dec ? Number(p[c.k]).toFixed(c.dec) : p[c.k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mancanti.length > 0 && (
          <p className="sd-nota">
            Per il {stagione} l'archivio non ha ancora
            {' '}{elenco(mancanti.map((c) => c.lungo ?? c.t.toLowerCase()))}:
            {' '}le colonne compaiono quando arrivano i dati di fine stagione.
          </p>
        )}
      </Sezione>
    </section>
  )
}

/** "a, b e c" — perche' "a, b, c" in una frase italiana suona un elenco della spesa. */
function elenco(voci) {
  if (voci.length <= 1) return voci[0] ?? ''
  return `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1]}`
}

/* -------------------------------------------------------------- il grafico */

/** Grafico a linee: posizione in classifica per stagione (1 in alto). */
function PositionChart({ history, color }) {
  if (history.length < 2) return <p className="muted">Dati insufficienti.</p>

  const W = 760
  const H = 220
  const padX = 46
  const padY = 26
  const stepX = (W - padX * 2) / Math.max(1, history.length - 1)
  const y = (pos) => padY + ((pos - 1) / 9) * (H - padY * 2)
  const points = history.map((h, i) => [padX + i * stepX, y(h.position)])
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const sotto = `${path} L${points[points.length - 1][0].toFixed(1)},${H - padY} L${points[0][0].toFixed(1)},${H - padY} Z`

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img"
           aria-label="Posizione in classifica per stagione">
        <defs>
          <linearGradient id="sfumatura" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[1, 3, 5, 7, 10].map((p) => (
          <g key={p}>
            <line x1={padX} x2={W - padX} y1={y(p)} y2={y(p)}
                  stroke="rgba(255,255,255,.07)" />
            <text x={padX - 10} y={y(p) + 4} textAnchor="end"
                  className="chart-label">{p}º</text>
          </g>
        ))}
        <path d={sotto} fill="url(#sfumatura)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5"
              strokeLinejoin="round" strokeLinecap="round" />
        {points.map(([px, py], i) => (
          <g key={i}>
            <circle cx={px} cy={py} r={history[i].position === 1 ? 6 : 4.5}
                    fill={history[i].position === 1 ? 'var(--gold-500)' : color}
                    stroke="var(--navy-850)" strokeWidth="2" />
            <text x={px} y={H - 6} textAnchor="middle" className="chart-label">
              {history[i].season.slice(2)}
            </text>
            <title>{`${history[i].season}: ${history[i].position}º, ${history[i].points} pt`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------- le partite */

const AMBITI = [
  ['tutte', 'Tutte'],
  ['campionato', 'Campionato'],
  ['coppe', 'Coppe'],
]

/**
 * Le partite di una stagione, campionato e coppe insieme.
 *
 * Arrivano tutte dalla stessa vista del database, `v_gare`, già orientata
 * dalla parte della società: `gol_fatti` e `gol_subiti` sono i suoi, non
 * quelli di casa. Una lettura sola per stagione.
 */
function SeasonMatches({ teamId }) {
  const cl = useArchivio('perpetua', classificaPerpetua)
  const stagioni = useMemo(
    () => [...new Set((cl.dati ?? []).filter((r) => r.societa === teamId)
      .map((r) => r.stagione))].sort().reverse(),
    [cl.dati, teamId]
  )
  const [scelta, setScelta] = useState('')
  const season = scelta && stagioni.includes(scelta) ? scelta : stagioni[0]
  const [ambito, setAmbito] = useState('tutte')

  const stato = useArchivio(['partiteDi', season, teamId],
    () => (season ? partiteDi(season, teamId) : Promise.resolve([])), [season, teamId])

  const { righe, conto } = useMemo(() => {
    const out = []
    const c = { V: 0, N: 0, P: 0, coppe: 0 }
    for (const g of stato.dati ?? []) {
      const coppa = g.competizione !== 'campionato'
      if (coppa) c.coppe += 1
      if (g.giocata) c[g.gol_fatti > g.gol_subiti ? 'V' : g.gol_fatti === g.gol_subiti ? 'N' : 'P'] += 1
      if (ambito === 'coppe' && !coppa) continue
      if (ambito === 'campionato' && coppa) continue
      out.push({
        coppa,
        sigla: coppa ? siglaCoppa(g.competizione) : `${g.giornata}ª`,
        giocata: g.giocata,
        casa: g.in_casa, avversario: g.avversario,
        gf: g.gol_fatti, gs: g.gol_subiti,
        titolo: coppa ? g.competizione : `${g.giornata}ª giornata`,
      })
    }
    return { righe: out.sort((a, b) => Number(a.coppa) - Number(b.coppa)), conto: c }
  }, [stato.dati, ambito])

  return (
    <section className="block">
      <div className="sd-barra">
        <label className="sd-scelta">
          <span>Stagione</span>
          <select value={season ?? ''} onChange={(e) => setScelta(e.target.value)}>
            {stagioni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <div className="sd-reparti">
          {AMBITI.map(([v, l]) => (
            <button key={v} type="button" className={ambito === v ? 'on' : ''}
                    onClick={() => setAmbito(v)}>{l}</button>
          ))}
        </div>

        <p className="sd-riepilogo">
          <span className="su"><b>{conto.V}</b> vinte</span>
          <span><b>{conto.N}</b> pari</span>
          <span className="giu"><b>{conto.P}</b> perse</span>
          <span><b>{conto.coppe}</b> di coppa</span>
        </p>
      </div>

      <Sezione stato={stato} righe={8} vuoto="Nessuna partita.">
        <div className="sd-partite">
          {righe.map((m, i) => {
            const res = !m.giocata ? null : m.gf > m.gs ? 'V' : m.gf === m.gs ? 'N' : 'P'
            return (
              <Link key={i} to={`/squadre/${m.avversario}`}
                    className={`sd-gara ${m.coppa ? 'coppa' : ''} ${res ? `e-${res}` : ''}`}
                    title={m.titolo}>
                <span className="g-sigla">{m.sigla}</span>
                <span className={`g-dove ${m.casa ? 'casa' : ''}`}>{m.casa ? 'C' : 'T'}</span>
                {/* la sigla, non il nome: "Sporting Mangiapreti" in una
                    scheda larga due dita diventa "S…", che non dice niente.
                    Lo stemma lo si riconosce, e la sigla la si legge. */}
                <TeamBadge id={m.avversario} size="sm" label="code" link={false} />
                <span className="g-punteggio">
                  {res ? `${m.gf}–${m.gs}` : '—'}
                </span>
              </Link>
            )
          })}
        </div>
      </Sezione>
    </section>
  )
}
