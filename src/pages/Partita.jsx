import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { getTeam, logoUrl, teamName } from '../lib/core'
import {
  useArchivio, partita, turni, formazioniPartita, bonusTipi, competizioni,
} from '../lib/archivio'
import { tabellinoLato, perReparto, MAX_SOSTITUZIONI } from '../lib/tabellino'
import { Pagina, Sezione, Numero } from '../components/moto'
import './Partita.css'

const RUOLO = { P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' }

/**
 * Il tabellino di una partita.
 *
 * Le due formazioni una accanto all'altra, il fantavoto di ogni giocatore, i
 * modificatori e il totale. Le sostituzioni non sono lette dall'archivio —
 * l'archivio non le ha — ma applicate con la regola della lega: vedi
 * `src/lib/tabellino.js`.
 */
export default function Partita() {
  const { id } = useParams()
  const pa = useArchivio(['partita', id], () => partita(id), [id])
  const fo = useArchivio(['formazioniPartita', id], () => formazioniPartita(Number(id)), [id])
  const bo = useArchivio('bonusTipi', bonusTipi)
  const tu = useArchivio('turni', turni)
  const co = useArchivio('competizioni', competizioni)

  const g = pa.dati
  const valori = useMemo(
    () => new Map((bo.dati ?? []).map((b) => [b.id, Number(b.valore ?? 0)])),
    [bo.dati]
  )
  /* Il nome leggibile del bonus, per il `title`: «Rigore sbagliato», non
     «rigore-sbagliato». */
  const nomiBonus = useMemo(
    () => new Map((bo.dati ?? []).map((b) => [b.id, b.nome])),
    [bo.dati]
  )

  const lati = useMemo(() => {
    if (!g || !fo.dati?.length) return null
    const trova = (societa, fp) => {
      const l = fo.dati.find((x) => x.societa === societa)
      return l ? tabellinoLato(l, valori, g.stagione, fp) : null
    }
    return { casa: trova(g.casa, g.fp_casa), fuori: trova(g.fuori, g.fp_fuori) }
  }, [g, fo.dati, valori])

  const dove = useMemo(() => {
    if (!g) return ''
    if (g.competizione === 'campionato') return `${g.giornata}ª giornata`
    const nome = (co.dati ?? []).find((c) => c.id === g.competizione)?.nome ?? g.competizione
    const turno = (tu.dati ?? []).find((t) => t.id === g.turno)?.nome
    return turno ? `${nome} · ${turno}` : nome
  }, [g, co.dati, tu.dati])

  /* Basta che una delle due non torni per doverlo dire. */
  const nonQuadra = lati && [lati.casa, lati.fuori].filter((l) => l && l.quadra === false)

  /*
   * La legenda dei simboli, e solo di quelli che in questa partita ci sono.
   *
   * Prima il nome del bonus stava nel `title`: su un telefono il `title` non
   * esiste, e una stella accanto a un nome non spiega niente da sola. Undici
   * voci fisse sarebbero rumore; qui compaiono le tre o quattro che servono
   * a leggere questa partita, col loro valore in fantapunti.
   */
  const legenda = useMemo(() => {
    if (!lati) return []
    const visti = new Set()
    for (const l of [lati.casa, lati.fuori]) {
      if (!l) continue
      for (const g of l.campo) for (const b of g.bonus ?? []) visti.add(b.id)
    }
    return [...visti]
      .map((id) => ({ id, nome: nomiBonus.get(id) ?? id, valore: valori.get(id) ?? 0 }))
      .sort((a, b) => b.valore - a.valore || a.nome.localeCompare(b.nome))
  }, [lati, nomiBonus, valori])

  return (
    <Pagina className="page container wide pt">
      <p className="pt-torna"><Link to="/risultati">← Calendario</Link></p>

      <Sezione stato={pa} righe={6} vuoto="Questa partita non esiste in archivio.">
        {g && (
          <>
            <header className="pt-testa">
              <p className="eyebrow">{g.stagione} · {dove}</p>
              <div className="pt-punteggio">
                <Lato id={g.casa} />
                <div className="pt-numeri">
                  {g.giocata && g.gol_casa != null ? (
                    <>
                      <strong>{g.gol_casa}<i>–</i>{g.gol_fuori}</strong>
                      <span>{Number(g.fp_casa).toFixed(1)} · {Number(g.fp_fuori).toFixed(1)}</span>
                      <em>fantapunti</em>
                    </>
                  ) : <strong className="pt-vs">vs</strong>}
                </div>
                <Lato id={g.fuori} ospite />
              </div>
            </header>

            <Sezione stato={fo} righe={10}
                     vuoto="Di questa partita l'archivio non ha le formazioni.">
              {lati && (
                <>
                  {nonQuadra?.length > 0 && (
                    <div className="avviso card pt-scarto">
                      <strong>Il conto non torna.</strong>{' '}
                      {nonQuadra.map((l) => (
                        <span key={l.societa}>
                          Per {teamName(l.societa)} i voti in campo più i
                          modificatori fanno <b>{l.totale.toFixed(1)}</b>, ma in
                          archivio la partita è registrata a{' '}
                          <b>{l.registrati.toFixed(1)}</b>.{' '}
                        </span>
                      ))}
                      Il risultato buono è quello in archivio: è lì che sta il
                      punteggio con cui la partita è stata giocata. Succede su 62
                      formazioni delle 4.890 di dieci stagioni, quasi tutte nei
                      primi anni. Il tabellino qui sotto resta utile per vedere
                      chi ha fatto cosa, ma su questa partita non fidarti della
                      somma.
                    </div>
                  )}

                  <div className="pt-lati">
                    <Formazione l={lati.casa} nomi={nomiBonus} />
                    <Formazione l={lati.fuori} nomi={nomiBonus} />
                  </div>

                  {legenda.length > 0 && (
                    <div className="pt-legenda">
                      <h3>Come si leggono i simboli</h3>
                      <ul>
                        {legenda.map((b) => (
                          <li key={b.id}>
                            <i className={`b-${b.id}`}>{SIMBOLO[b.id] ?? '•'}</i>
                            <span>{b.nome}</span>
                            <b>{b.valore > 0 ? '+' : ''}{formattaValore(b.valore)}</b>
                          </li>
                        ))}
                      </ul>
                      {legenda.some((b) => b.id === 'gol-vittoria') && (
                        <p>
                          La <b>★</b> è il gol vittoria: la rete che manda avanti la
                          squadra di serie A per non essere più raggiunta. La regola
                          è quella di Fantapazz, non è scritta nel nostro
                          regolamento — che ne fissa solo il valore. Quello che
                          l'archivio conferma è come si comporta: in tutte e
                          2.577 le volte in cui compare sta addosso a chi ha
                          segnato, mai da sola, e mai più di una per giocatore.
                          Chi segna dopo di lui non la prende.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="pt-nota">
                    L'archivio non registra chi è entrato: registra chi era in
                    formazione e che voto ha preso. Le sostituzioni qui sopra
                    sono applicate con la regola della lega — al posto di un
                    titolare senza voto entra il primo di panchina dello stesso
                    ruolo che il voto ce l'ha, seguendo l'ordine della panchina,
                    fino a {MAX_SOSTITUZIONI}. Ricalcolando così tutte le
                    formazioni di dieci stagioni il totale coincide con quello
                    registrato nel 98,7% dei casi, e nelle ultime tre stagioni
                    sempre.
                  </p>
                </>
              )}
            </Sezione>
          </>
        )}
      </Sezione>
    </Pagina>
  )
}

function Lato({ id, ospite }) {
  const t = getTeam(id)
  if (!t) return <span className="muted">—</span>
  return (
    <Link to={`/squadre/${id}`} className={`pt-lato ${ospite ? 'ospite' : ''}`}>
      <img src={logoUrl(t)} alt="" />
      <span>{t.name}</span>
    </Link>
  )
}

function Formazione({ l, nomi }) {
  if (!l) return <div className="pt-form card"><p className="muted">Formazione non in archivio.</p></div>

  return (
    <div className="pt-form card">
      <header className="pt-form-testa">
        <TeamBadge id={l.societa} size="md" />
        <span className="pt-modulo">{l.modulo}</span>
      </header>
      {l.mister && <p className="pt-mister">Mister {l.mister}</p>}

      <div className="pt-campo">
        {perReparto(l.campo).map(([ruolo, gruppo]) => (
          <section key={ruolo} className="pt-reparto">
            <h3>{RUOLO[ruolo] ?? ruolo}</h3>
            {gruppo.map((g, i) => <Giocatore key={`${g.id}-${i}`} g={g} nomi={nomi} />)}
          </section>
        ))}
      </div>

      <div className="pt-conti">
        <div className="pt-riga">
          <span>Voti in campo</span>
          <b>{l.sommaCampo.toFixed(1)}</b>
        </div>
        {l.modificatori.map((m) => (
          <div key={m.nome} className="pt-riga modificatore">
            <span>{m.nome}</span>
            <b>{m.valore > 0 ? '+' : ''}{m.valore.toFixed(1)}</b>
          </div>
        ))}

        {/* Perché il modificatore difesa c'è, o perché non c'è. La media si
            calcola sul voto base di portiere e tre migliori difensori: un
            difensore che segna alza il suo fantavoto, non la tenuta della
            difesa. Il valore sommato resta quello dell'archivio — questa
            riga spiega, non conta. */}
        <NotaDifesa d={l.difesa} />
        <div className={`pt-riga totale ${l.quadra === false ? 'storto' : ''}`}>
          <span>Totale</span>
          <b><Numero valore={l.registrati ?? l.totale} decimali={1} /></b>
        </div>
      </div>

      <details className="pt-panchina">
        <summary>
          Panchina
          <em>
            {l.cambi.length} {l.cambi.length === 1 ? 'sostituzione' : 'sostituzioni'}
            {' · '}
            {l.panchina.filter((p) => p.disponibile && !p.entrato).length} non entrati
          </em>
        </summary>
        <ul>
          {l.panchina.map((p, i) => (
            <li key={`${p.id}-${i}`} className={p.entrato ? 'dentro' : ''}>
              <span className={`badge role-${p.ruolo}`}>{p.ruolo}</span>
              <span className="pt-nome">{p.nome}</span>
              {p.entrato ? (
                <em className="pt-esito dentro">entrato</em>
              ) : p.disponibile ? (
                <em className="pt-esito">disponibile</em>
              ) : (
                <em className="pt-esito niente">senza voto</em>
              )}
              <b className="pt-fv">{p.fv == null ? '—' : p.fv.toFixed(1)}</b>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

function NotaDifesa({ d }) {
  if (!d || !d.attendibile) return null

  if (d.pochi) {
    return (
      <p className="pt-difesa">
        {d.difensori} {d.difensori === 1 ? 'difensore' : 'difensori'} in campo:
        sotto i {d.minimo} il modificatore difesa non spetta.
      </p>
    )
  }

  const media = d.media.toLocaleString('it-IT',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  if (d.valore > 0) {
    return (
      <p className="pt-difesa">
        Difesa a <b>{media}</b> di media — portiere e tre migliori difensori, sul
        voto base.
        {d.prossima && (
          <> Per <b>+{d.prossima.valore.toLocaleString('it-IT')}</b> servivano{' '}
            {d.prossima.soglia.toLocaleString('it-IT',
              { minimumFractionDigits: 2 })}.</>
        )}
      </p>
    )
  }

  return (
    <p className="pt-difesa">
      Difesa a <b>{media}</b> di media: niente modificatore.
      {d.prossima && (
        <> Ne mancavano <b>{d.mancano.toLocaleString('it-IT',
          { minimumFractionDigits: 2 })}</b> per prendere{' '}
          +{d.prossima.valore.toLocaleString('it-IT')}.</>
      )}
    </p>
  )
}

function Giocatore({ g, nomi }) {
  const bonus = raggruppa(g.bonus ?? [])
  return (
    <div className={`pt-g ${g.come}`}>
      {g.calciatore != null
        ? <Link to={`/giocatori/${g.calciatore}`} className="pt-nome">{g.nome}</Link>
        : <span className="pt-nome">{g.nome}</span>}

      {g.fascia && <em className="pt-fascia">{g.fascia}</em>}

      {g.come === 'entrato' && (
        <em className="pt-entrato" title={`entrato al posto di ${g.alPostoDi.nome}`}>
          ↑ per {g.alPostoDi.nome}
        </em>
      )}

      {g.come === 'assente' ? (
        <em className="pt-nessuno">nessun sostituto</em>
      ) : (
        <>
          <span className="pt-bonus">
            {bonus.map((b) => (
              <i key={b.id} className={`b-${b.id}`}
                 title={b.n > 1 ? `${nomi?.get(b.id) ?? b.id} ×${b.n}` : (nomi?.get(b.id) ?? b.id)}>
                {SIMBOLO[b.id] ?? '•'}{b.n > 1 && b.n}
              </i>
            ))}
          </span>
          <span className="pt-voto">{Number(g.voto).toFixed(1)}</span>
          <b className={`pt-fv ${g.fv >= 7 ? 'alto' : g.fv < 5.5 ? 'basso' : ''}`}>
            {g.fv.toFixed(1)}
          </b>
        </>
      )}
    </div>
  )
}

/*
 * Un simbolo per bonus: in una riga di undici non c'e' spazio per la parola.
 *
 * Ogni simbolo e' diverso da tutti gli altri anche in bianco e nero.
 * Ammonizione ed espulsione erano la stessa sbarretta con due colori
 * diversi: chi non distingue il giallo dal rosso — e chi guarda in fretta —
 * vedeva la stessa cosa due volte.
 *
 * Il rigore ha un segno suo e non quello del gol: sono due voci separate in
 * archivio, valgono tre punti l'una, e si sommano.
 */
const SIMBOLO = {
  gol: '⚽',
  rigore: '◎',
  'rigore-sbagliato': '◌',
  'rigore-parato': '✋',
  'gol-vittoria': '★',
  assist: '➜',
  imbattuto: '🛡',
  giallo: '▮',
  rosso: '✕',
  'gol-subito': '−',
  autogol: '⊗',
}

/** Mezzo punto si scrive «0,5», non «0.5»: e' un numero italiano. */
function formattaValore(v) {
  return v.toLocaleString('it-IT', { maximumFractionDigits: 1 })
}

function raggruppa(bonus) {
  const m = new Map()
  for (const b of bonus) m.set(b.id, { id: b.id, n: (m.get(b.id)?.n ?? 0) + 1 })
  return [...m.values()]
}
