import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { getTeam, teamName, logoUrl, LAST_PLAYED_SEASON, nomeVoce } from '../../lib/core'
import { percorsoFra } from '../../lib/coppe'
import {
  useArchivio, classificaPerpetua, roseStagione, forma as formaDi,
  bacheca as bachecaDi, coppeStagione, stagioni as stagioniDb,
  mieiContratti, mieFinanze, classifica as classificaDi,
  carrieraSocieta, listone as listoneDi, mieiMovimenti, momentiDelListone,
} from '../../lib/archivio'
import { Bacheca, PercorsoCoppe } from '../../components/CoppeSocieta'
import { Sezione } from '../../components/moto'
import './sezioni.css'
import { UsciteSocieta } from '../../components/RosaSocieta'

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

  /*
   * L'ultima stagione **giocata**, non l'ultima in elenco.
   *
   * Da quando l'archivio contiene anche il 2026-27 - che ha i budget ma non
   * ha ancora avuto l'asta - `anni.dati[0]` e' una stagione senza rose, e
   * tutta l'area riservata si apriva su una rosa vuota. `conclusa` e' il
   * campo che separa le due cose ed e' gia' in tabella.
   */
  const giocate = (anni.dati ?? []).filter((a) => a.conclusa)
  const stagioneRosa = giocate[0]?.id ?? LAST_PLAYED_SEASON
  const ro = useArchivio(['rosa', stagioneRosa, team.id],
    () => roseStagione(stagioneRosa), [stagioneRosa])

  /* La rosa d'asta: serve per contare gli slot dei contratti nel momento in
     cui la regola si verifica — quando la squadra si costruisce. */
  const roP = useArchivio(['roseStagione', stagioneRosa, 'partenza'],
    () => roseStagione(stagioneRosa, 'partenza'), [stagioneRosa])

  /*
   * La rosa dell'anno prima.
   *
   * Serve a una cosa sola: la rosa 2025-26 ha i costi e i club ma **zero**
   * fantamedie su tutte e 310 le righe. Senza questa una scheda come «i
   * migliori della rosa» resterebbe vuota per tutta la stagione, e una scheda
   * sempre vuota e' peggio di una scheda che non c'e'. Con questa si mostrano
   * i voti dell'ultimo anno che ce li ha, dicendo di che anno sono.
   */
  const stagionePrima = giocate[1]?.id ?? null
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
  /* L'estratto conto dei crediti: e' quello che apre `finanze.bonus`, che da
     solo e' un intero e non dice niente. */
  const mo = useArchivio(['mieiMovimenti', team.id], () => mieiMovimenti(team.id), [team.id])

  const contracts = useMemo(
    () => (co.dati ?? []).map((c) => ({
      team: c.societa, player: c.nome, role: c.ruolo, under: c.under,
      from: c.dalla, to: c.alla, years: c.anni,
      clausola: c.clausola, ingaggio: c.ingaggio,
    })),
    [co.dati]
  )
  /*
   * «Sotto contratto adesso» e' chi ha un contratto che **copre la stagione in
   * corso**, non chi ne ha uno che finisce nell'anno piu' lontano che c'e' in
   * archivio.
   *
   * Erano la stessa cosa finche' tutti i contratti finivano entro l'ultima
   * stagione giocata. Col registro vero non piu': ci sono contratti fino al
   * 2027-28, e il conto vecchio faceva dire al Prosecco «1 sotto contratto» —
   * il solo Sucic, che e' l'unico che arriva al 2027-28 — invece di sette.
   *
   * Un numero che era giusto per caso e ha smesso di esserlo quando sono
   * arrivati i dati veri.
   */
  const stagioneContratti = LAST_PLAYED_SEASON

  const attivi = contracts.filter((c) => c.team === team.id
    && c.from <= stagioneContratti && stagioneContratti <= c.to)

  /*
   * Gli slot si contano sulla **rosa d'asta**, non su quella di maggio.
   *
   * E' li' che la regola si verifica: quando costruisci la squadra. Uno che
   * hai ceduto a gennaio lo slot te l'aveva occupato eccome — lo Sporting
   * Mangiapreti a gennaio ha venduto Coco, Lang e Castellanos, tutti e tre
   * sotto contratto, e contando maggio risulterebbe con un contratto solo su
   * sei. Contando settembre risulta con quattro, che e' quello che aveva.
   *
   * Cosi' contati, il tetto 3-3-2 torna su **tutte e dieci** le societa'.
   */
  const tutteLeRighe = ro.dati ?? []
  const rosaPartenza = (roP.dati ?? []).filter((r) => r.societa === team.id)
    .map((r) => ({ player: r.nome, role: r.ruolo }))
  const perSlot = rosaPartenza.length ? rosaPartenza : rosa
  const chiaviRosa = (righe) => {
    const k = new Set()
    for (const p of righe) {
      const n = (p.player ?? '').trim().toLowerCase()
      if (n) { k.add(n); k.add(`${n}\u00b7${p.role}`) }
    }
    return k
  }
  const miei = chiaviRosa(perSlot)
  const dentro = (c) => {
    const n = (c.player ?? '').trim().toLowerCase()
    return miei.has(n) || miei.has(`${n}\u00b7${c.role}`)
  }
  const attiviInRosa = attivi.filter(dentro)

  /*
   * I contratti **decaduti**.
   *
   * La regola l'ha data la Presidenza: **un contratto decade quando il
   * giocatore lascia la Serie A.** Non e' sospeso, non aspetta: e' finito. Se
   * quel giocatore un giorno torna in Serie A torna libero, e chi lo vuole se
   * lo ricompra all'asta.
   *
   * E' la spiegazione di tutti e diciotto i casi che non tornavano:
   *
   *   Lauriente  e' sceso in Serie B — contratto Mangiapreti decaduto — ed e'
   *              risalito in A col Subbuteo, che se l'e' preso all'asta.
   *              Non era un errore d'archivio: era una regola che non
   *              conoscevo.
   *   Lang, Castellanos   partiti dall'Italia a gennaio.
   *   Bijol      via nel 2024-25, con un contratto che sulla carta arrivava
   *              al 2025-26.
   *
   * Percio' qui non c'e' niente «da verificare»: c'e' un elenco di contratti
   * finiti, e il motivo per cui sono finiti.
   */
  const aMaggio = chiaviRosa(rosa)
  const altrove = new Map()   // nome -> societa' che ce l'ha
  for (const r of tutteLeRighe) {
    const n = (r.nome ?? '').trim().toLowerCase()
    if (n && r.societa !== team.id && !altrove.has(n)) altrove.set(n, r.societa)
  }
  const attiviFuoriRosa = attivi.filter((c) => !dentro(c)).map((c) => {
    const n = (c.player ?? '').trim().toLowerCase()
    /* Sta in un'altra rosa: e' uscito dalla Serie A, il contratto e' decaduto,
       e quando e' rientrato qualcun altro l'ha chiamato all'asta. */
    if (altrove.has(n)) return { ...c, perche: 'rientrato', dove: altrove.get(n) }
    if (aMaggio.has(n)) return { ...c, perche: 'tornato' }
    return { ...c, perche: 'fuori' }
  })
  /* L'ultimo bilancio **con un'asta dentro**. Dal 2026-27 esiste una riga di
     finanze prima che la stagione si giochi: ha i crediti iniziali e basta,
     `spesi` e `residui` sono vuoti apposta. Prenderla come «ultima» faceva
     aprire i Crediti su un bilancio senza niente da bilanciare. */
  const ultimaFinanza = (fi.dati ?? [])
    .filter((f) => f.spesi != null).map((f) => f.stagione).sort().pop()

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
                   bonus: f.bonus, ffp: f.ffp, base: f.base,
                   giovani: f.giovani, assicurazione: f.assicurazione }
        })()
      : null,
    stagioneFinanze: ultimaFinanza ?? null,
    /* Il bilancio di **ogni** stagione, non solo dell'ultima. Serve alla rosa:
       «265 crediti spesi all'asta» da solo non dice niente se chi legge non sa
       che quell'anno ne aveva 273. Il denominatore cambia ogni stagione -
       250 di base piu' il riporto e i premi - quindi non si puo' mettere una
       costante e nemmeno lasciarlo sottinteso. */
    finanzePerStagione: new Map(
      (fi.dati ?? []).filter((x) => x.societa === team.id)
        .map((x) => [x.stagione, x])
    ),
    movimenti: mo.dati ?? [],
    caricaMovimenti: mo.caricamento,
    /*
     * Gli slot: 3 difensori, 3 centrocampisti, 2 attaccanti. Nessun portiere,
     * perche' i portieri si comprano a squadre.
     *
     * Un contratto occupa uno slot **solo se il giocatore e' ancora in rosa**.
     * Tre societa' sfondano il tetto contandoli tutti — Armata Rossa 3
     * attaccanti, Smit e Subbuteo 4 centrocampisti — e in tutti e tre i casi
     * l'eccedenza e' uno che ha lasciato la Serie A: Gonzalez N., Pafundi,
     * F. Anderson. Contando chi c'e' davvero il regolamento torna su tutte e
     * dieci, e quel «torna su tutte e dieci» e' la prova che sia il registro
     * sia questa regola sono letti giusti.
     */
    contrattiAttivi: attiviInRosa,
    contrattiFuori: attiviFuoriRosa,
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
  /* Nel menu della rosa vanno solo le stagioni giocate: una stagione senza
     asta non ha una rosa da mostrare, e offrirla e' offrire una pagina vuota.
     Il budget del 2026-27 si vede nei Crediti, che e' il posto dove esiste. */
  const stagioni = useMemo(
    () => (anni.dati ?? []).filter((a) => a.conclusa).map((a) => a.id).sort().reverse(),
    [anni.dati]
  )
  const scelta = stagione ?? d.stagioneRosa
  const corrente = scelta === d.stagioneRosa

  /* La rosa dell'anno scelto. Quella corrente arriva gia' da `useSocieta`;
     per le altre si legge la stagione richiesta e basta. */
  const ro = useArchivio(['roseStagione', scelta],
    () => roseStagione(scelta), [scelta])

  /*
   * La rosa com'era all'asta.
   *
   * `rose` ha due momenti, come il listone: «fine» e' la rosa di maggio, quella
   * che il sito ha sempre mostrato; «partenza» e' quella uscita dall'asta di
   * settembre. Dove ci sono tutte e due si vede il mercato di gennaio — chi e'
   * uscito e chi e' arrivato — che prima non si poteva sapere: la rosa di
   * maggio contiene chi e' arrivato a gennaio e **non contiene chi e' uscito**,
   * quindi da sola non lo dice, e non dice nemmeno di non dirlo.
   */
  const roP = useArchivio(['roseStagione', scelta, 'partenza'],
    () => roseStagione(scelta, 'partenza'), [scelta])
  const partenza = useMemo(
    () => (roP.dati ?? []).filter((x) => x.societa === d.team.id),
    [roP.dati, d.team.id]
  )
  const dueRose = partenza.length > 0

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
  const quotazioni = useMemo(() => indice(li.dati?.righe), [li.dati])
  const allAsta = li.dati?.momento === 'partenza'

  /* La quotazione di fine anno, quando c'e'. Dal 2025-26 l'archivio ha tutti
     e due i listoni della stessa stagione: e' la prima volta, e permette di
     dire una cosa che prima non si poteva — di quanto un giocatore e'
     cresciuto *dentro* l'anno in cui l'hai avuto. */
  const quotFine = useMemo(() => indice(li.dati?.fine), [li.dati])
  const dueListoni = allAsta && quotFine.quante > 0

  /*
   * Chi e' sotto contratto in questa stagione.
   *
   * Un giocatore in rosa ci e' arrivato in due modi diversi, e la differenza
   * conta: o l'hai **comprato all'asta**, pagandolo, o ce l'avevi gia' perche'
   * e' **sotto contratto** — e allora all'asta non c'era proprio.
   *
   * Il contratto vale per gli anni fra `dalla` e `alla`, e si guarda la
   * stagione che si sta guardando: cosi' la colonna dice la verita' anche
   * sulle stagioni vecchie, non solo su quella in corso.
   *
   * Si aggancia col solito indice del listone: nome+ruolo, e il solo nome
   * quando non e' ambiguo. **Non indovina**: i contratti sono un foglio a
   * parte e ogni tanto scrivono il nome in un altro modo — nell'archivio c'e'
   * «Bastoni A.», nel contratto «Bastoni», e non si agganciano.
   *
   * Non ho messo un aggancio per cognome apposta: in Serie A i Bastoni sono
   * due, e tirare a indovinare qui vorrebbe dire attribuire un contratto a
   * chi non ce l'ha. Quello che manca lo dice la nota sotto la rosa, cosi'
   * e' una domanda da girare a chi tiene il foglio, non un buco silenzioso.
   */
  const contratti = useMemo(() => indice(
    (d.tuttiContratti ?? [])
      .filter((c) => c.from <= scelta && scelta <= c.to)
      // il registro dei contratti non porta la squadra di Serie A: qui il
      // club non c'e' e l'aggancio resta nome+ruolo
      .map((c) => ({ nome: c.player, ruolo: c.role, prezzo: c.to }))),
    [d.tuttiContratti, scelta]
  )

  /* Quali stagioni hanno il listone di partenza: dodici righe da una vista
     apposta. Serve a non scrivere in pagina un elenco che invecchia. */
  const mo = useArchivio('momentiDelListone', momentiDelListone)
  const conPartenza = mo.dati?.partenza ?? []

  const storia = useMemo(() => costruisciStoria(d.carriera), [d.carriera])

  const rosa = useMemo(() => {
    const aMaggio = corrente
      ? d.rosa
      : (ro.dati ?? []).filter((r) => r.societa === d.team.id)
          .map((r) => ({ id: r.calciatore, player: r.nome, role: r.ruolo,
                         club: r.club, cost: r.costo, stimato: r.costo_stimato,
                         apps: r.presenze,
                         fm: r.fm == null ? null : Number(r.fm) }))
    /* Chi c'era a settembre e a maggio non c'e' piu': senza queste righe la
       rosa d'agosto sarebbe incompleta e nessuno se ne accorgerebbe. */
    /* Si aggancia per id, e per nome dove l'id manca. Con la sola chiave `id`
       una rosa di partenza senza id darebbe «trentuno usciti e trentuno
       entrati»: un risultato assurdo che pero' *sembra* un dato. */
    const chiave = (id, nome) => (id != null ? `#${id}` : (nome ?? '').trim().toLowerCase())
    const restati = new Set(aMaggio.map((p) => chiave(p.id, p.player)))
    const aSettembre = new Set(partenza.map((x) => chiave(x.calciatore, x.nome)))
    const usciti = partenza
      .filter((x) => !restati.has(chiave(x.calciatore, x.nome)))
      .map((x) => ({ id: x.calciatore, player: x.nome, role: x.ruolo,
                     club: x.club, cost: x.costo, stimato: x.costo_stimato,
                     apps: null, fm: null }))

    return [...aMaggio, ...usciti]
      .map((p) => ({
        ...p,
        con: p.id != null ? storia.perGiocatore.get(p.id) : null,
        /* Quello che ha fatto **in questa stagione**, con questa maglia. */
        ora: p.id != null ? storia.perAnno.get(`${p.id}\u00b7${scelta}`) : null,
        quota: quotazioni.cerca(p.player, p.role, p.club),
        fine: quotFine.cerca(p.player, p.role, p.club),
        contratto: contratti.cerca(p.player, p.role),
        /* senza la rosa di partenza non si sa: allora c'erano tutti */
        sett: !dueRose || aSettembre.has(chiave(p.id, p.player)),
        maggio: restati.has(chiave(p.id, p.player)),
      }))
      /*
       * La quotazione da mostrare quando quella di settembre non c'e'.
       *
       * Il listone di partenza e' del 30 agosto: chi e' arrivato in Serie A
       * dopo non ci puo' essere. Fullkrug, Vaz, Zhegrova, Elmas — sono arrivati
       * a gennaio, e per loro l'unica quotazione che esiste e' quella di
       * maggio. Lasciare un trattino faceva sembrare l'archivio incompleto.
       *
       * **Si mostra, ma non si conta.** `quota` resta la quotazione vera di
       * settembre — null quando non c'e' — e tutte le somme continuano a
       * leggere quella. Una quotazione di maggio infilata in un totale di
       * settembre e' un numero misto che nessuno riesce piu' a smontare, e la
       * crescita «da settembre a maggio» calcolata su maggio meno maggio
       * darebbe uno zero finto.
       */
      .map((p) => ({ ...p, quotaVista: p.quota ?? p.fine, stimata: p.quota == null && p.fine != null }))
      .sort((a, b) => 'PDCA'.indexOf(a.role) - 'PDCA'.indexOf(b.role)
                      || (b.cost ?? 0) - (a.cost ?? 0))
  }, [corrente, d.rosa, ro.dati, d.team.id, storia, quotazioni, quotFine,
      contratti, partenza, dueRose, scelta])

  /* Il mercato di gennaio, contato. Se sono trentuno prima e trentuno dopo,
     usciti e entrati devono essere lo stesso numero. */
  const usciti = rosa.filter((p) => p.sett && !p.maggio)
  const entrati = rosa.filter((p) => !p.sett && p.maggio)

  /*
   * Quanto e' costato chi e' arrivato a mercato aperto.
   *
   * Sono crediti spesi davvero, e fino a ieri non stavano in nessun totale:
   * la card dell'asta conta la rosa di settembre, e loro a settembre non
   * c'erano. Il buco lo ha visto la Presidenza guardando la card «Entrati».
   *
   * **Restano una riga a parte, non entrano nel costo dell'asta.** Il prezzo
   * di chi arriva a gennaio e' di gennaio: sommarlo a settembre fa un numero
   * misto che nessuno riesce piu' a smontare, e romperebbe l'unica identita'
   * che oggi tiene i conti in piedi — `finanze.spesi` e' esattamente la somma
   * della rosa di settembre, venti societa' su venti.
   */
  const speseEntrati = entrati.reduce((n, p) => n + (p.cost ?? 0), 0)
  const entratiConCosto = entrati.filter((p) => p.cost != null).length

  /*
   * Dove la rosa di settembre e' ricostruita dal campo e non trascritta da un
   * file, «entrati» e «usciti» non sono mercato: sono in buona parte l'errore
   * della ricostruzione, che sul 2020-21 misurato vale il 22%. Il numero si
   * mostra lo stesso, ma detto per quello che e'.
   */
  const settRicostruita = partenza.length > 0 && partenza.every((x) => x.fonte === 'campo')

  /* Il budget di quella stagione, dove l'archivio ce l'ha. `finanze` copre le
     stagioni dal 2024-25 in poi: per le altre il denominatore non c'e' e la
     card non lo inventa, lo tace. */
  const bilancio = d.finanzePerStagione?.get(scelta) ?? null

  /*
   * Quanto e' rientrato per ognuno degli usciti.
   *
   * Il regolamento lo dice cinque volte, una per stagione: «i Calciatori
   * svincolati rendono il 50% del prezzo di acquisto estivo». Quindi accanto
   * al prezzo d'asta di chi se n'e' andato ci va il rimborso, altrimenti la
   * riga racconta mezzo movimento e il rosso sembra una perdita secca quando
   * meta' di quella cifra e' tornata in cassa.
   *
   * Le eccezioni non le calcolo, le leggo: chi e' arrivato per scambio rende
   * un credito solo — «i Calciatori scambiati possono anche essere svincolati
   * ma si riceve un credito solo», DPCM 03.02.2021 — e nel registro quel
   * credito c'e' gia' scritto. Meglio prendere il numero vero che rifare il
   * conto e sbagliare i casi particolari.
   */
  const rimborsi = useMemo(() => {
    const m = new Map()
    for (const v of d.movimenti ?? []) {
      if (v.categoria !== 'mercato' || v.stagione !== scelta || v.crediti <= 0) continue
      m.set((v.voce ?? '').trim().toLowerCase(), v.crediti)
    }
    return m
  }, [d.movimenti, scelta])

  /* Va **dopo** `rimborsi`, non prima: e' una const, e leggerla prima della
     sua riga di dichiarazione non da' undefined - da' ReferenceError, e la
     pagina muore in render senza scrivere niente a schermo. L'avevo messa
     accanto agli altri conti degli usciti perche' era il posto giusto per
     leggerla, e non e' il posto dove poteva stare. */
  const rimborsiTot = usciti.reduce(
    (n, p) => n + (rimborsi.get((p.player ?? '').trim().toLowerCase()) ?? 0), 0)

  /*
   * Gli usciti che nel registro non hanno un rimborso.
   *
   * Sono 106 su 207 dal 2020-21 in poi: solo il 2022-23 e' quasi completo.
   * Finche' si leggeva il solo registro, quei giocatori risultavano usciti
   * **senza rendere niente** - una perdita secca, che il regolamento non
   * prevede: «i Calciatori svincolati rendono il 50% del prezzo di acquisto
   * estivo». Con tre uscite e tre entrate da un credito il conto veniva +3
   * invece di zero, ed e' la Presidenza ad averlo visto.
   *
   * Dove il registro tace si applica la regola, ma **solo a chi e' stato
   * svincolato davvero**: se a maggio il giocatore sta nella rosa di un'altra
   * societa' non e' uno svincolo, e' un passaggio, e li' il prezzo lo fanno i
   * due mister - non il regolamento. Per distinguerli serve la rosa di maggio
   * di tutta la lega, che e' gia' caricata: `ro.dati` non e' filtrata.
   */
  const rimborsoStimato = useMemo(() => {
    const altrove = new Set(
      (ro.dati ?? []).filter((r) => r.societa !== d.team.id && r.calciatore != null)
        .map((r) => r.calciatore)
    )
    let crediti = 0; let quanti = 0
    for (const p of usciti) {
      if (rimborsi.get((p.player ?? '').trim().toLowerCase()) != null) continue
      if (p.id != null && altrove.has(p.id)) continue      // passato, non svincolato
      crediti += Math.ceil((p.cost ?? 0) / 2); quanti += 1
    }
    return { crediti, quanti }
  }, [usciti, rimborsi, ro.dati, d.team.id])

  /* I numeri in testa parlano della rosa d'asta quando c'e': «calciatori» e
     «crediti spesi» sono cose di settembre, non dell'unione dei due momenti. */
  const rosaAsta = dueRose ? rosa.filter((p) => p.sett) : rosa
  const r = riepilogoRosa(rosaAsta)
  /*
   * La colonna «Mercato» esce solo dove c'e' la rosa d'asta.
   *
   * Serve la rosa di settembre per poter dire «asta»: senza, non si sa chi
   * c'era all'asta e chi e' arrivato a gennaio, e chiamarli tutti allo stesso
   * modo sarebbe scrivere in pagina una cosa che non sappiamo.
   *
   * Le stagioni vecchie hanno la sola rosa di maggio, quindi niente colonna.
   * Quando arriva anche la loro rosa d'asta, la colonna le segue da sola.
   */
  const mostraMercato = dueRose

  /*
   * I contratti attivi che in rosa non trovano nessuno.
   *
   * Tre motivi diversi, e la pagina non sa distinguerli:
   *
   *   - ha lasciato la Serie A, e allora il contratto e' **decaduto**: e' la
   *     regola, e nel 2025-26 spiega tutti i casi tranne i refusi;
   *   - il nome e' scritto in due modi fra i due fogli, e allora e' un refuso.
   *
   * In tutti e due i casi va **detto**. Un contratto che sparisce senza
   * lasciare traccia e' peggio di un contratto sbagliato: nessuno lo cerca.
   */
  const spaiati = useMemo(() => {
    if (!dueRose) return []
    const inRosa = new Set()
    for (const p of rosa) {
      const n = (p.player ?? '').trim().toLowerCase()
      inRosa.add(n)
      inRosa.add(`${n}\u00b7${p.role}`)
    }
    return (d.tuttiContratti ?? [])
      .filter((c) => c.from <= scelta && scelta <= c.to)
      .filter((c) => {
        const n = (c.player ?? '').trim().toLowerCase()
        return !inRosa.has(n) && !inRosa.has(`${n}\u00b7${c.role}`)
      })
  }, [d.tuttiContratti, scelta, rosa, dueRose])

  /*
   * I totali contano anche la quotazione di ripiego, ed e' una scelta.
   *
   * Avevo tenuto fuori dai conti chi non era sul listone di settembre, per non
   * mescolare due date. La Presidenza ha deciso diversamente, e ha ragione:
   * **un valore della rosa che salta tre giocatori su trentuno non e' parziale,
   * e' falso.** Il ripiego sposta il rapporto di frazioni di centesimo, e nel
   * caso peggiore lo lascia identico; il buco invece cambia il totale.
   *
   * Resta fuori una cosa sola: il verde e il rosso dell'«affare». Quello
   * confronta quanto hai pagato all'asta con quanto valeva **quel giorno**, e
   * su chi a quel giorno non era in Serie A non e' un giudizio severo — e' un
   * giudizio su una scommessa che non hai mai fatto.
   */
  /*
   * L'interruttore fra la stagione e la carriera.
   *
   * Le stesse diciannove colonne, due contenuti: quello che ha fatto **in
   * questa stagione** con questa maglia, oppure **da quando e' qui**. Non due
   * tabelle affiancate e non trenta colonne: la stessa tabella che risponde a
   * due domande, una per volta.
   *
   * Cambiano solo le colonne del rendimento. Costo, quotazione e mercato
   * restano della stagione scelta, perche' quelli una carriera non ce l'hanno:
   * un giocatore non ha «il costo di tutti gli anni», ne ha uno per anno.
   */
  const [vista, setVista] = useState('stagione')
  const perVista = (p) => (vista === 'carriera' ? p.con : p.ora)

  const conQuota = rosaAsta.filter((p) => p.quotaVista != null)
  const quotaTot = conQuota.reduce((n, p) => n + p.quotaVista, 0)
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
    if (!quotazioni.quante || !allAsta) return null
    const tutte = dueRose ? (roP.dati ?? []) : (ro.dati ?? [])
    let spesa = 0
    let quota = 0
    for (const x of tutte) {
      // Lo stesso ripiego della tabella, e per forza: se il tuo rapporto
      // contasse i giocatori di gennaio e quello della lega no, il confronto
      // sarebbe fra due conti fatti con regole diverse.
      const q = quotazioni.cerca(x.nome, x.ruolo, x.club)
        ?? quotFine.cerca(x.nome, x.ruolo, x.club)
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
  }, [ro.dati, roP.dati, dueRose, quotazioni, quotaTot, pagatoSuQuotati, allAsta])

  /*
   * Quanto e' cresciuta la rosa dentro l'anno.
   *
   * Serve una stagione che abbia **tutti e due** i listoni: quello di
   * partenza e quello scaricato alla fine. E' un confronto onesto perche' e'
   * la stessa moneta a due date diverse — non il costo d'asta contro una
   * quotazione, che sarebbe mescolare due monete.
   *
   * Il totale non e' un guadagno in crediti: nessuno ti paga la crescita.
   * E' una fotografia di quanto hai visto giusto — e di chi ti si e' rotto
   * in mano.
   */
  const crescita = useMemo(() => {
    if (!dueListoni) return null
    /* Sulla rosa che hai **comprato**, non su quella di maggio: la crescita di
       un giocatore arrivato a gennaio non l'hai vista tu, e quella di uno che
       hai svincolato l'hai vista per mezza stagione. Dove la rosa di partenza
       non c'e', `sett` e' vero per tutti e il conto e' come prima. */
    /* Gli **stessi** giocatori del riquadro qui sopra, e con la stessa
       quotazione: `quotaVista`, che dove manca settembre ripiega su maggio.
       Con `quota` questa scheda contava 30 giocatori e quella sopra 31, e i
       due totali della stessa rosa nella stessa pagina non combaciavano —
       325 qui, 337 là. Due numeri diversi per la stessa cosa sono un numero
       sbagliato e mezzo, non due mezze verita'. */
    const con = rosa
      .filter((p) => p.sett && p.quotaVista != null && p.fine != null)
      .map((p) => ({ ...p, delta: p.fine - p.quotaVista }))
    if (!con.length) return null
    const perDelta = [...con].sort((a, b) => b.delta - a.delta)
    return {
      quanti: con.length,
      daPartenza: con.reduce((n, p) => n + p.quotaVista, 0),
      aFine: con.reduce((n, p) => n + p.fine, 0),
      su: perDelta.filter((p) => p.delta > 0).slice(0, 3),
      giu: perDelta.filter((p) => p.delta < 0).slice(-3).reverse(),
    }
  }, [rosa, dueListoni])

  /*
   * I volti nuovi: chi non ha nessuna stagione con noi **prima** di quella
   * scelta. Contare «una stagione sola in tutto» sarebbe sbagliato guardando
   * l'archivio: uno che ha giocato nel 2019-20 e nel 2020-21, aperto il
   * 2019-20, era nuovo lo stesso — le sue due stagioni una e' quella e
   * l'altra viene dopo.
   */
  /*
   * Sulla stessa rosa di cui parlano le altre schede, cioe' `rosaAsta`.
   *
   * Prima si contavano su `rosa`, che e' l'unione di settembre e maggio, mentre
   * il totale accanto veniva da settembre: usciva «33 volti nuovi su 28», che
   * e' un numero impossibile e infatti si vedeva a occhio. Due schede vicine
   * devono parlare della stessa gente, se no una delle due mente.
   */
  const volti = rosaAsta.filter(
    (p) => !(p.con?.stagioni ?? []).some((a) => a < scelta)
  ).length
  const piuCaro = rosaAsta.reduce((max, p) => ((p.cost ?? 0) > (max?.cost ?? 0) ? p : max), null)

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
          {/* Il denominatore prima del numeratore: quanti crediti aveva quella
              stagione. Senza, «265 spesi all'asta» e' un numero sospeso - non
              si sa se sia stata una spesa prudente o tutto il budget. E il
              budget cambia ogni anno, quindi non e' una cosa che il lettore
              possa sapere da se'. */}
          {bilancio?.iniziali != null && (
            <Numeretto n={bilancio.iniziali} etichetta="Crediti iniziali"
                       nota={`${bilancio.base ?? 250} di base, più riporto e premi`} />
          )}
          {/* Tre stati, e vanno detti tutti e tre. Un totale pieno non ha
              nota. Un totale con dentro dei prezzi dedotti dal sostituto lo
              dichiara, se no fra sei mesi nessuno sa piu' quale parte e'
              trascritta. E dove mancano ancora delle righe, si dice quante. */}
          <Numeretto n={r.spent} etichetta="Crediti spesi all'asta" oro
                     nota={[
                       bilancio?.iniziali != null
                         ? `su ${bilancio.iniziali} disponibili`
                         : null,
                       r.conCosto < r.size
                         ? `${r.conCosto} dei ${r.size} con un prezzo`
                         : null,
                       r.stimati > 0
                         ? `${r.stimati} dedotti da chi ha preso il posto`
                         : null,
                     ].filter(Boolean).join(' · ') || undefined} />
          {dueRose && entrati.length > 0 && (
            <Numeretto n={speseEntrati} etichetta="Comprati a mercato aperto" oro
                       nota={settRicostruita
                         ? `${entrati.length} arrivi — ma la rosa di settembre è ricostruita: conta poco`
                         : `${entratiConCosto} arrivi su ${entrati.length} con un prezzo`} />
          )}
          {/* La spesa finale: quello che quella stagione e' costata davvero.
              L'asta e' solo il primo pezzo, e finche' era l'unico numero in
              pagina sembrava il totale. I rientrati sono quelli scritti nel
              registro piu' quelli che il regolamento impone dove il registro
              non ha la riga: la nota dice quanti sono i secondi, perche' un
              numero per regola non e' un numero trascritto. */}
          {dueRose && (speseEntrati > 0 || rimborsiTot + rimborsoStimato.crediti > 0) && (
            <Numeretto n={r.spent + speseEntrati - rimborsiTot - rimborsoStimato.crediti}
                       etichetta="Spesa finale" oro
                       nota={[
                         `${r.spent} all'asta + ${speseEntrati} dopo − ${rimborsiTot + rimborsoStimato.crediti} rientrati`,
                         rimborsoStimato.quanti > 0
                           ? `di cui ${rimborsoStimato.crediti} per regolamento su ${rimborsoStimato.quanti} svincoli non a registro`
                           : null,
                       ].filter(Boolean).join(' · ')} />
          )}
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
                       nota={`${liberiTot(d.contrattiAttivi)} posti liberi su 8`
                         + ` — 3 D, 3 C, 2 A`} />
          )}
          {dueRose && (
            <Numeretto n={usciti.length} etichetta="Cambiati a gennaio"
                       nota={`${usciti.length} fuori, ${entrati.length} dentro`} />
          )}
        </div>

        {/* Il mercato di gennaio, con i nomi. La rosa di maggio da sola non
            puo' dirlo: contiene chi e' arrivato e non contiene chi e' uscito. */}
        {dueRose && (usciti.length > 0 || entrati.length > 0) && (
          <section className="ro-confronto card">
            <h2>Il mercato di gennaio</h2>
            <p className="ro-nota">
              La rosa era di <b>{rosaAsta.length}</b> a settembre ed è di{' '}
              <b>{rosa.filter((x) => x.maggio).length}</b> a maggio: chi è uscito
              dev'essere quanti sono entrati. Qui sono <b>{usciti.length}</b> e{' '}
              <b>{entrati.length}</b>.
            </p>
            <p className="ro-nota">
              Accanto a chi è uscito c'è il prezzo che avevi pagato all'asta e, in
              verde, <b>quanto è rientrato in cassa</b>: il regolamento dice che «i
              Calciatori svincolati rendono il 50% del prezzo di acquisto estivo».
              Chi era arrivato per scambio rende <b>un credito solo</b>, e nel
              registro quel credito è già scritto — non lo ricalcolo, lo leggo.
            </p>
            <div className="cr-liste">
              <Movimenti titolo="Usciti" righe={usciti} verso="giu" rimborsi={rimborsi} />
              <Movimenti titolo="Entrati" righe={entrati} verso="su" />
            </div>
            {/* Il conto della stagione, in chiaro. Tre voci separate: quello
                che si e' speso all'asta resta di settembre, quello che si e'
                speso a mercato aperto resta di gennaio, e il rimborso e' la
                meta' che il regolamento fa tornare in cassa. Sommarne due in
                una casella sola farebbe sparire la differenza fra le date. */}
            <p className="ro-nota">
              I conti della stagione, tenuti separati: <b>{r.spent}</b> crediti
              all'asta di settembre, <b>{speseEntrati}</b> per chi è arrivato
              dopo, <b>+{rimborsiTot}</b> rientrati dagli svincoli.{' '}
              {settRicostruita
                ? <>Le due cifre di gennaio però vanno prese con le molle:
                    per il {scelta} la rosa di settembre non è trascritta da un
                    file, è <b>ricostruita dal campo</b>, e sulla stagione dove
                    abbiamo potuto misurarla azzeccava il <b>78%</b> dei nomi.
                    Una parte di questi «arrivi» è quell'errore, non mercato.</>
                : <>Fa <b>{r.spent + speseEntrati - rimborsiTot}</b> di esborso
                    netto sulla stagione.</>}
            </p>
          </section>
        )}

        {conQuota.length > 0 && !allAsta && (
          <section className="ro-confronto card">
            <h2>Quanto valevano a fine stagione</h2>
            <p className="ro-nota">
              Per il {scelta} l'archivio ha il listone <b>scaricato dopo</b>, non
              quello di partenza. È una quotazione che sa già com'è andata:
              chi si è fatto male è sceso, chi ha segnato è salito. Serve a
              dire quanto è valso un giocatore in quell'anno, <em>non</em> a
              giudicare l'asta — accanto al costo racconterebbe due date
              diverse.{' '}
              {conPartenza.length
                ? <>Il confronto vero si vede sulle stagioni che hanno{' '}
                   <b>tutti e due</b> i listoni: {elenco(conPartenza)}. Là una
                   riga come Simeone del 2025-26 — <b>10</b> a settembre,{' '}
                   <b>30</b> a maggio — si legge per intero.</>
                : <>Il confronto con l'asta torna anche qui quando arrivano i
                   listoni d'inizio stagione di Guido.</>}
            </p>
          </section>
        )}

        {crescita && (
          <section className="ro-confronto card">
            <h2>Quanto valevano a fine stagione</h2>
            <p className="ro-nota">
              Il {scelta} ha <b>tutti e due</b> i listoni: quello di partenza,
              davanti al quale hai fatto l'asta, e quello scaricato alla fine.
              Stessa moneta, due date — quindi il confronto regge, e dice una
              cosa che il costo d'asta non può dire: di quanto un giocatore è
              cresciuto <em>mentre</em> era tuo.
            </p>
            <div className="cr-somma">
              <span>
                {crescita.quanti} giocatori quotati: <b>{crescita.daPartenza}</b> a
                settembre, <b>{crescita.aFine}</b> a maggio
              </span>
              <b className={`num cr ${verso(crescita.aFine - crescita.daPartenza)}`}>
                {segno(crescita.aFine - crescita.daPartenza)}
              </b>
            </div>
            <div className="cr-liste">
              <Salita titolo="Cresciuti in mano tua" righe={crescita.su} />
              <Salita titolo="Scesi" righe={crescita.giu} />
            </div>
            <p className="ro-nota ro-nota-fine">
              Non è un guadagno in crediti: nessuno ti paga la crescita. È la
              misura di quanto hai visto giusto — e di chi ti si è rotto in mano.
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

        <nav className="ro-schede ro-vista" role="tablist">
          <span>Numeri</span>
          {[['stagione', `Stagione ${scelta}`], ['carriera', 'Da quando è qui']].map(([k, testo]) => (
            <button key={k} type="button" role="tab" aria-selected={vista === k}
                    className={vista === k ? 'on' : ''} onClick={() => setVista(k)}>
              {testo}
            </button>
          ))}
        </nav>

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
          /* Il reparto si conta sulla rosa d'asta: con le due rose il gruppo
             contiene anche chi e' uscito a gennaio, e «9 attaccanti» sarebbe
             un numero che nella rosa non e' mai esistito. */
          const diSettembre = gruppo.filter((p) => p.sett)
          const spesi = diSettembre.reduce((n, p) => n + (p.cost ?? 0), 0)
          return (
            <section key={ruolo} className="ro-reparto card">
              <h2>
                <span className={`badge role-${ruolo}`}>{ruolo}</span>
                {nomeRuolo(ruolo)}
                <em>{diSettembre.length} · {spesi} crediti</em>
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
                      {dueListoni && (
                        <th title="Quotazione dello stesso giocatore sul listone scaricato a fine stagione">
                          Quot. fine
                        </th>
                      )}
                      {mostraMercato && (
                        <th title="Come è arrivato: sotto contratto, comprato all’asta, o preso a gennaio">
                          Mercato
                        </th>
                      )}
                      <th title="In quante stagioni ha portato questa maglia">Con noi</th>
                      {/* Da qui in poi è tutto della stagione scelta, e le
                          colonne sono le stesse per tutti e quattro i reparti:
                          se il portiere ha una tabella diversa dagli altri,
                          scorrendo la pagina non si allinea niente. */}
                      <th title={vista === 'carriera'
                        ? 'Partite con questa maglia in tutte le stagioni, campionato e coppe'
                        : `Partite del ${scelta} in cui l’hai schierato e ha preso voto,`
                          + ' campionato e coppe insieme'}>Pres.</th>
                      <th title={vista === 'carriera'
                        ? 'Media voto di tutte le partite giocate con questa maglia'
                        : 'Media voto nelle partite in cui l’hai schierato tu'}>MV</th>
                      <th title={vista === 'carriera'
                        ? 'Media delle sue fantamedie di Serie A, una per stagione'
                        : 'Fantamedia in Serie A: tutte le sue partite, anche quelle in cui non l’hai schierato'}>FM</th>
                      <th>Gol</th>
                      <th>Assist</th>
                      <th title="Rigori segnati">Rig.</th>
                      <th title="Rigori sbagliati">Rig. sb.</th>
                      <th title="Ammonizioni">Amm.</th>
                      <th title="Espulsioni">Esp.</th>
                      <th title="Porte inviolate">Imb.</th>
                      <th title="Gol subiti">Gol sub.</th>
                      <th title="Rigori parati">Rig. par.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gruppo.map((p, i) => (
                      <tr key={p.id ?? i}
                          className={!dueRose || (p.sett && p.maggio) ? undefined
                            : p.sett ? 'ro-uscito' : 'ro-entrato'}>
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
                          <td className={`num ro-quota ${p.stimata ? 'ro-stimata' : allAsta ? scarto(p) : ''}`}
                              title={p.stimata
                                ? 'Non era sul listone di settembre: è arrivato in Serie A dopo.'
                                  + ' Questa è la sua quotazione di fine stagione.'
                                : undefined}>
                            {p.quotaVista ?? <i className="zero">—</i>}
                          </td>
                        )}
                        {/* Verde e rosso qui non giudicano l'asta: confrontano
                            la stessa quotazione a settembre e a maggio. */}
                        {dueListoni && (
                          <td className={`num ro-quota ${p.quota != null && p.fine != null
                            ? `cr ${verso(p.fine - p.quota)}` : ''}`}
                              title={p.quota != null && p.fine != null
                                ? `Da ${p.quota} di settembre a ${p.fine} di maggio: ${segno(p.fine - p.quota)}`
                                : 'Non era sul listone di partenza'}>
                            {p.fine ?? <i className="zero">—</i>}
                          </td>
                        )}
                        {mostraMercato && <td className="num ro-mercato">{pastigliaMercato(p, dueRose)}</td>}
                        <td className="num">
                          {p.con
                            ? <span className="ro-anni" title={p.con.stagioni.join(' · ')}>
                                {p.con.stagioni.length}
                                {p.con.stagioni.length === 1 ? ' stagione' : ' stagioni'}
                              </span>
                            : <span className="zero">mai schierato</span>}
                        </td>
                        <td className="num muted">{conta(perVista(p), perVista(p)?.con_voto)}</td>
                        <td className="num">{due2(perVista(p)?.mv)}</td>
                        <td className="num ro-fm">{due2(vista === 'carriera'
                          ? p.con?.fm : (p.fm ?? p.ora?.fm))}</td>
                        <td className="num">{conta(perVista(p), perVista(p)?.gol)}</td>
                        <td className="num muted">{conta(perVista(p), perVista(p)?.assist)}</td>
                        <td className="num muted">{conta(perVista(p), perVista(p)?.rigori)}</td>
                        <td className="num muted">{conta(perVista(p), perVista(p)?.rigori_sbagliati)}</td>
                        <td className="num ro-giallo">{conta(perVista(p), perVista(p)?.gialli)}</td>
                        <td className="num ro-rosso">{conta(perVista(p), perVista(p)?.rossi)}</td>
                        {/* Le tre dei portieri ci sono per tutti, ma a un
                            difensore non si mette uno zero: uno zero e' un
                            dato, e «porte inviolate: 0» di un attaccante non
                            e' un dato — e' una casella che non lo riguarda. */}
                        <td className="num">{ruolo === 'P' ? conta(perVista(p), perVista(p)?.imbattuto) : <i className="zero">·</i>}</td>
                        <td className="num muted">{ruolo === 'P' ? conta(perVista(p), perVista(p)?.gol_subiti) : <i className="zero">·</i>}</td>
                        <td className="num muted">{ruolo === 'P' ? conta(perVista(p), perVista(p)?.rigori_parati) : <i className="zero">·</i>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}

        {spaiati.length > 0 && (
          <p className="ro-nota ro-spaiati">
            <b>{spaiati.length === 1 ? 'Un contratto attivo non trova' : `${spaiati.length} contratti attivi non trovano`}</b>
            {' '}il giocatore in rosa:{' '}
            {spaiati.map((c) => `${c.player} (${c.role}, fino al ${c.to})`).join(', ')}.
            {' '}Quasi sempre vuol dire <b>contratto decaduto</b>: chi lascia la Serie A
            il contratto lo perde. Il dettaglio è nella pagina Contratti.
          </p>
        )}

        <p className="ro-nota">
          {vista === 'carriera' ? (
            <>Da <b>Pres.</b> in poi sono i <em>totali di tutte le stagioni</em> con
            questa maglia. Costo, quotazione e mercato no: quelli restano del{' '}
            <b>{scelta}</b>, perché un giocatore non ha «il costo di tutti gli anni»
            — ne ha uno per anno.</>
          ) : (
            <>Da <b>Pres.</b> in poi è tutto <em>della stagione che stai guardando</em>,
            e con questa maglia: le partite in cui l'hai schierato tu, non quelle che
            ha giocato in Serie A. Con l'interruttore in cima si passa ai totali di
            tutti gli anni.</>
          )}
        </p>
        <p className="ro-nota">
          <b>MV</b> e <b>FM</b> non sono lo stesso conto fatto in due modi:{' '}
          <b>MV</b> è la media dei voti nelle partite in cui <em>tu</em> l'hai
          schierato; <b>FM</b> è la fantamedia che Fantapazz gli dà in Serie A,
          su <em>tutte</em> le sue partite. Uno che ha giocato trenta giornate e
          che tu hai messo in campo sette volte ha due numeri diversi, ed è
          giusto così. <b>Imb.</b>, <b>Gol sub.</b> e <b>Rig. par.</b> riguardano
          solo i portieri: negli altri reparti la casella resta vuota, non a zero.
          Il nome apre la sua scheda, dove c'è anche quello che ha fatto per le
          altre società.
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
              Di questa società l'archivio tiene <b>{d.tuttiContratti.length} contratti</b>,
              presi dal registro della Presidenza, e{' '}
              <b>{d.tuttiContratti.filter((c) => c.clausola != null).length}</b> portano la
              clausola di riscatto. L'<b>ingaggio</b> no: quella colonna è ancora
              vuota, e finché lo è un «monte ingaggi» sarebbe un numero inventato.
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
              Fantapazz muove le quotazioni durante l'anno, e non tutte le
              stagioni hanno la stessa fotografia. Il listone <b>di partenza</b>{' '}
              — quello che i mister avevano davanti all'asta — l'archivio ce
              l'ha per {conPartenza.length ? <b>{elenco(conPartenza)}</b> : <b>nessuna stagione</b>};
              lì la colonna si chiama «Quot.». Dove c'è solo la quotazione{' '}
              <b>di fine</b> la colonna lo dice — «Quot. fine» — e non coloriamo
              affari e pagati-troppo, perché sarebbe un giudizio dato con la
              moviola. Questo elenco non è scritto qui: lo chiediamo
              all'archivio ogni volta, così non invecchia.
            </p>
            <p>
              Chi è arrivato in Serie A <b>dopo</b> il listone di partenza — è
              del 30 agosto, e il mercato ha chiuso il 1º settembre — una
              quotazione di settembre non ce l'ha. In tabella mostriamo la sua
              di maggio, <i>in corsivo</i>, e <b>conta nel valore della rosa</b>:
              un totale che salta tre giocatori su trentuno non è parziale, è
              falso. Non conta invece fra gli affari, perché all'asta quel
              giocatore non c'era.
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
      <UsciteSocieta teamId={d.team.id} stagione={scelta} />
    </>
  )
}

/** Chi e' uscito e chi e' entrato a gennaio, col costo di quando e' arrivato. */
function Movimenti({ titolo, righe, verso: v, rimborsi }) {
  if (!righe.length) return <div className="cr-lista"><h3>{titolo}</h3>
    <p className="vuoto">Nessuno.</p></div>
  const reso = (p) => rimborsi?.get((p.player ?? '').trim().toLowerCase())
  const totale = rimborsi
    ? righe.reduce((n, p) => n + (reso(p) ?? 0), 0)
    : 0
  return (
    <div className="cr-lista">
      <h3>{titolo} · {righe.length}
        {totale > 0 && <em className="cr-reso-tot">+{totale} rientrati</em>}
      </h3>
      {righe.map((p) => {
        const r = reso(p)
        return (
          <div className="cr-riga" key={p.id ?? p.player}>
            <span className="cr-chi">
              {p.id != null
                ? <Link to={`/giocatori/${p.id}`}>{p.player}</Link>
                : p.player}
            </span>
            <span className="cr-da">{p.club ? `${p.role} · ${p.club}` : p.role}</span>
            <b className={`num cr ${r != null ? '' : v}`}>
              {p.cost ?? '—'}
              {r != null && <i className="cr-reso">+{r}</i>}
            </b>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Tre nomi e di quanto si sono mossi.
 *
 * Tre e non dieci: una lista di dieci righe si legge come una tabella, e una
 * tabella l'abbiamo gia' sotto. Qui serve il titolo del giornale, non l'elenco.
 */
function Salita({ titolo, righe }) {
  if (!righe.length) return null
  return (
    <div className="cr-lista">
      <h3>{titolo}</h3>
      {righe.map((p) => (
        <div className="cr-riga" key={p.id ?? p.player}>
          <span className="cr-chi">
            {p.id != null
              ? <Link to={`/giocatori/${p.id}`}>{p.player}</Link>
              : p.player}
          </span>
          <span className="cr-da">{p.quotaVista} → {p.fine}</span>
          <b className={`num cr ${verso(p.delta)}`}>{segno(p.delta)}</b>
        </div>
      ))}
    </div>
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

/**
 * I cinque presi meglio, o i cinque pagati peggio.
 *
 * **Solo chi aveva una quotazione di settembre.** Il ripiego sulla quotazione
 * di maggio entra nei totali — il valore della rosa dev'essere quello vero —
 * ma qui no: questa e' la classifica di come e' andata l'asta, e uno che il
 * giorno dell'asta non era in Serie A all'asta non c'era.
 *
 * Senza questo filtro `costo - null` in JavaScript fa `costo`, e Fullkrug
 * pagato 17 compariva fra i «pagati troppo» con un +17 inventato di sana
 * pianta. Un difetto nato mentre ne sistemavo un altro.
 */
function affari(righe, verso) {
  return [...righe]
    .filter((p) => p.quota != null)
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
  /* La riga di un giocatore in *una* stagione. La tabella della rosa mostra
     quella: se guardo il 2025-26 voglio i gol del 2025-26, non quelli di sei
     anni sommati. La somma resta, ma sta in «Con noi» e ci si arriva apposta. */
  const perAnno = new Map()

  for (const r of righe ?? []) {
    perAnno.set(`${r.calciatore}\u00b7${r.stagione}`, r)
    const c = perGiocatore.get(r.calciatore) ?? {
      id: r.calciatore, nome: r.nome, ruolo: r.ruolo, stagioni: [],
      con_voto: 0, convocato: 0, gol: 0, assist: 0, gialli: 0, rossi: 0,
      rigori: 0, rigori_sbagliati: 0, rigori_parati: 0, autogol: 0,
      imbattuto: 0, gol_subiti: 0, speso: 0, voti: 0, mv: null,
      fmSomma: 0, fmQuante: 0, fm: null,
    }
    c.stagioni.push(r.stagione)
    c.con_voto += r.con_voto ?? 0
    c.convocato += r.convocato ?? 0
    c.gol += r.gol ?? 0
    c.assist += r.assist ?? 0
    c.gialli += r.gialli ?? 0
    c.rossi += r.rossi ?? 0
    c.rigori += r.rigori ?? 0
    c.rigori_sbagliati += r.rigori_sbagliati ?? 0
    c.rigori_parati += r.rigori_parati ?? 0
    c.autogol += r.autogol ?? 0
    c.imbattuto += r.imbattuto ?? 0
    c.gol_subiti += r.gol_subiti ?? 0
    c.speso += r.costo ?? 0
    if (r.mv != null) c.voti += Number(r.mv) * (r.con_voto ?? 0)
    c.mv = c.con_voto ? +(c.voti / c.con_voto).toFixed(2) : null
    /* La media voto si pesa sulle partite, perche' e' una media di voti presi
       da lui e sappiamo quanti sono. La fantamedia no: e' un numero di
       Fantapazz calcolato su **tutte** le partite di Serie A, e quante siano
       questa vista non lo sa. Pesarla sulle presenze in Caprera sarebbe una
       media pesata col peso sbagliato — meglio la media semplice delle sue
       stagioni, che almeno e' quello che dice di essere. */
    if (r.fm != null) { c.fmSomma += Number(r.fm); c.fmQuante += 1 }
    c.fm = c.fmQuante ? +(c.fmSomma / c.fmQuante).toFixed(2) : null
    perGiocatore.set(r.calciatore, c)

    const st = perStagione.get(r.stagione) ?? { stagione: r.stagione, speso: 0, quanti: 0 }
    st.speso += r.costo ?? 0
    st.quanti += 1
    perStagione.set(r.stagione, st)
  }

  for (const c of perGiocatore.values()) c.stagioni.sort()

  return {
    perGiocatore,
    perAnno,
    perStagione: [...perStagione.values()].sort((a, b) => a.stagione.localeCompare(b.stagione)),
    stagioni: [...perStagione.keys()].sort(),
  }
}

const ORDINE_ROSA = {
  costo: (a, b) => (b.cost ?? 0) - (a.cost ?? 0),
  quota: (a, b) => (b.quota ?? 0) - (a.quota ?? 0),
  stagioni: (a, b) => (b.con?.stagioni.length ?? 0) - (a.con?.stagioni.length ?? 0)
    || (b.cost ?? 0) - (a.cost ?? 0),
  gol: (a, b) => (b.ora?.gol ?? 0) - (a.ora?.gol ?? 0),
  fm: (a, b) => (Number(b.fm ?? b.ora?.fm) || -1) - (Number(a.fm ?? a.ora?.fm) || -1),
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

      {d.contrattiFuori.length > 0 && (
        <section className="pannello card">
          <h2>Decaduti</h2>
          <p className="pannello-sub">
            <b>Un contratto decade quando il giocatore lascia la Serie A.</b> Non è
            sospeso e non aspetta: è finito. Se un giorno rientra, rientra libero, e
            chi lo vuole se lo ricompra all'asta. Non occupano nessuno slot.
          </p>
          <ul className="lista-contratti">
            {d.contrattiFuori.map((c, i) => (
              <li key={i} className="fuori">
                <span className={`badge role-${c.role}`}>{c.role}</span>
                <b>{c.player}</b>
                {c.under && <em className="u">Under</em>}
                <span className="motivo">
                  {c.perche === 'rientrato'
                    ? <>uscito dalla Serie A, rientrato col <b>{teamName(c.dove)}</b></>
                    : c.perche === 'tornato'
                      ? 'è in rosa a maggio ma non era all\u2019asta'
                      : 'ha lasciato la Serie A'}
                </span>
                <span className="num scad">fino al {c.to}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

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

/**
 * Le sette categorie del registro, con il nome che si legge e una riga che
 * dice cosa ci sta dentro. L'ordine non e' alfabetico: prima quello che si
 * vince sul campo, poi quello che si vince a tavolino, poi quello che si perde.
 */
const CONTI = [
  ['classifiche', 'Classifiche', 'Fantapunti e capocannoniere'],
  ['diritti-tv', 'Diritti TV', 'Coppe europee, Coppa Italia, Supercoppe'],
  ['serie-a-awards', 'Serie A Awards', 'Il migliore per ruolo, e l’MVP'],
  ['premi-caprera', 'Premi Caprera', 'Fair Play, Panchina d’Oro, Ranking, Zdenek, Paratici'],
  ['giochi', 'Giochi', 'MrChampions e Grigliata'],
  ['assicurazioni', 'Assicurazioni', 'Rimborsi sugli infortuni'],
  ['penalita', 'Penalità', 'Formazioni non date, ritardi, Fair Play Finanziario, codice etico'],
]

/** Le righe di una stagione, raccolte nei conti che le contengono. */
function raccogli(righe) {
  return CONTI
    .map(([id, nome, nota]) => {
      const voci = righe.filter((r) => r.categoria === id)
      return { id, nome, nota, voci, tot: voci.reduce((n, v) => n + v.crediti, 0) }
    })
    .filter((g) => g.voci.length)
}

const verso = (n) => (n > 0 ? 'su' : n < 0 ? 'giu' : 'zero')

/** Una media a due decimali, o un trattino: 0,00 non e' una media. */
const due2 = (v) => (v == null || v === '' ? <i className="zero">—</i> : Number(v).toFixed(2))

/**
 * Un conteggio della stagione.
 *
 * Lo zero si vede, ma spento: «zero gol» e' un dato. Il trattino e' un'altra
 * cosa e vuol dire che **non c'e' nessun dato**: quel giocatore in quella
 * stagione non e' mai sceso in campo con questa maglia, e allora anche i gol
 * non sono zero — non esistono. Confonderli e' come dire che uno ha fallito
 * un esame che non ha dato.
 */
const conta = (riga, n) => {
  if (!riga) return <i className="zero">—</i>
  return n ? n : <i className="zero">0</i>
}

/**
 * L'indice del listone, e perche' non e' una Map sul nome.
 *
 * Rosa e listone si agganciano **per nome**, perche' il listone non ha l'id
 * del calciatore. Il nome pero' ogni tanto non basta: nel 2022-23 ci sono due
 * Cabral, un attaccante quotato 12 e un centrocampista quotato 0. Una Map sul
 * solo cognome ne tiene uno a caso — l'ultimo letto — e allo Smit, che aveva
 * l'attaccante, mostrerebbe zero.
 *
 * Percio' due chiavi. Prima si prova nome+ruolo, che e' esatta. Se il nome nel
 * listone e' uno solo si accetta anche senza il ruolo, perche' i ruoli fra le
 * due fonti ogni tanto non concordano (Sucic e' scritto D e gioca C) e
 * pretenderli uguali farebbe perdere righe giuste per essere precisi su una
 * cosa che non e' in discussione.
 *
 * In dieci stagioni i nomi ambigui che compaiono davvero in una rosa sono due.
 * Due righe sbagliate su tremila non si notano mai — ed e' il motivo per cui
 * vanno tolte adesso invece che quando qualcuno ci inciampa.
 */
function indice(righe) {
  const esatto = new Map()      // nome + ruolo
  const perClub = new Map()     // nome + squadra di Serie A
  const solNome = new Map()
  const ambigui = new Set()
  const ambiguiClub = new Set()
  for (const r of righe ?? []) {
    const n = (r.nome ?? '').trim().toLowerCase()
    if (!n) continue
    esatto.set(`${n}\u00b7${r.ruolo}`, r.prezzo)
    const c = (r.club ?? '').trim().toUpperCase()
    if (c) {
      if (perClub.has(`${n}\u00b7${c}`)) ambiguiClub.add(`${n}\u00b7${c}`)
      else perClub.set(`${n}\u00b7${c}`, r.prezzo)
    }
    if (solNome.has(n)) ambigui.add(n)
    else solNome.set(n, r.prezzo)
  }
  return {
    quante: esatto.size,
    ambigui,
    /**
     * `club` e' la **squadra vera di Serie A**, e serve solo a sciogliere i
     * pareggi. Fofana del Milan e Fofana dell'Udinese hanno lo stesso cognome
     * e lo stesso ruolo: il nome non li distingue, il ruolo nemmeno, la maglia
     * si'. Si usa dopo il ruolo e mai al posto suo, perche' il club sul listone
     * delle stagioni vecchie e' quello di oggi e non quello di allora — come
     * indizio in caso di dubbio vale, come chiave no.
     */
    cerca(nome, ruolo, club) {
      const n = (nome ?? '').trim().toLowerCase()
      const e = esatto.get(`${n}\u00b7${ruolo}`)
      if (e != null) return e
      const c = (club ?? '').trim().toUpperCase()
      if (c && !ambiguiClub.has(`${n}\u00b7${c}`)) {
        const k = perClub.get(`${n}\u00b7${c}`)
        if (k != null) return k
      }
      if (ambigui.has(n)) return null   // due omonimi, e ne' ruolo ne' maglia aiutano
      return solNome.get(n) ?? null
    },
  }
}

/**
 * La pastiglia della colonna «Mercato».
 *
 * Quattro cose diverse, in ordine di importanza per chi legge:
 *
 *   uscito     — c'era a settembre e a maggio non c'e' piu'
 *   gennaio    — non c'era a settembre ed e' arrivato dopo
 *   contratto  — ce l'avevi gia': all'asta non e' passato
 *   asta       — l'hai chiamato all'asta, e pagato
 *
 * Il mercato di gennaio viene prima perche' e' la domanda che uno si fa
 * scorrendo: «questo e' ancora in rosa?». Chi e' uscito era magari sotto
 * contratto, ma la notizia e' che non c'e' piu'.
 */
function pastigliaMercato(p, dueRose) {
  if (dueRose && p.sett && !p.maggio) return <span className="mv-out">uscito</span>
  if (dueRose && !p.sett && p.maggio) return <span className="mv-in">gennaio</span>
  if (p.contratto) {
    return <span className="mv-contratto" title={`Sotto contratto fino al ${p.contratto}`}>contratto</span>
  }
  /* «Asta» si puo' dire solo dove esiste la rosa d'asta. Nelle stagioni che
     hanno la sola rosa di maggio non si sa chi c'era a settembre e chi e'
     arrivato a gennaio: dirlo di tutti sarebbe una cosa che la pagina non sa,
     scritta come se la sapesse. */
  if (!dueRose) return <i className="zero">—</i>
  return <span className="mv-asta">asta</span>
}


/** «2020-21, 2024-25 e 2025-26» — con la e, non con l'ultima virgola. */
const elenco = (v) => (v.length < 2 ? v.join('') : `${v.slice(0, -1).join(', ')} e ${v.at(-1)}`)

export function Crediti() {
  const d = useSocieta()
  const f = d.finanze

  /*
   * Due registri, non uno.
   *
   * Il registro della Presidenza tiene premi e penalita', e paga con un anno
   * di ritardo: quello che guadagni nel 2024-25 lo trovi nel budget del
   * 2025-26. Il mercato e' un'altra cosa e si chiude dentro la sua stagione -
   * chi svincola incassa subito la meta' del prezzo d'asta, chi compra paga
   * subito. Sommarli darebbe un numero che non risponde a nessuna domanda, e
   * soprattutto sballerebbe il controllo qui sotto, quello che confronta il
   * registro con la voce «premi e penalita'» del bilancio.
   */
  const perStagione = useMemo(() => {
    const m = new Map()
    for (const r of d.movimenti) {
      if (r.categoria === 'mercato') continue
      if (!m.has(r.stagione)) m.set(r.stagione, [])
      m.get(r.stagione).push(r)
    }
    return m
  }, [d.movimenti])

  /* Il mercato, stagione per stagione: chi e' uscito rendendo meta' prezzo e
     chi e' entrato costandone uno intero. */
  const mercato = useMemo(() => {
    const m = new Map()
    for (const r of d.movimenti) {
      if (r.categoria !== 'mercato') continue
      if (!m.has(r.stagione)) m.set(r.stagione, [])
      m.get(r.stagione).push(r)
    }
    return m
  }, [d.movimenti])

  const anniMercato = useMemo(
    () => [...mercato.keys()].sort().reverse(), [mercato]
  )

  const stagioni = useMemo(
    () => [...perStagione.keys()].sort().reverse(), [perStagione]
  )

  /*
   * Il registro paga con un anno di ritardo.
   *
   * I premi guadagnati in una stagione non entrano nel budget di quella
   * stagione: entrano in quello dell'anno dopo. Quindi il «bonus» che il
   * mister vede nel 2025-26 e' la somma dei movimenti del 2024-25 — ed e'
   * vero su tutte e dieci le societa', verificato riga per riga.
   *
   * E' anche il motivo per cui questa pagina mostra due blocchi e non uno:
   * quello che hai gia' in cassa, e quello che stai maturando adesso.
   */
  const sBudget = f ? d.stagioneFinanze : null
  const sIncassata = sBudget ? stagioni.find((s) => s < sBudget) ?? null : null
  const sMaturata = sBudget && perStagione.has(sBudget) ? sBudget : null

  const inCassa = sIncassata ? perStagione.get(sIncassata) : []
  const totCassa = inCassa.reduce((n, r) => n + r.crediti, 0)
  const atteso = f ? (f.bonus ?? 0) + (f.ffp ?? 0) : null
  const quadra = atteso === null || totCassa === atteso

  if (!f) {
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

  /*
   * Quello che la sottrazione da', e di quanto si discosta dal registro.
   *
   * Va **dopo** la guardia `if (!f)`, non prima. Al primo render `d.finanze`
   * e' null - i bilanci arrivano da una chiamata asincrona e non sono ancora
   * tornati - e leggere `f.spent` li' dentro fa morire il componente in render,
   * cioe' pagina nera senza un messaggio. La riga sopra la guardia sembrava un
   * posto ragionevole perche' li' stanno gli altri conti; non lo era.
   */
  const restaCalcolato = f.spent == null
    ? null : f.initial - f.spent + (f.trades ?? 0)
  const scartoResidui = (f.left == null || restaCalcolato == null)
    ? null : f.left - restaCalcolato

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
          {f.base ?? 250} crediti di base, più metà dei risparmi dell'anno prima, più
          premi e penalità. Il saldo scambi è quanto hai incassato o speso fuori asta.
        </p>
        {/*
          * I «residui» non sono il risultato di questa sottrazione, e per un
          * pezzo la pagina ha fatto finta di sì.
          *
          * Fino a ieri `residui` era iniziali - spesi + scambi, calcolato.
          * Contro la colonna «Crediti non spesi» del foglio della Presidenza
          * sbagliava NOVE societa' su dieci nel 2025-26, e il numero buono e'
          * il suo: da li' esce il carry-over dell'anno dopo, ceil(meta'),
          * dieci volte su dieci. Adesso `residui` e' quel numero, letto.
          *
          * Ma allora la colonna non torna piu', e presentarla come un totale
          * sarebbe scrivere una sottrazione sbagliata in pagina. Quindi si
          * spezza in due: quello che la sottrazione da', e quello che il
          * registro dice. Quando non coincidono si dice di quanto, e si dice
          * che il pezzo mancante non lo sappiamo ancora ricostruire.
          */}
        <div className="flusso">
          <Riga label="Crediti iniziali" v={f.initial} />
          <Riga label="Spesi all'asta" v={f.spent != null ? -f.spent : null} />
          {f.trades ? <Riga label="Saldo scambi" v={f.trades} /> : null}
          <Riga label="Quello che resterebbe" v={restaCalcolato} totale />
        </div>
        <div className="flusso">
          <Riga label="Residui a registro" v={f.left} totale />
        </div>
        {scartoResidui != null && scartoResidui !== 0 && (
          <p className="pannello-sub">
            La sottrazione qui sopra si ferma a settembre. Fra settembre e maggio
            passano gli acquisti a mercato aperto e i rimborsi da svincolo, e il
            registro della Presidenza li conta tutti: per questo dice{' '}
            <b>{f.left}</b> e non {restaCalcolato}. I{' '}
            <b>{Math.abs(scartoResidui)} crediti</b> di differenza sono quel pezzo,
            e l'archivio non sa ancora rimetterlo in fila riga per riga. È scritto
            qui invece che nascosto in un totale che non torna.
          </p>
        )}
      </section>

      <section className="pannello card">
        <h2>Voci accessorie</h2>
        <div className="flusso">
          <Riga label="Crediti riportati" v={f.carried} />
          <Riga label="Premi e penalità" v={f.bonus} />
          {f.giovani ? <Riga label="Budget giovani" v={f.giovani} /> : null}
          <Riga label="Bonus Fair Play Finanziario" v={f.ffp} />
          {f.assicurazione ? <Riga label="Assicurazione" v={f.assicurazione} /> : null}
        </div>
        <Link to="/rose" className="more-link">Bilancio di tutte le società →</Link>
      </section>

      {sIncassata ? (
        <section className="pannello card">
          <h2>
            <span>
              Perché hai <b className="conto-cifra">{segno(atteso)}</b> crediti di premio
            </span>
          </h2>
          <p className="pannello-sub">
            I premi si incassano l'anno dopo: quelli che trovi nel budget {sBudget} li
            hai guadagnati nel {sIncassata}. Ecco da dove viene ognuno.
          </p>
          <Estratto
            gruppi={raccogli(inCassa)}
            totale={totCassa}
            etichetta={`Nel budget ${sBudget}`}
          />
          {quadra ? (
            <p className="conto-quadra">
              ✓ La somma fa esattamente i {segno(atteso)} crediti di «premi e penalità»
              del bilancio. I due numeri vengono da due posti diversi e combaciano.
            </p>
          ) : (
            <p className="conto-scarta">
              Il bilancio dice {segno(atteso)}, il registro {segno(totCassa)}: mancano{' '}
              {Math.abs(atteso - totCassa)} crediti. È il registro a essere il verbale —
              lo scarto è segnalato alla Presidenza.
            </p>
          )}
        </section>
      ) : null}

      {sMaturata ? (
        <section className="pannello card">
          <h2>Quello che stai maturando</h2>
          <p className="pannello-sub">
            Premi e penalità del {sMaturata}. Non sono in questo budget: entreranno
            in quello della prossima asta.
          </p>
          <Estratto
            gruppi={raccogli(perStagione.get(sMaturata))}
            totale={perStagione.get(sMaturata).reduce((n, r) => n + r.crediti, 0)}
            etichetta="Andrà nel prossimo budget"
          />
        </section>
      ) : null}

      {anniMercato.length > 0 ? (
        <section className="pannello card">
          <h2>Il mercato</h2>
          <p className="pannello-sub">
            Questo non passa dal registro dei premi e non aspetta l'anno dopo: si
            chiude dentro la stagione. Chi viene <b>svincolato rende il 50%</b> del
            prezzo pagato all'asta d'estate — chi era arrivato per scambio rende
            invece <b>un credito solo</b>. Chi arriva, si paga.
          </p>
          <div className="table-wrap">
            <table className="storico-conto">
              <thead>
                <tr>
                  <th className="left">Stagione</th>
                  <th>Rientrati</th>
                  <th>Spesi</th>
                  <th>Saldo</th>
                  <th className="left">Chi</th>
                </tr>
              </thead>
              <tbody>
                {anniMercato.map((a) => {
                  const righe = mercato.get(a)
                  const su = righe.filter((r) => r.crediti > 0)
                    .reduce((n, r) => n + r.crediti, 0)
                  const giu = righe.filter((r) => r.crediti < 0)
                    .reduce((n, r) => n + r.crediti, 0)
                  return (
                    <tr key={a}>
                      <td className="left num">{a}</td>
                      <td className="num"><Cr n={su} /></td>
                      <td className="num"><Cr n={giu} /></td>
                      <td className="num strong"><Cr n={su + giu} /></td>
                      <td className="left conto-chi">
                        {righe.map((r) => r.voce).join(', ')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="conto-fonte">
            Fonte: i fogli delle rose, {anniMercato.length} stagioni. Il segno segue il
            regolamento: «i Calciatori svincolati rendono il 50% del prezzo di acquisto
            estivo».
          </p>
        </section>
      ) : null}

      {stagioni.length > 1 ? (
        <section className="pannello card">
          <h2>Stagione per stagione</h2>
          <p className="pannello-sub">
            Quanto hai guadagnato e quanto hai perso, da quando la Presidenza tiene
            il registro.
          </p>
          <div className="table-wrap">
            <table className="storico-conto">
              <thead>
                <tr>
                  <th className="left">Stagione</th>
                  <th>Guadagnati</th>
                  <th>Persi</th>
                  <th>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {stagioni.map((s) => {
                  const righe = perStagione.get(s)
                  const su = righe.filter((r) => r.crediti > 0)
                    .reduce((n, r) => n + r.crediti, 0)
                  const giu = righe.filter((r) => r.crediti < 0)
                    .reduce((n, r) => n + r.crediti, 0)
                  return (
                    <tr key={s} className={s === sIncassata ? 'in-cassa' : undefined}>
                      <td className="left num">{s}</td>
                      <td className="num"><Cr n={su} /></td>
                      <td className="num"><Cr n={giu} /></td>
                      <td className="num strong"><Cr n={su + giu} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="conto-fonte">
            Fonte: il registro della Presidenza, {stagioni.length} stagioni. Non è
            calcolato dal regolamento — è quello che è stato davvero assegnato.
          </p>
        </section>
      ) : null}

    </>
  )
}

/**
 * L'estratto conto di una stagione.
 *
 * Ogni conto e' un blocco con il suo totale in testa e le sue voci sotto: la
 * domanda «perche' ho tredici crediti» si risponde a due profondita', prima
 * «cinque dai giochi» e poi «quattro di MrChampions, uno di Grigliata».
 */
function Estratto({ gruppi, totale, etichetta }) {
  if (!gruppi.length) return <p className="vuoto">Nessun movimento in questa stagione.</p>
  return (
    <div className="conto">
      {gruppi.map((g) => (
        <div className="conto-gruppo" key={g.id}>
          <div className="conto-testa">
            <span className="conto-nome">{g.nome}</span>
            <b className={`num cr ${verso(g.tot)}`}>{segno(g.tot)}</b>
          </div>
          <p className="conto-nota">{g.nota}</p>
          <div className="conto-voci">
            {g.voci.map((v, i) => (
              <div className="conto-voce" key={`${v.voce}·${i}`}>
                <span>{nomeVoce(v.voce)}</span>
                <b className={`num cr ${verso(v.crediti)}`}>{segno(v.crediti)}</b>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="conto-totale">
        <span>{etichetta}</span>
        <b className="num">{segno(totale)}</b>
      </div>
    </div>
  )
}

/* Un credito: verde se guadagnato, rosso se perso, spento se zero. */
function Cr({ n }) {
  const v = Number(n)
  if (!v) return <span className="muted">—</span>
  return <span className={`cr ${verso(v)}`}>{segno(v)}</span>
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
  let spent = 0; let apps = 0; let fmSum = 0; let fmCount = 0; let conCosto = 0
  let stimati = 0
  for (const p of rosa) {
    byRole[p.role] = (byRole[p.role] ?? 0) + 1
    if (p.cost != null) { spent += p.cost; conCosto += 1; if (p.stimato) stimati += 1 }
    apps += p.apps ?? 0
    if (p.fm != null) { fmSum += p.fm; fmCount += 1 }
  }
  return { byRole, spent, apps, size: rosa.length, conCosto, stimati,
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
