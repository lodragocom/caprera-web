import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl } from '../../lib/core'
import {
  governoSocieta, emettiTessera, revocaTessera, cambiaIncarichi, incarichi as tuttiGliIncarichi,
} from '../../lib/archivio'
import { Pagina, Cascata, Voce } from '../../components/moto'
import './Federazione.css'

/**
 * La dashboard della Presidenza — Fase 1: le persone.
 *
 * Finora intestare una tessera voleva dire aprire il cruscotto Supabase e
 * scrivere SQL. Funzionava perché la Presidenza è chi ha costruito il sistema;
 * non funziona con una Presidenza che non lo è — e con l'App, ogni lega nuova
 * ne avrà una.
 *
 * Qui non c'è nessun controllo di sicurezza, ed è voluto: `governo_societa`,
 * `emetti_tessera`, `revoca_tessera` e `cambia_incarichi` si chiudono da sole
 * su `caprera.vede_tutto()`. Se questa pagina finisse davanti a un mister,
 * vedrebbe una tabella vuota e ogni bottone gli risponderebbe di no. La
 * riservatezza la fanno le regole di riga, non il JSX.
 */
export default function Federazione() {
  const { vedeTutto } = useAuth()
  const [righe, setRighe] = useState(null)
  const [ruoli, setRuoli] = useState([])
  const [errore, setErrore] = useState(null)
  const [esito, setEsito] = useState(null)
  const [apre, setApre] = useState(null)

  const carica = useCallback(() => {
    governoSocieta().then(setRighe).catch((e) => setErrore(e.message))
  }, [])

  useEffect(() => {
    carica()
    tuttiGliIncarichi().then(setRuoli).catch(() => {})
  }, [carica])

  /* Ogni atto passa di qui: una sola strada per il messaggio e per il ricarico,
     così non capita che la tabella resti indietro rispetto a ciò che è successo. */
  async function atto(promessa) {
    setErrore(null); setEsito(null)
    try {
      setEsito(await promessa)
      setApre(null)
      carica()
    } catch (e) { setErrore(e.message) }
  }

  if (!vedeTutto) {
    return (
      <Pagina className="fed">
        <h1>Presidenza</h1>
        <p className="fed-nota">
          Questa sezione è di chi ha un incarico di governo. Se pensi di doverci
          entrare, è la Presidenza che assegna gli incarichi.
        </p>
      </Pagina>
    )
  }

  const scoperte = righe?.filter((r) => !r.email).length ?? 0

  return (
    <Pagina className="fed">
      <h1>Presidenza</h1>
      <p className="fed-nota">
        Chi guida le dieci società, e chi manca ancora.{' '}
        {scoperte > 0
          ? <strong>{scoperte === 1 ? 'Una società è scoperta' : `${scoperte} società sono scoperte`}.</strong>
          : 'Tutte hanno una tessera.'}
      </p>

      <p className="fed-avviso">
        <strong>Con un incarico di governo non si collauda la riservatezza.</strong> Chi
        vede tutto vede tutto per diritto: qualunque pagina «funziona» senza
        dimostrare niente. Per provare che un mister non legge i contratti di un
        altro serve una tessera da mister, senza incarichi.
      </p>

      {errore && <p className="fed-errore">{errore}</p>}
      {esito && <p className="fed-esito">{esito}</p>}

      {!righe && <p className="fed-nota">Sto guardando…</p>}

      {righe && (
        <Cascata className="fed-lista">
          {righe.map((r) => (
            <Voce key={r.societa}>
              <Riga
                r={r}
                ruoli={ruoli}
                aperta={apre === r.societa}
                apri={() => setApre(apre === r.societa ? null : r.societa)}
                atto={atto}
              />
            </Voce>
          ))}
        </Cascata>
      )}
    </Pagina>
  )
}

function Riga({ r, ruoli, aperta, apri, atto }) {
  const team = getTeam(r.societa)
  const stato = !r.email ? 'scoperta' : !r.registrato ? 'attesa' : !r.collegato ? 'sospesa' : 'ok'

  return (
    <div className={`fed-riga ${stato}`}>
      <div className="fed-testa" onClick={apri} role="button" tabIndex={0}
           onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && apri()}>
        <img className="fed-stemma" src={logoUrl(team)} alt="" />
        <div className="fed-chi">
          <span className="fed-societa">{r.nome_societa}</span>
          <span className="fed-mister">{r.nome || <em>nessuna tessera</em>}</span>
        </div>
        <div className="fed-email">{r.email || '—'}</div>
        <div className="fed-incarichi">
          {(r.incarichi ?? []).filter((i) => i !== 'mister').map((i) => (
            <span key={i} className="fed-pallino">{ruoli.find((x) => x.id === i)?.nome ?? i}</span>
          ))}
        </div>
        <div className="fed-stato"><Stato stato={stato} /></div>
      </div>
      {aperta && <Modulo r={r} ruoli={ruoli} atto={atto} />}
    </div>
  )
}

/* I quattro stati dicono cose diverse, e confonderli fa perdere tempo:
   "in attesa" è normale e si aspetta, "sospesa" è un guasto e si guarda. */
function Stato({ stato }) {
  if (stato === 'scoperta') return <span className="s-scoperta">nessuna tessera</span>
  if (stato === 'attesa') return <span className="s-attesa">emessa, non ancora registrato</span>
  if (stato === 'sospesa') return <span className="s-sospesa">registrato ma non collegato</span>
  return <span className="s-ok">attiva</span>
}

function Modulo({ r, ruoli, atto }) {
  const [email, setEmail] = useState(r.email ?? '')
  const [nome, setNome] = useState(r.nome ?? '')
  const [scelti, setScelti] = useState((r.incarichi ?? []).filter((i) => i !== 'mister'))
  const [conferma, setConferma] = useState(false)

  const spunta = (id) =>
    setScelti(scelti.includes(id) ? scelti.filter((x) => x !== id) : [...scelti, id])

  return (
    <div className="fed-modulo">
      <label>
        Email di Fantapazz
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               placeholder="mister@esempio.it" disabled={!!r.email} />
      </label>
      {r.email && <p className="fed-piccolo">
        L’email non si cambia: si revoca la tessera e se ne intesta un’altra.
      </p>}

      <label>
        Nome da mostrare
        <input value={nome} onChange={(e) => setNome(e.target.value)}
               placeholder="come lo chiamiamo finché non compila la scheda" />
      </label>

      <fieldset className="fed-ruoli">
        <legend>Incarichi di lega</legend>
        {ruoli.filter((i) => i.id !== 'mister').map((i) => (
          <label key={i.id} className={i.vede_tutto ? 'alto' : ''}>
            <input type="checkbox" checked={scelti.includes(i.id)} onChange={() => spunta(i.id)} />
            <span>{i.nome}</span>
            <small>{i.descrizione}</small>
          </label>
        ))}
        <p className="fed-piccolo">
          Quelli evidenziati vedono <strong>tutte</strong> le società, non solo la propria.
        </p>
      </fieldset>

      <div className="fed-bottoni">
        {!r.email && (
          <button className="fed-ok"
                  onClick={() => atto(emettiTessera(email, r.societa, nome, scelti))}
                  disabled={!email.includes('@')}>
            Intesta la tessera
          </button>
        )}
        {r.email && (
          <button className="fed-ok" onClick={() => atto(cambiaIncarichi(r.email, scelti))}>
            Salva gli incarichi
          </button>
        )}
        {r.email && !conferma && (
          <button className="fed-via" onClick={() => setConferma(true)}>Revoca la tessera…</button>
        )}
        {r.email && conferma && (
          <span className="fed-conferma">
            La società resta scoperta. L’accesso della persona <strong>non</strong> viene
            cancellato, e riemettendo la tessera si ricollega da solo.
            <button className="fed-via" onClick={() => atto(revocaTessera(r.email))}>
              Revoca davvero
            </button>
            <button onClick={() => setConferma(false)}>Lascia stare</button>
          </span>
        )}
      </div>
    </div>
  )
}
