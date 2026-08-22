import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { teamName } from '../lib/core'
import { useArchivio, carriera, contrattiPubblici } from '../lib/archivio'
import { Pagina, Sezione, Numero, CorpoTabella, Riga } from '../components/moto'
import './SchedaGiocatore.css'

const RUOLO = { P: 'Portiere', D: 'Difensore', C: 'Centrocampista', A: 'Attaccante' }

/**
 * Le colonne della carriera, e quando hanno senso.
 *
 * `mostra` decide se la colonna compare: una riga di zeri sotto "porte
 * inviolate" per un attaccante non e' un dato, e' rumore. Si mostra la
 * colonna se in tutta la carriera c'e' almeno un valore diverso da zero,
 * oppure se e' una colonna che serve sempre.
 */
const COLONNE = [
  { k: 'gol', titolo: 'Gol', sempre: (r) => r === 'A' || r === 'C' },
  { k: 'assist', titolo: 'Assist', sempre: (r) => r === 'A' || r === 'C' },
  { k: 'rigori', titolo: 'di cui rig.', tenue: true },
  { k: 'rigori_sbagliati', titolo: 'Rig. sbagliati', tenue: true },
  { k: 'rigori_parati', titolo: 'Rig. parati', tenue: true },
  { k: 'imbattuto', titolo: 'Porta inviolata', sempre: (r) => r === 'P' },
  { k: 'gol_subiti', titolo: 'Gol subiti', sempre: (r) => r === 'P', tenue: true },
  { k: 'gol_vittoria', titolo: 'Gol vittoria', tenue: true },
  { k: 'gialli', titolo: 'Gialli', tenue: true },
  { k: 'rossi', titolo: 'Rossi', tenue: true },
  { k: 'autogol', titolo: 'Autogol', tenue: true },
]

export default function SchedaGiocatore() {
  const { id } = useParams()
  const stato = useArchivio(['carriera', id], () => carriera(id), [id])
  const contr = useArchivio('contrattiPubblici', contrattiPubblici)

  const righe = stato.dati ?? []
  const chi = righe[0]

  const tot = useMemo(() => somma(righe), [righe])

  /* Le colonne che questo calciatore giustifica. */
  const colonne = useMemo(() => {
    const r = chi?.ruolo
    return COLONNE.filter((c) => c.sempre?.(r) || righe.some((x) => (x[c.k] ?? 0) !== 0))
  }, [righe, chi])

  /* I contratti storici, agganciati per nome: la tabella non ha l'id del
     calciatore, solo il nome scritto a mano. Venti su centoquaranta non
     combaciano con nessuno, ed e' scritto sotto l'elenco. */
  const contratti = useMemo(() => {
    if (!chi || !contr.dati) return []
    const n = chi.nome.toLowerCase()
    return contr.dati
      .filter((c) => c.nome?.toLowerCase() === n)
      .sort((a, b) => a.dalla.localeCompare(b.dalla))
  }, [chi, contr.dati])

  const maxGol = Math.max(1, ...righe.map((r) => r.gol ?? 0))
  const societa = [...new Set(righe.map((r) => r.societa))]

  /*
   * Le stagioni sono le stagioni distinte, non le righe.
   *
   * Handanovic nel 2020-21 ha cinque presenze col Roburro e quaranta col
   * Prosecco: due righe, un anno solo. Contando le righe la scheda diceva
   * «8 stagioni» a chi ne ha giocate sette. E' anche la prova che i
   * trasferimenti di meta' stagione l'archivio li ha: li perdono le rose,
   * che sono una fotografia di giugno, non le formazioni.
   */
  const stagioni = useMemo(() => new Set(righe.map((r) => r.stagione)), [righe])
  const traslochi = useMemo(() => {
    const quante = new Map()
    for (const r of righe) quante.set(r.stagione, (quante.get(r.stagione) ?? 0) + 1)
    return quante
  }, [righe])

  return (
    <Pagina className="page container wide sg">
      <p className="sg-torna"><Link to="/giocatori">← Tutti i giocatori</Link></p>

      <Sezione stato={stato} righe={8}
               vuoto="Di questo calciatore non risulta nessuna presenza in Caprera.">
        {chi && (
          <>
            <header className="sg-testa">
              <div className="sg-chi">
                <span className={`badge role-${chi.ruolo}`}>{chi.ruolo}</span>
                <h1>{chi.nome}</h1>
                <p className="sg-sotto">
                  {RUOLO[chi.ruolo] ?? 'Ruolo non registrato'}
                  {ultimoClub(righe) && <> · {ultimoClub(righe)}</>}
                </p>
                <p className="sg-arco">
                  In Caprera dal {righe[0].stagione} al {righe[righe.length - 1].stagione} ·{' '}
                  {stagioni.size} {stagioni.size === 1 ? 'stagione' : 'stagioni'} ·{' '}
                  {societa.length} {societa.length === 1 ? 'società' : 'società'}
                </p>
                <div className="sg-maglie">
                  {societa.map((s) => (
                    <Link key={s} to={`/squadre/${s}`} className="sg-maglia" title={teamName(s)}>
                      <TeamBadge id={s} size="sm" label="code" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="sg-totali">
                <Totale n={tot.con_voto} etichetta="Presenze" nota={`${tot.convocato} convocazioni`} />
                {(chi.ruolo === 'A' || chi.ruolo === 'C' || tot.gol > 0) && (
                  <Totale n={tot.gol} etichetta="Gol"
                          nota={tot.rigori ? `${tot.rigori} su rigore` : null} oro />
                )}
                {(chi.ruolo !== 'P' || tot.assist > 0) && (
                  <Totale n={tot.assist} etichetta="Assist" />
                )}
                {chi.ruolo === 'P' && (
                  <Totale n={tot.imbattuto} etichetta="Porte inviolate" oro />
                )}
                <Totale n={tot.mv} decimali={2} etichetta="Media voto"
                        nota="pesata sulle presenze" />
              </div>
            </header>

            <section className="block">
              <h2 className="section-title">Stagione per stagione</h2>
              <div className="table-wrap">
                <table className="sg-tabella">
                  <thead>
                    <tr>
                      <th className="left">Stagione</th>
                      <th className="left">Società</th>
                      <th>Costo</th>
                      <th>Pres.</th>
                      <th>Tit.</th>
                      <th>MV</th>
                      {colonne.map((c) => (
                        <th key={c.k} className={c.tenue ? 'tenue' : undefined}>{c.titolo}</th>
                      ))}
                    </tr>
                  </thead>
                  <CorpoTabella>
                    {righe.map((r) => (
                      <Riga key={`${r.stagione}-${r.societa}`}>
                        <td className="left num sg-anno">
                          {r.stagione}
                          {traslochi.get(r.stagione) > 1 && (
                            <em className="sg-mezza" title="cambiata società a stagione in corso">
                              ½
                            </em>
                          )}
                        </td>
                        <td className="left"><TeamBadge id={r.societa} size="sm" /></td>
                        <td className="num muted">{r.costo ?? '—'}</td>
                        <td className="num">
                          {r.con_voto}
                          {r.convocato > r.con_voto && (
                            <em className="sg-panca"
                                title={`${r.convocato - r.con_voto} volte schierato senza voto`}>
                              /{r.convocato}
                            </em>
                          )}
                        </td>
                        <td className="num muted">{r.titolare}</td>
                        <td className="num strong">{voto(r.mv)}</td>
                        {colonne.map((c) => (
                          <td key={c.k} className={`num ${c.tenue ? 'muted' : ''}`}>
                            {c.k === 'gol' && r.gol > 0 ? (
                              <span className="sg-gol">
                                <i style={{ width: `${(r.gol / maxGol) * 100}%` }} />
                                <b>{r.gol}</b>
                              </span>
                            ) : (
                              <span className={r[c.k] ? undefined : 'zero'}>{r[c.k] ?? 0}</span>
                            )}
                          </td>
                        ))}
                      </Riga>
                    ))}
                  </CorpoTabella>
                </table>
              </div>
              <p className="sg-nota">
                <b>Pres.</b> sono le partite in cui ha preso un voto; il numero dopo
                la barra sono le volte in cui era in formazione e il voto non è
                arrivato. Campionato e coppe insieme, come le conta l'archivio.
                Dove il <b>costo</b> manca, quell'anno non risulta nella rosa di
                fine stagione pur avendo giocato: succede a chi viene ceduto a
                gennaio, e la rosa è una fotografia di giugno.
                {[...traslochi.values()].some((n) => n > 1) && (
                  <> Le stagioni segnate con <b>½</b> hanno due righe perché ha
                    giocato per due società nello stesso anno.</>
                )}
              </p>
            </section>

            <section className="block">
              <h2 className="section-title">Contratti</h2>
              {contratti.length === 0 ? (
                <p className="empty">
                  Nessun contratto registrato a questo nome nell'archivio storico.
                </p>
              ) : (
                <ul className="sg-contratti">
                  {contratti.map((c, i) => (
                    <li key={i}>
                      <TeamBadge id={c.societa} size="sm" />
                      <span className="sg-durata num">
                        {c.dalla === c.alla ? c.dalla : `${c.dalla} → ${c.alla}`}
                      </span>
                      <span className="sg-anni num">
                        {c.anni} {c.anni === 1 ? 'anno' : 'anni'}
                      </span>
                      {c.under && <em className="sg-under">under</em>}
                    </li>
                  ))}
                </ul>
              )}
              <div className="avviso card">
                <strong>Contratti vecchi e incompleti.</strong> Sono le 140 righe
                arrivate dai file storici: nessuna arriva oltre il 2025-26, nessuna
                porta clausola o ingaggio, e l'aggancio a un calciatore è fatto sul
                nome scritto a mano — venti su centoquaranta non combaciano con
                nessuno. I contratti veri della Presidenza, 358 righe con gli
                importi, non sono ancora caricati: <b>finché non lo saranno, questa
                pagina non può dire se un calciatore è svincolato</b>. L'assenza di
                un contratto qui sotto non vuol dire che non ce ne sia uno.
              </div>
            </section>

            <section className="block">
              <h2 className="section-title">Cosa non c'è</h2>
              <div className="sg-mancano">
                <div>
                  <strong>Minuti giocati</strong>
                  <p>
                    Non esistono in archivio: il fantacalcio non li registra. Al
                    loro posto c'è <b>Tit.</b>, quante volte è partito dal primo
                    minuto invece che dalla panchina.
                  </p>
                </div>
                <div>
                  <strong>Infortuni</strong>
                  <p>
                    Non esistono in nessuna tabella, in nessuna stagione. Il numero
                    dopo la barra nelle presenze dice quante volte era in formazione
                    senza prendere voto — ma dentro ci sono squalifiche e scelte del
                    mister, e non è un conteggio di infortuni.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </Sezione>
    </Pagina>
  )
}

/**
 * I totali di carriera.
 *
 * La media voto e' pesata sulle presenze e non sulle stagioni: chi ha giocato
 * cinquanta partite a 6,5 e cinque a 4 non ha una media di 5,25.
 */
function somma(righe) {
  const t = {
    convocato: 0, con_voto: 0, gol: 0, rigori: 0, assist: 0,
    gialli: 0, rossi: 0, imbattuto: 0, voti: 0, mv: null,
  }
  for (const r of righe) {
    t.convocato += r.convocato ?? 0
    t.con_voto += r.con_voto ?? 0
    t.gol += r.gol ?? 0
    t.rigori += r.rigori ?? 0
    t.assist += r.assist ?? 0
    t.gialli += r.gialli ?? 0
    t.rossi += r.rossi ?? 0
    t.imbattuto += r.imbattuto ?? 0
    if (r.mv != null) t.voti += Number(r.mv) * (r.con_voto ?? 0)
  }
  t.mv = t.con_voto ? +(t.voti / t.con_voto).toFixed(2) : null
  return t
}

/*
 * Zero e' una risposta, «—» e' l'assenza di una risposta, e le due cose non
 * si scrivono uguali. La vista mette a zero le voci che il calciatore non ha
 * mai preso, quindi qui uno zero significa davvero «nessuno»: si scrive, ma
 * spento, cosi' l'occhio scorre sui numeri veri.
 */

/** La media voto con la virgola, come tutti gli altri numeri del sito. */
function voto(v) {
  if (v == null) return '—'
  return Number(v).toLocaleString('it-IT',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** L'ultimo club di serie A che risulta: le rose vecchie non ce l'hanno tutte. */
function ultimoClub(righe) {
  for (let i = righe.length - 1; i >= 0; i -= 1) if (righe[i].club) return righe[i].club
  return null
}

function Totale({ n, etichetta, nota, decimali = 0, oro }) {
  return (
    <div className="sg-totale">
      <strong className={oro ? 'oro' : undefined}>
        {n == null ? '—' : <Numero valore={n} decimali={decimali} />}
      </strong>
      <span>{etichetta}</span>
      {nota && <em>{nota}</em>}
    </div>
  )
}
