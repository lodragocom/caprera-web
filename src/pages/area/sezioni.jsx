import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl, LAST_PLAYED_SEASON } from '../../lib/core'
import { percorsoFra } from '../../lib/coppe'
import {
  useArchivio, classificaPerpetua, roseStagione, forma as formaDi,
  bacheca as bachecaDi, coppeStagione, stagioni as stagioniDb,
  mieiContratti, mieFinanze, classifica as classificaDi,
  carrieraSocieta, listone as listoneDi,
} from '../../lib/archivio'
import { Bacheca, PercorsoCoppe } from '../../components/CoppeSocieta'
import { Sezione } from '../../components/moto'
import './sezioni.css'

/** La stagione dei trofei in corso: l'ultima con risultati. */
const STAGIONE_COPPE = LAST_PLAYED_SEASON

const TETTO = { D: 3, C: 3, A: 2 }
const RUOLI = ['P', 'D', 'C', 'A']

/**
 * Dati della societa' in sessione.
 *
 * Tutto dal database, contratti e crediti compresi. Quelli il database li da'
 * solo a chi ha diritto: dopo la Tessera del Tifoso il sito si presenta con
 * l'identita' del mister, e le regole di riga fanno il resto. Se un giorno
 * questa pagina venisse scritta male, il peggio che puo' capitare e' che non
 * mostri qualcosa - non che mostri i contratti di un altro.
 */
function useSocieta() {
  const { sessione, presidenza } = useAuth()
  const team = getTeam(sessione.team)

  const cl = useArchivio('perpetua', classificaPerpetua)
  const anni = useArchivio('stagioni', stagioniDb)
  const ba = useArchivio(['bacheca', team.id], () => bachecaDi(team.id), [team.id])
  const fo = useArchivio(['forma', LAST_PLAYED_SEASON], () => formaDi(LAST_PLAYED_SEASON))
  /* La classifica dell'ultima stagione: nella dashboard si vede dove sei
     rispetto a chi ti sta intorno, non solo il numero della tua posizione. */
  const ca = useArchivio(['classifica', LAST_PLAYED_SEASON],
    () => classificaDi(LAST_PLAYED_SEASON))

  const stagioneRosa = (anni.dati ?? [])[0]?.id ?? LAST_PLAYED_SEASON
  const ro = useArchivio(['rosa', stagioneRosa, team.id],
    () => roseStagione(stagioneRosa), [stagioneRosa])

  /*
   * La rosa dell'anno prima.
   *
   * Serve a una cosa sola: la rosa 2025-26 ha i costi e i club ma **zero**
   * fantamedie su tutte e 310 le righe. Senza questa una scheda come «i
   * migliori della rosa» resterebbe vuota per tutta la stagione, e una scheda
   * sempre vuota e' peggio di una scheda che non c'e'. Con questa si mostrano
   * i voti dell'ultimo anno che ce li ha, dicendo di che anno sono.
   */
  const stagionePrima = (anni.dati ?? [])[1]?.id ?? null
  const roPrima = useArchivio(['rosa', stagionePrima, team.id],
    () => (stagionePrima ? roseStagione(stagionePrima) : Promise.resolve([])),
    [stagionePrima])

  const sue = useMemo(
    () => (cl.dati ?? []).filter((r) => r.societa === team.id)
      .sort((a, b) => a.stagione.localeCompare(b.stagione)),
    [cl.dati, team.id]
  )

  const career = useMemo(() => {
    const c = { seasons: sue.length, played: 0, won: 0, drawn: 0, lost: 0, points: 0,
                goalsFor: 0, goalsAgainst: 0, titles: [], best: null }
    for (const r of sue) {
      c.played += r.giocate; c.won += r.vinte; c.points += r.punti
      c.drawn += r.pari; c.lost += r.perse
      c.goalsFor += r.gol_fatti; c.goalsAgainst += r.gol_subiti
      if (c.best === null || r.posizione < c.best) c.best = r.posizione
      if (r.posizione === 1) c.titles.push(r.stagione)
    }
    c.goalDiff = c.goalsFor - c.goalsAgainst
    c.winRate = c.played ? Math.round((c.won / c.played) * 100) : 0
    return c
  }, [sue])

  const rosa = useMemo(
    () => (ro.dati ?? []).filter((r) => r.societa === team.id)
      .map((r) => ({ id: r.calciatore, player: r.nome, role: r.ruolo,
                     club: r.club, cost: r.costo, apps: r.presenze,
                     mv: r.mv == null ? null : Number(r.mv),
                     fm: r.fm == null ? null : Number(r.fm) }))
      .sort((a, b) => 'PDCA'.indexOf(a.role) - 'PDCA'.indexOf(b.role)
                      || (b.cost ?? 0) - (a.cost ?? 0)),
    [ro.dati, team.id]
  )

  /* Le fantamedie: quelle di quest'anno se ci sono, altrimenti dell'anno
     prima — e si dice quale. */
  const conVoti = useMemo(() => {
    const daQuestAnno = rosa.filter((p) => p.fm != null)
    if (daQuestAnno.length) return { stagione: stagioneRosa, righe: daQuestAnno }
    const prima = (roPrima.dati ?? []).filter((r) => r.societa === team.id && r.fm != null)
      .map((r) => ({ player: r.nome, role: r.ruolo, cost: r.costo,
                     apps: r.presenze, fm: Number(r.fm) }))
    return { stagione: stagionePrima, righe: prima }
  }, [rosa, roPrima.dati, team.id, stagioneRosa, stagionePrima])

  const coppe = useMemo(() => {
    const conta = new Map()
    for (const t of ba.dati ?? []) {
      if (t.competizione === 'campionato') continue
      const c = conta.get(t.competizione)
        ?? { id: t.competizione, nome: t.competizione_nome, n: 0, stagioni: [] }
      c.n += 1
      c.stagioni.push(t.stagione)
      conta.set(t.competizione, c)
    }
    return [...conta.values()].sort((a, b) => b.n - a.n)
  }, [ba.dati])

  /* Contratti e crediti: adesso dal database, e il database li da' solo ai
     loro. La riservatezza non la fa piu' questa pagina. */
  /* Tutti quelli che hanno giocato per noi, stagione per stagione: e' quello
     che permette di dire da quanto uno e' qui, non solo quanto e' costato. */
  const cs = useArchivio(['carrieraSocieta', team.id], () => carrieraSocieta(team.id), [team.id])

  const co = useArchivio(['mieiContratti', team.id], () => mieiContratti(team.id), [team.id])
  const fi = useArchivio(['mieFinanze', team.id], () => mieFinanze(team.id), [team.id])

  const contracts = useMemo(
    () => (co.dati ?? []).map((c) => ({
      team: c.societa, player: c.nome, role: c.ruolo, under: c.under,
      from: c.dalla, to: c.alla, years: c.anni,
      clausola: c.clausola, ingaggio: c.ingaggio,
    })),
    [co.dati]
  )
  const stagioneContratti = [...new Set(contracts.map((c) => c.to))].sort().pop()
  const ultimaFinanza = (fi.dati ?? []).map((f) => f.stagione).sort().pop()

  return {
    presidenza,
    team,
    stagioneRosa,
    rosa,
    career,
    storia: sue.map((r) => ({ season: r.stagione, position: r.posizione, points: r.punti })),
    finanze: (fi.dati ?? []).find((f) => f.stagione === ultimaFinanza
      && f.societa === team.id)
      ? (() => {
          const f = (fi.dati ?? []).find((x) => x.stagione === ultimaFinanza
            && x.societa === team.id)
          return { team: f.societa, initial: f.iniziali, spent: f.spesi,
                   trades: f.scambi, left: f.residui, carried: f.riportati,
                   bonus: f.bonus, ffp: f.ffp }
        })()
      : null,
    contrattiAttivi: contracts.filter((c) => c.team === team.id && c.to === stagioneContratti),
    tuttiContratti: contracts.filter((c) => c.team === team.id),
    posizione: sue.find((r) => r.stagione === LAST_PLAYED_SEASON)
      ? { position: sue.find((r) => r.stagione === LAST_PLAYED_SEASON).posizione,
          points: sue.find((r) => r.stagione === LAST_PLAYED_SEASON).punti,
          goalDiff: sue.find((r) => r.stagione === LAST_PLAYED_SEASON).gol_fatti
                    - sue.find((r) => r.stagione === LAST_PLAYED_SEASON).gol_subiti }
      : null,
    forma: (fo.dati ?? []).filter((g) => g.societa === team.id).slice(-5)
      .map((g) => ({ id: g.id, round: g.giornata, result: g.esito,
                     score: `${g.gol_fatti}-${g.gol_subiti}`,
                     home: g.in_casa, opponent: g.avversario })),
    classifica: ca.dati ?? [],
    conVoti,
    carriera: cs.dati ?? [],
    caricaCarriera: cs.caricamento,
    coppe,
    caricamento: cl.caricamento || ro.caricamento,
  }
}

/* ==================================================== 1 · Panoramica */

/**
 * La dashboard del mister.
 *
 * L'impaginazione e' quella dei cruscotti veri: tre colonne di larghezza
 * diversa e schede di altezza diversa, non sette tessere identiche in fila.
 * Sette tessere identiche danno lo stesso peso a «Titoli 2» e «Slot liberi 6»,
 * che rispondono a domande lontanissime — una e' la gloria di dieci anni,
 * l'altra e' una cosa da sistemare stasera.
 *
 * L'ordine e' quello: **prima cosa devi fare, poi come stai andando, poi chi
 * sei**. A sinistra l'identita' e le cose aperte, in mezzo la stagione, a
 * destra dove sei in classifica e cosa hai vinto.
 *
 * E ogni scheda porta da qualche parte: le ultime cinque aprono il tabellino,
 * i migliori della rosa aprono la loro scheda. Prima erano numeri che
 * finivano li'.
 */
export function Panoramica() {
  const d = useSocieta()
  const problemi = avvisi(d)
  const daFare = problemi.filter((a) => a.tipo !== 'verde')

  /* I migliori della rosa: fantamedia, ma solo di chi ha giocato abbastanza
     perche' voglia dire qualcosa. Un 8,00 su due presenze non e' un campione. */
  const migliori = useMemo(
    () => (d.conVoti.righe ?? [])
      .filter((p) => (p.apps ?? 0) >= 15)
      .sort((a, b) => b.fm - a.fm)
      .slice(0, 5),
    [d.conVoti]
  )
  const vecchi = d.conVoti.stagione && d.conVoti.stagione !== d.stagioneRosa

  const intorno = useMemo(() => vicini(d.classifica, d.team.id), [d.classifica, d.team.id])
  const riepilogo = useMemo(() => riepilogoRosa(d.rosa), [d.rosa])

  return (
    <>
      <header className="pan-testa">
        <div>
          <p className="eyebrow">Area mister · {LAST_PLAYED_SEASON}</p>
          <h1>{d.team.name}</h1>
        </div>
        {daFare.length > 0 && (
          <p className="pan-conto">
            <b>{daFare.length}</b> {daFare.length === 1 ? 'cosa aperta' : 'cose aperte'}
          </p>
        )}
      </header>

      <div className="pan-griglia">
        {/* ---------------------------------------------- colonna stretta */}
        <div className="pan-col pan-sinistra">
          <section className="pan-identita card">
            <img src={logoUrl(d.team)} alt="" />
            <div>
              <h2>{d.team.name}</h2>
              <p className="pan-dal">
                {d.career.seasons} stagion{d.career.seasons === 1 ? 'e' : 'i'} ·{' '}
                {d.career.played} partite
              </p>
            </div>
            <div className="pan-vnp">
              <span className="v"><b>{d.career.won}</b>vinte</span>
              <span className="n"><b>{d.career.drawn}</b>pari</span>
              <span className="p"><b>{d.career.lost}</b>perse</span>
            </div>
          </section>

          <section className="pan-fare card">
            <h2>Da fare</h2>
            <ul className="avvisi">
              {problemi.map((a, i) => (
                <li key={i} className={a.tipo}>
                  <b>{a.titolo}</b>
                  <span>{a.testo}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="pan-soldi card">
            <h2>Rosa e crediti</h2>
            <dl>
              <div>
                <dt>Crediti residui</dt>
                <dd className="num grande">{d.finanze?.left ?? '—'}</dd>
              </div>
              <div>
                <dt>Slot liberi</dt>
                <dd className="num grande">{liberiTot(d.contrattiAttivi)}</dd>
              </div>
              <div>
                <dt>Giocatori in rosa</dt>
                <dd className="num">{riepilogo.size}</dd>
              </div>
              <div>
                <dt>Speso all'asta</dt>
                <dd className="num">{riepilogo.spent}</dd>
              </div>
            </dl>
            <Link className="pan-vai" to="/area/crediti">I crediti nel dettaglio →</Link>
          </section>
        </div>

        {/* ------------------------------------------------ colonna larga */}
        <div className="pan-col pan-centro">
          <section className="pan-andamento card">
            <h2>Dieci stagioni</h2>
            <p className="pan-sotto">
              La posizione in campionato, anno per anno. In alto è meglio.
            </p>
            <Andamento storia={d.storia} />
          </section>

          <section className="pan-ultime card">
            <h2>
              Ultime cinque · {LAST_PLAYED_SEASON}
              <Link to="/risultati">calendario →</Link>
            </h2>
            {d.forma.length ? (
              <ul className="pan-gare">
                {d.forma.map((f, i) => (
                  <li key={i}>
                    <Link to={f.id != null ? `/partita/${f.id}` : '/risultati'}>
                      <i className={`dot dot-${f.result}`}>{f.result}</i>
                      <span className="num g">{f.round}ª</span>
                      <span className="pan-avv">
                        <em>{f.home ? 'in casa con' : 'in casa di'}</em>
                        {getTeam(f.opponent)?.name ?? f.opponent}
                      </span>
                      <b className="num">{f.score}</b>
                      <span className="pan-freccia" aria-hidden="true">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vuoto">Nessuna partita registrata.</p>
            )}
          </section>

          <section className="pan-migliori card">
            <h2>
              I migliori della rosa
              <Link to="/area/rosa">tutta la rosa →</Link>
            </h2>
            {migliori.length ? (
              <>
                <ul className="pan-top">
                  {migliori.map((p) => (
                    <li key={p.player}>
                      <span className={`badge role-${p.role}`}>{p.role}</span>
                      <span className="pan-nome">{p.player}</span>
                      <span className="num pan-pres">{p.apps} pres.</span>
                      <b className="num pan-fm">{p.fm.toFixed(2)}</b>
                    </li>
                  ))}
                </ul>
                <p className="pan-nota">
                  {vecchi ? (
                    <>Fantamedie del <b>{d.conVoti.stagione}</b>: la rosa{' '}
                      {d.stagioneRosa} ha i costi ma non ancora i voti, su tutte
                      e {d.rosa.length} le righe.</>
                  ) : (
                    <>Fantamedia del {d.conVoti.stagione}, da almeno 15 presenze:
                      sotto, un voto alto conta poco.</>
                  )}
                </p>
              </>
            ) : (
              <p className="vuoto">
                Nessun giocatore con almeno 15 presenze e una fantamedia
                registrata, né in {d.stagioneRosa} né prima.
              </p>
            )}
          </section>
        </div>

        {/* ---------------------------------------------- colonna stretta */}
        <div className="pan-col pan-destra">
          <section className="pan-classifica card">
            <h2>
              Classifica
              <Link to="/classifica">tutta →</Link>
            </h2>
            {intorno.length ? (
              <ol className="pan-cl">
                {intorno.map((r) => (
                  <li key={r.societa} className={r.societa === d.team.id ? 'io' : undefined}>
                    <span className="num pos">{r.posizione}</span>
                    <span className="pan-sq">{getTeam(r.societa)?.short ?? r.societa}</span>
                    <b className="num">{r.punti}</b>
                  </li>
                ))}
              </ol>
            ) : <p className="vuoto">Classifica non disponibile.</p>}
          </section>

          <section className="pan-palmares card">
            <h2>Bacheca</h2>
            {d.career.titles.length > 0 && (
              <p className="pan-titoli">
                <b>{d.career.titles.length}</b>
                {d.career.titles.length === 1 ? 'campionato' : 'campionati'}
                <em>{d.career.titles.join(' · ')}</em>
              </p>
            )}
            {d.coppe.length > 0 ? (
              <ul className="pan-coppe">
                {d.coppe.map((c) => (
                  <li key={c.id} title={c.stagioni.join(' · ')}>
                    <span>{c.nome}</span>
                    {c.n > 1 && <b className="num">×{c.n}</b>}
                  </li>
                ))}
              </ul>
            ) : (
              d.career.titles.length === 0 &&
                <p className="vuoto">Nessun trofeo in bacheca. Per ora.</p>
            )}
            <Link className="pan-vai" to="/area/coppe">Il percorso nelle coppe →</Link>
          </section>
        </div>
      </div>
    </>
  )
}

/**
 * Le tre righe di classifica intorno a te.
 *
 * Vedere «2º» da solo non dice niente: dice tutto sapere che il primo ha
 * quattro punti piu' di te e il terzo uno solo di meno.
 */
function vicini(classifica, mio) {
  if (!classifica?.length) return []
  const i = classifica.findIndex((r) => r.societa === mio)
  if (i === -1) return classifica.slice(0, 5)
  const da = Math.max(0, Math.min(i - 2, classifica.length - 5))
  return classifica.slice(da, da + 5)
}

/**
 * L'andamento delle posizioni, dieci stagioni.
 *
 * Un grafico e non una tabella perche' la domanda e' «sto salendo o
 * scendendo», e a quella una linea risponde prima di qualunque numero.
 * L'asse e' rovesciato: la prima posizione sta in alto, dove uno se la
 * aspetta, e non in basso perche' e' il numero piu' piccolo.
 */
function Andamento({ storia }) {
  if (!storia?.length) return <p className="vuoto">Nessuna stagione in archivio.</p>

  const W = 640
  const H = 150
  const pad = { s: 26, d: 10, a: 12, b: 26 }
  const max = Math.max(10, ...storia.map((s) => s.position))
  const x = (i) => pad.s + (storia.length === 1 ? (W - pad.s - pad.d) / 2
    : (i / (storia.length - 1)) * (W - pad.s - pad.d))
  const y = (p) => pad.a + ((p - 1) / (max - 1)) * (H - pad.a - pad.b)

  const linea = storia.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s.position).toFixed(1)}`).join(' ')

  return (
    <div className="pan-grafico">
      <svg viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Posizione in campionato dal ${storia[0].season} al ${storia[storia.length - 1].season}`}>
        {[1, Math.ceil(max / 2), max].map((p) => (
          <g key={p}>
            <line x1={pad.s} x2={W - pad.d} y1={y(p)} y2={y(p)} className="pan-riga" />
            <text x={pad.s - 6} y={y(p) + 3} className="pan-tacca">{p}º</text>
          </g>
        ))}
        <path d={linea} className="pan-linea" />
        {storia.map((s, i) => (
          <g key={s.season}>
            <circle cx={x(i)} cy={y(s.position)} r={s.position === 1 ? 5 : 3.5}
                    className={s.position === 1 ? 'pan-punto oro' : 'pan-punto'}>
              <title>{s.season}: {s.position}º con {s.points} punti</title>
            </circle>
            <text x={x(i)} y={H - 8} className="pan-anno">{s.season.slice(2)}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ========================================================= 2 · Rosa */
/**
 * La mia rosa.
 *
 * Prima erano quattro elenchi di nomi con accanto il costo, e finiva li'.
 * Il costo dice quanto hai pagato: non dice se hai pagato bene, non dice da
 * quanto uno e' qui, non dice cosa ha fatto negli anni con questa maglia.
 *
 * Adesso ogni riga porta la carriera in societa' — stagioni, gol, assist,
 * fantamedia — e il nome apre la scheda del calciatore. Sotto, lo storico:
 * chi e' rimasto piu' a lungo, chi ha segnato di piu', e quanto si e' speso
 * all'asta anno per anno.
 */
export function Rosa() {
  const d = useSocieta()
  const [stagione, setStagione] = useState(null)   // null = quella corrente
  const [ordine, setOrdine] = useState('costo')

  const anni = useArchivio('stagioni', stagioniDb)
  const stagioni = useMemo(
    () => (anni.dati ?? []).map((a) => a.id).sort().reverse(),
    [anni.dati]
  )
  const scelta = stagione ?? d.stagioneRosa
  const corrente = scelta === d.stagioneRosa

  /* La rosa dell'anno scelto. Quella corrente arriva gia' da `useSocieta`;
     per le altre si legge la stagione richiesta e basta. */
  const ro = useArchivio(['roseStagione', scelta],
    () => roseStagione(scelta), [scelta])

  /*
   * Il listone di Fantapazz. Dove non c'e', la pagina non mostra una colonna
   * vuota — la toglie e dice perche'.
   *
   * `momento` dice di che giorno e' la quotazione. «partenza» e' il listone
   * prima della prima giornata: quello che i mister avevano davanti all'asta,
   * e l'unico che si puo' mettere accanto a quanto hanno pagato. «fine» e' una
   * quotazione scaricata dopo, che sa gia' com'e' andata la stagione: dice
   * quanto vale un giocatore adesso, non quanto valeva quando si rilanciava.
   * Oggi il 2025-26 e' di partenza, le nove stagioni prima sono di fine.
   */
  const li = useArchivio(['listone', scelta], () => listoneDi(scelta), [scelta])
  const quotazioni = useMemo(
    () => new Map((li.dati?.righe ?? []).map((r) => [r.nome.toLowerCase(), r.prezzo])),
    [li.dati]
  )
  const allAsta = li.dati?.momento === 'partenza'

  const storia = useMemo(() => costruisciStoria(d.carriera), [d.carriera])

  const rosa = useMemo(() => {
    const righe = corrente
      ? d.rosa
      : (ro.dati ?? []).filter((r) => r.societa === d.team.id)
          .map((r) => ({ id: r.calciatore, player: r.nome, role: r.ruolo,
                         club: r.club, cost: r.costo, apps: r.presenze,
                         fm: r.fm == null ? null : Number(r.fm) }))
    return righe
      .map((p) => ({
        ...p,
        con: p.id != null ? storia.perGiocatore.get(p.id) : null,
        quota: quotazioni.get(p.player.toLowerCase()) ?? null,
      }))
      .sort((a, b) => 'PDCA'.indexOf(a.role) - 'PDCA'.indexOf(b.role)
                      || (b.cost ?? 0) - (a.cost ?? 0))
  }, [corrente, d.rosa, ro.dati, d.team.id, storia, quotazioni])

  const r = riepilogoRosa(rosa)
  const conQuota = rosa.filter((p) => p.quota != null)
  const quotaTot = conQuota.reduce((n, p) => n + p.quota, 0)
  const pagatoSuQuotati = conQuota.reduce((n, p) => n + (p.cost ?? 0), 0)

  /*
   * Crediti spesi per ogni punto di quotazione — tuo, e della lega.
   *
   * Il confronto diretto fra i due totali non regge: la quotazione Fantapazz e
   * il credito Caprera non sono la stessa moneta. Nel 2025-26 il piu' quotato
   * del listone e' Lautaro Martinez a 37, e all'asta il Sanguemisto l'ha pagato
   * 121: lo stesso giocatore, nella stessa stagione, con due numeri che stanno
   * fra loro come uno a tre. E il rapporto cambia da un anno all'altro. Dire
   * «hai risparmiato 236 crediti» sarebbe una sciocchezza travestita da numero.
   *
   * Quello che regge e' il rapporto, confrontato con quello di tutti nella
   * stessa stagione: se la lega ha pagato 0,90 crediti per punto e tu 0,83,
   * hai comprato sotto il prezzo di mercato di quell'anno. E' scala-libero e
   * non cambia significato da un anno all'altro.
   */
  const mercato = useMemo(() => {
    // Senza il listone di partenza il conto non si fa: dividere i crediti
    // dell'asta per una quotazione di fine stagione mescola due date.
    if (!quotazioni.size || !allAsta) return null
    const tutte = corrente ? (ro.dati ?? []) : (ro.dati ?? [])
    let spesa = 0
    let quota = 0
    for (const x of tutte) {
      const q = quotazioni.get((x.nome ?? '').toLowerCase())
      if (q == null || x.costo == null) continue
      spesa += x.costo
      quota += q
    }
    if (!quota || !quotaTot) return null
    return {
      lega: spesa / quota,
      mio: pagatoSuQuotati / quotaTot,
      societa: new Set(tutte.map((x) => x.societa)).size,
    }
  }, [ro.dati, quotazioni, quotaTot, pagatoSuQuotati, corrente, allAsta])

  /*
   * I volti nuovi: chi non ha nessuna stagione con noi **prima** di quella
   * scelta. Contare «una stagione sola in tutto» sarebbe sbagliato guardando
   * l'archivio: uno che ha giocato nel 2019-20 e nel 2020-21, aperto il
   * 2019-20, era nuovo lo stesso — le sue due stagioni una e' quella e
   * l'altra viene dopo.
   */
  const volti = rosa.filter(
    (p) => !(p.con?.stagioni ?? []).some((a) => a < scelta)
  ).length
  const piuCaro = rosa.reduce((max, p) => ((p.cost ?? 0) > (max?.cost ?? 0) ? p : max), null)

  const veterani = [...storia.perGiocatore.values()]
    .sort((a, b) => b.stagioni.length - a.stagioni.length || b.gol - a.gol).slice(0, 8)
  const bomber = [...storia.perGiocatore.values()].filter((p) => p.gol > 0)
    .sort((a, b) => b.gol - a.gol || b.assist - a.assist).slice(0, 8)

  const sottoContratto = d.contrattiAttivi.length

  return (
    <>
      <header className="pan-testa">
        <div>
          <p className="eyebrow">
            {corrente ? `Stagione ${scelta}` : `Archivio · ${scelta}`}
          </p>
          <h1>La mia rosa</h1>
        </div>
        <label className="ro-stagione">
          <span>Stagione</span>
          <select value={scelta} onChange={(e) => setStagione(e.target.value)}>
            {stagioni.map((a) => (
              <option key={a} value={a}>{a}{a === d.stagioneRosa ? ' — in corso' : ''}</option>
            ))}
          </select>
        </label>
      </header>

      <Sezione stato={corrente ? { dati: d.rosa, caricamento: false, errore: null } : ro}
               righe={8} vuoto={`Nessuna rosa in archivio per il ${scelta}.`}>
        <div className="ro-numeri">
          <Numeretto n={r.size} etichetta="Calciatori" />
          <Numeretto n={r.spent} etichetta="Crediti spesi all'asta" oro />
          {conQuota.length > 0 && (
            <Numeretto n={quotaTot}
                       etichetta={allAsta ? 'Valore Fantapazz' : 'Valore Fantapazz a fine anno'}
                       nota={`${conQuota.length} su ${r.size} quotati`} />
          )}
          <Numeretto n={piuCaro?.cost} etichetta="Acquisto più caro"
                     nota={piuCaro?.player} />
          <Numeretto n={volti} etichetta="Volti nuovi"
                     nota={`su ${r.size} — al primo anno con questa maglia`} />
          {/* I contratti sono quelli di adesso, non di una stagione qualsiasi:
              accanto a una rosa del 2019-20 sarebbero un numero fuori posto. */}
          {corrente && (
            <Numeretto n={sottoContratto} etichetta="Sotto contratto"
                       nota={`su ${r.size} — dai contratti in archivio`} />
          )}
        </div>

        {conQuota.length > 0 && !allAsta && (
          <section className="ro-confronto card">
            <h2>Quanto valevano a fine stagione</h2>
            <p className="ro-nota">
              Per il {scelta} l'archivio ha il listone <b>scaricato dopo</b>, non
              quello di partenza. È una quotazione che sa già com'è andata:
              chi si è fatto male è sceso, chi ha segnato è salito. Serve a
              dire quanto è valso un giocatore in quell'anno, <em>non</em> a
              giudicare l'asta — accanto al costo racconterebbe due date
              diverse. Nel 2025-26, dove abbiamo tutti e due i listoni, Simeone
              vale <b>10</b> di partenza — ed è esattamente quanto il
              Sanguemisto l'ha pagato all'asta — mentre alla fine vale{' '}
              <b>30</b>. Il confronto con l'asta torna qui quando arrivano i
              listoni d'inizio stagione di Guido.
            </p>
          </section>
        )}

        {conQuota.length > 0 && allAsta && (
          <section className="ro-confronto card">
            <h2>Quanto valgono, quanto li hai pagati</h2>
            <p className="ro-nota">
              Sono due numeri diversi, e <em>non sono la stessa moneta</em>: la{' '}
              <b>quotazione Fantapazz</b> è il prezzo di partenza sul listone, il{' '}
              <b>costo</b> è quanto hai speso tu all'asta della Caprera.
              Nel 2025-26 Lautaro Martinez è il più quotato del listone a{' '}
              <b>37</b>, e all'asta il Sanguemisto l'ha pagato <b>121</b>: stesso
              giocatore, stessa stagione, il triplo. Quanto valga un credito
              nostro in punti di listone cambia pure da un anno all'altro.
              Per questo il confronto che conta non è la differenza fra i totali
              — sarebbe come sottrarre euro da chilometri — ma il{' '}
              <b>prezzo che hai pagato per ogni punto di quotazione</b>, messo
              accanto a quello di tutta la lega in quella stessa stagione.
            </p>
            <Confronto pagato={pagatoSuQuotati} quotato={quotaTot}
                       quanti={conQuota.length} mercato={mercato} />
            <div className="ro-affari">
              <Affari titolo="I migliori affari" righe={affari(conQuota, 'sotto')} />
              <Affari titolo="Pagati più di quanto valgono" righe={affari(conQuota, 'sopra')} />
            </div>
          </section>
        )}

        <nav className="ro-schede" role="tablist">
          <span>Ordina per</span>
          {[['costo', 'Costo'], ['quota', 'Quotazione'], ['stagioni', 'Anzianità'],
            ['gol', 'Gol'], ['fm', 'Fantamedia'], ['nome', 'Nome']]
            .filter(([k]) => k !== 'quota' || conQuota.length > 0)
            .map(([k, testo]) => (
              <button key={k} type="button" role="tab" aria-selected={ordine === k}
                      className={ordine === k ? 'on' : ''} onClick={() => setOrdine(k)}>
                {testo}
              </button>
            ))}
        </nav>

        {RUOLI.map((ruolo) => {
          const gruppo = ordinaRosa(rosa.filter((p) => p.role === ruolo), ordine)
          if (!gruppo.length) return null
          const spesi = gruppo.reduce((n, p) => n + (p.cost ?? 0), 0)
          return (
            <section key={ruolo} className="ro-reparto card">
              <h2>
                <span className={`badge role-${ruolo}`}>{ruolo}</span>
                {nomeRuolo(ruolo)}
                <em>{gruppo.length} · {spesi} crediti</em>
              </h2>
              <div className="ro-tabella">
                <table>
                  <thead>
                    <tr>
                      <th className="left">Calciatore</th>
                      <th className="left">Club</th>
                      <th>Costo</th>
                      {conQuota.length > 0 && (
                        <th title={allAsta
                          ? 'Quotazione del listone di partenza, prima della prima giornata'
                          : 'Quotazione di fine stagione: non è il prezzo che si aveva davanti all’asta'}>
                          {allAsta ? 'Quot.' : 'Quot. fine'}
                        </th>
                      )}
                      <th>Con noi</th>
                      <th>Pres.</th>
                      {/* Un portiere non ha gol e assist: ha porte inviolate e
                          gol subiti. Una colonna di zeri non è un dato. */}
                      {ruolo === 'P'
                        ? <><th>Imbattuto</th><th>Gol subiti</th></>
                        : <><th>Gol</th><th>Assist</th></>}
                      <th>FM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gruppo.map((p, i) => (
                      <tr key={p.id ?? i}>
                        <td className="left strong">
                          {p.id != null
                            ? <Link to={`/giocatori/${p.id}`} className="ro-nome">{p.player}</Link>
                            : <span title="Nome non agganciato all'archivio">{p.player}</span>}
                        </td>
                        <td className="left num ro-club">{p.club ?? '—'}</td>
                        <td className="num strong">{p.cost ?? '—'}</td>
                        {/* Verde o rosso solo col listone di partenza: dire
                            «affare» confrontando il costo d'asta con una
                            quotazione di fine anno sarebbe un giudizio dato
                            con la moviola su una scommessa fatta prima. */}
                        {conQuota.length > 0 && (
                          <td className={`num ro-quota ${allAsta ? scarto(p) : ''}`}>
                            {p.quota ?? <i className="zero">—</i>}
                          </td>
                        )}
                        <td className="num">
                          {p.con
                            ? <span className="ro-anni" title={p.con.stagioni.join(' · ')}>
                                {p.con.stagioni.length}
                                {p.con.stagioni.length === 1 ? ' stagione' : ' stagioni'}
                              </span>
                            : <span className="zero">mai schierato</span>}
                        </td>
                        <td className="num muted">{p.con?.con_voto || '—'}</td>
                        {ruolo === 'P' ? (
                          <>
                            <td className="num">{p.con?.imbattuto || <i className="zero">0</i>}</td>
                            <td className="num muted">{p.con?.gol_subiti || <i className="zero">0</i>}</td>
                          </>
                        ) : (
                          <>
                            <td className="num">{p.con?.gol || <i className="zero">0</i>}</td>
                            <td className="num muted">{p.con?.assist || <i className="zero">0</i>}</td>
                          </>
                        )}
                        <td className="num ro-fm">{p.con?.mv ? p.con.mv.toFixed(2) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}

        <p className="ro-nota">
          <b>Con noi</b>, <b>Pres.</b> e tutto quello che segue è quello che quel
          calciatore ha fatto <em>con questa maglia</em>, in tutte le stagioni in
          cui l'ha indossata — non solo quest'anno. Ai portieri, al posto di gol e
          assist, si contano porte inviolate e gol subiti. Il nome apre la sua
          scheda, dove c'è anche quello che ha fatto per le altre società.
        </p>
      </Sezione>

      <div className="ro-storico">
        <section className="card">
          <h2>Chi è rimasto di più</h2>
          {veterani.length ? (
            <ul className="ro-classifica">
              {veterani.map((p) => (
                <li key={p.id}>
                  <span className={`badge role-${p.ruolo}`}>{p.ruolo}</span>
                  <Link to={`/giocatori/${p.id}`} className="ro-nome">{p.nome}</Link>
                  <span className="num ro-dettaglio" title={p.stagioni.join(' · ')}>
                    {p.stagioni[0]} – {p.stagioni[p.stagioni.length - 1]}
                  </span>
                  <b className="num">{p.stagioni.length}</b>
                </li>
              ))}
            </ul>
          ) : <p className="vuoto">Nessuno schierato in archivio.</p>}
        </section>

        <section className="card">
          <h2>Chi ha segnato di più</h2>
          {bomber.length ? (
            <ul className="ro-classifica">
              {bomber.map((p) => (
                <li key={p.id}>
                  <span className={`badge role-${p.ruolo}`}>{p.ruolo}</span>
                  <Link to={`/giocatori/${p.id}`} className="ro-nome">{p.nome}</Link>
                  <span className="num ro-dettaglio">{p.assist} assist</span>
                  <b className="num oro">{p.gol}</b>
                </li>
              ))}
            </ul>
          ) : <p className="vuoto">Nessun gol in archivio.</p>}
        </section>

        <section className="card ro-spesa">
          <h2>Quanto si è speso all'asta</h2>
          <SpesaPerStagione righe={storia.perStagione} scelta={scelta}
                            vai={setStagione} />
          <p className="ro-nota piccola">
            Somma dei costi d'asta della rosa di fine stagione. Tocca un anno per
            aprire quella rosa.
          </p>
        </section>
      </div>

      <section className="ro-mancano card">
        <h2>Cosa non c'è</h2>
        <div>
          <div>
            <strong>Ingaggi</strong>
            <p>
              La colonna esiste in archivio ma è <b>vuota su tutte e 140 le righe
              di contratto</b>. Gli ingaggi veri sono nei 358 contratti della
              Presidenza, che non abbiamo ancora caricato: finché non ci sono,
              un «monte ingaggi» sarebbe un numero inventato.
            </p>
          </div>
          <div>
            <strong>Squalificati e infortunati</strong>
            <p>
              Non esistono in nessuna tabella, in nessuna stagione. Il fantacalcio
              non li registra: quello che si vede è chi era in formazione senza
              prendere voto, che comprende squalifiche, infortuni e scelte del
              mister tutti insieme.
            </p>
          </div>
          <div>
            <strong>Che giorno è la quotazione</strong>
            <p>
              Fantapazz muove le quotazioni durante l'anno. Per il 2025-26
              l'archivio ha il listone <b>di partenza</b>, quello che i mister
              avevano davanti all'asta, e la colonna si chiama «Quot.». Per le
              nove stagioni prima ha solo la quotazione <b>di fine</b>, e la
              colonna lo dice: «Quot. fine». Lì non coloriamo affari e
              pagati-troppo, perché sarebbe un giudizio dato con la moviola.
            </p>
            <p>
              I listoni portano anche la squadra di serie A, ma è <b>quella di
              oggi, non quella di allora</b>: nel listone 2016-17 Cristiano
              Ronaldo risulta alla Juventus e Bastoni all'Inter. Non l'abbiamo
              caricata — il club giusto di ogni anno ce l'abbiamo già nelle
              rose, ed è esatto.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

function Numeretto({ n, etichetta, nota, oro }) {
  return (
    <div className="ro-num card">
      <strong className={oro ? 'oro' : undefined}>{n ?? '—'}</strong>
      <span>{etichetta}</span>
      {nota && <em>{nota}</em>}
    </div>
  )
}

/** Sopra o sotto la quotazione: si legge dal colore prima che dal numero. */
function scarto(p) {
  if (p.quota == null || p.cost == null) return ''
  if (p.cost < p.quota) return 'affare'
  if (p.cost > p.quota) return 'caro'
  return ''
}

/** I cinque presi meglio, o i cinque pagati peggio. */
function affari(righe, verso) {
  return [...righe]
    .map((p) => ({ ...p, delta: (p.cost ?? 0) - p.quota }))
    .filter((p) => (verso === 'sotto' ? p.delta < 0 : p.delta > 0))
    .sort((a, b) => (verso === 'sotto' ? a.delta - b.delta : b.delta - a.delta))
    .slice(0, 5)
}

function Affari({ titolo, righe }) {
  return (
    <div>
      <h3>{titolo}</h3>
      {righe.length ? (
        <ul className="ro-classifica">
          {righe.map((p) => (
            <li key={p.player}>
              <span className={`badge role-${p.role}`}>{p.role}</span>
              {p.id != null
                ? <Link to={`/giocatori/${p.id}`} className="ro-nome">{p.player}</Link>
                : <span className="ro-nome">{p.player}</span>}
              <span className="num ro-dettaglio">
                {p.cost} crediti · quotato {p.quota}
              </span>
              <b className={`num ${p.delta < 0 ? 'giu' : 'su'}`}>
                {p.delta > 0 ? `+${p.delta}` : p.delta}
              </b>
            </li>
          ))}
        </ul>
      ) : <p className="vuoto">Nessuno.</p>}
    </div>
  )
}

/**
 * Quanto vale la rosa, quanto l'hai pagata, e a che prezzo rispetto agli altri.
 *
 * Le due barre servono a dare la misura; la riga che conta è quella sotto, che
 * mette il tuo prezzo per punto di quotazione accanto a quello della lega
 * nella stessa stagione. Vedi il commento in `Rosa` sul perché.
 */
function Confronto({ pagato, quotato, quanti, mercato }) {
  const max = Math.max(pagato, quotato, 1)
  const due = (n) => n.toLocaleString('it-IT',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  /* Sotto il 3% di scarto non si dice niente: è rumore, non un affare. */
  const scarto = mercato ? (mercato.mio - mercato.lega) / mercato.lega : 0
  const verso = !mercato || Math.abs(scarto) < 0.03 ? 'pari' : scarto < 0 ? 'buono' : 'caro'

  return (
    <div className="ro-confronto-barre">
      <div>
        <span>Quotazione Fantapazz</span>
        <i className="quota" style={{ width: `${(quotato / max) * 100}%` }} />
        <b>{quotato}</b>
      </div>
      <div>
        <span>Pagato all'asta</span>
        <i className="pagato" style={{ width: `${(pagato / max) * 100}%` }} />
        <b>{pagato}</b>
      </div>

      {mercato ? (
        <p className={verso}>
          Hai pagato <b>{due(mercato.mio)}</b> crediti per ogni punto di
          quotazione. Nella stessa stagione le {mercato.societa} società della
          lega ne hanno pagati <b>{due(mercato.lega)}</b>.{' '}
          {verso === 'pari'
            ? <>Sei in linea col mercato di quell'anno.</>
            : verso === 'buono'
              ? <>Hai comprato <b>sotto</b> il prezzo di quell'anno.</>
              : <>Hai comprato <b>sopra</b> il prezzo di quell'anno.</>}
        </p>
      ) : (
        <p className="pari">
          Sui {quanti} calciatori a listone. Il confronto col mercato della lega
          non è disponibile per questa stagione.
        </p>
      )}
    </div>
  )
}

/**
 * La storia della societa': ogni calciatore con quello che ha fatto qui.
 *
 * La fantamedia si pesa sulle presenze e non sulle stagioni: chi ha fatto
 * 7,00 in quaranta partite e 4,00 in due non ha una media di 5,50.
 */
function costruisciStoria(righe) {
  const perGiocatore = new Map()
  const perStagione = new Map()

  for (const r of righe ?? []) {
    const c = perGiocatore.get(r.calciatore) ?? {
      id: r.calciatore, nome: r.nome, ruolo: r.ruolo, stagioni: [],
      con_voto: 0, convocato: 0, gol: 0, assist: 0, gialli: 0, rossi: 0,
      imbattuto: 0, gol_subiti: 0, speso: 0, voti: 0, mv: null,
    }
    c.stagioni.push(r.stagione)
    c.con_voto += r.con_voto ?? 0
    c.convocato += r.convocato ?? 0
    c.gol += r.gol ?? 0
    c.assist += r.assist ?? 0
    c.gialli += r.gialli ?? 0
    c.rossi += r.rossi ?? 0
    c.imbattuto += r.imbattuto ?? 0
    c.gol_subiti += r.gol_subiti ?? 0
    c.speso += r.costo ?? 0
    if (r.mv != null) c.voti += Number(r.mv) * (r.con_voto ?? 0)
    c.mv = c.con_voto ? +(c.voti / c.con_voto).toFixed(2) : null
    perGiocatore.set(r.calciatore, c)

    const st = perStagione.get(r.stagione) ?? { stagione: r.stagione, speso: 0, quanti: 0 }
    st.speso += r.costo ?? 0
    st.quanti += 1
    perStagione.set(r.stagione, st)
  }

  for (const c of perGiocatore.values()) c.stagioni.sort()

  return {
    perGiocatore,
    perStagione: [...perStagione.values()].sort((a, b) => a.stagione.localeCompare(b.stagione)),
    stagioni: [...perStagione.keys()].sort(),
  }
}

const ORDINE_ROSA = {
  costo: (a, b) => (b.cost ?? 0) - (a.cost ?? 0),
  quota: (a, b) => (b.quota ?? 0) - (a.quota ?? 0),
  stagioni: (a, b) => (b.con?.stagioni.length ?? 0) - (a.con?.stagioni.length ?? 0)
    || (b.cost ?? 0) - (a.cost ?? 0),
  gol: (a, b) => (b.con?.gol ?? 0) - (a.con?.gol ?? 0),
  fm: (a, b) => (b.con?.mv ?? -1) - (a.con?.mv ?? -1),
  nome: (a, b) => a.player.localeCompare(b.player),
}

const ordinaRosa = (righe, k) => [...righe].sort(ORDINE_ROSA[k] ?? ORDINE_ROSA.costo)

/** Quanto si e' speso all'asta, stagione per stagione. */
function SpesaPerStagione({ righe, scelta, vai }) {
  if (!righe?.length) return <p className="vuoto">Nessun costo in archivio.</p>
  const max = Math.max(1, ...righe.map((s) => s.speso))
  return (
    <ul className="ro-barre">
      {righe.map((s) => (
        <li key={s.stagione} className={s.stagione === scelta ? 'on' : undefined}>
          <button type="button" onClick={() => vai(s.stagione)}>
            <span className="num ro-anno">{s.stagione}</span>
            <span className="ro-barra">
              <i style={{ width: `${Math.max(2, (s.speso / max) * 100)}%` }} />
            </span>
            <b className="num">{s.speso || '—'}</b>
          </button>
        </li>
      ))}
    </ul>
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
          {true
            ? 'Il racconto non viene ancora salvato: manca la tabella.'
            : 'Salvato automaticamente.'}
        </p>
      </section>
    </>
  )
}

/* ========================================================= 6 · Coppe */
export function Coppe() {
  const d = useSocieta()
  const co = useArchivio(['coppeStagione', STAGIONE_COPPE], () => coppeStagione(STAGIONE_COPPE))
  const corrente = useMemo(
    () => (co.dati ? percorsoFra(d.team.id, co.dati) : []),
    [co.dati, d.team.id]
  )
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

/** Il riepilogo di una rosa: quanti per ruolo, quanto spesi, che fantamedia. */
function riepilogoRosa(rosa) {
  const byRole = { P: 0, D: 0, C: 0, A: 0 }
  let spent = 0; let apps = 0; let fmSum = 0; let fmCount = 0
  for (const p of rosa) {
    byRole[p.role] = (byRole[p.role] ?? 0) + 1
    spent += p.cost ?? 0
    apps += p.apps ?? 0
    if (p.fm != null) { fmSum += p.fm; fmCount += 1 }
  }
  return { byRole, spent, apps, size: rosa.length,
           avgFm: fmCount ? +(fmSum / fmCount).toFixed(2) : null }
}

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
  const ultima = [...new Set(d.tuttiContratti.map((c) => c.to))].sort().pop()

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
