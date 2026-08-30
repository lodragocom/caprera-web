import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import {
  stagioneSettaggio, salvaStagione, finestre as leggiFinestre,
  salvaFinestra, cancellaFinestra, salvaCreditiStagione,
  stagioni as tutteLeStagioni,
} from '../../lib/archivio'
import { Pagina } from '../../components/moto'
import { Catalogo } from './Catalogo'
import './Stagione.css'

/**
 * Il settaggio della stagione.
 *
 * Aprire un anno vuol dire decidere quattro cose: quante giornate si giocano,
 * quando è aperto il mercato, con quanti crediti si parte, e quali premi e
 * penalità esistono. Finora si facevano tutte a mano nel cruscotto del
 * database — cioè una volta l'anno, che è esattamente la frequenza con cui
 * nessuno ricorda come si fa.
 *
 * ⚠️ Le **regole di calcolo** non stanno qui: vivono in `lega.regole`, che
 * viene dal JSON versionato. È la scelta di ADR-002 e vale ancora — ciò che
 * regge il sistema deve stare in un file confrontabile, non in un pannello
 * dove una modifica non lascia traccia di chi e perché.
 */

const PARTI = [
  { id: 'stagione', nome: 'La stagione' },
  { id: 'mercato', nome: 'Finestre di mercato' },
  { id: 'crediti', nome: 'Crediti di partenza' },
  { id: 'voci', nome: 'Premi e penalità' },
]

export default function Stagione() {
  const { vedeTutto } = useAuth()
  const [anni, setAnni] = useState([])
  const [anno, setAnno] = useState(null)
  const [parte, setParte] = useState('stagione')
  const [dati, setDati] = useState(null)
  const [errore, setErrore] = useState(null)
  const [esito, setEsito] = useState(null)

  const carica = useCallback((s) => {
    if (!s) return
    stagioneSettaggio(s).then(setDati).catch((e) => setErrore(e.message))
  }, [])

  useEffect(() => {
    tutteLeStagioni().then((s) => {
      const ord = [...s].sort((a, b) => b.id.localeCompare(a.id))
      setAnni(ord)
      setAnno(ord[0]?.id ?? null)
      carica(ord[0]?.id)
    }).catch((e) => setErrore(e.message))
  }, [carica])

  async function atto(promessa) {
    setErrore(null); setEsito(null)
    try { setEsito(await promessa); carica(anno) }
    catch (e) { setErrore(e.message) }
  }

  if (!vedeTutto) {
    return (
      <Pagina className="sta">
        <h1>Stagione</h1>
        <p className="sta-nota">Questa sezione è di chi ha un incarico di governo.</p>
      </Pagina>
    )
  }

  return (
    <Pagina className="sta">
      <h1>Stagione</h1>

      <div className="sta-scelta">
        <label>
          Anno
          <select value={anno ?? ''} onChange={(e) => { setAnno(e.target.value); carica(e.target.value) }}>
            {anni.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
          </select>
        </label>
        {dati && (
          <div className="sta-specchio">
            <span><b>{dati.giornate}</b> giornate</span>
            <span><b>{dati.societa_con_finanze}</b> società</span>
            <span><b>{dati.crediti_min}–{dati.crediti_max}</b> crediti</span>
            <span className={dati.finestre === 0 ? 'manca' : ''}>
              <b>{dati.finestre}</b> finestre
            </span>
            <span><b>{dati.contratti_vivi}</b> contratti vivi</span>
            <span><b>{dati.atti}</b> atti</span>
            <span className={dati.conclusa ? 'chiusa' : 'aperta'}>
              {dati.conclusa ? 'conclusa' : 'in corso'}
            </span>
          </div>
        )}
      </div>

      {/* La finestra mancante è la cosa che si dimentica e che poi fa danno:
          senza date, nessuno scambio può essere giudicato regolare. */}
      {dati && dati.finestre === 0 && !dati.conclusa && (
        <p className="sta-manca">
          <strong>Questa stagione non ha ancora nessuna finestra di mercato.</strong> Senza
          date, non c’è modo di dire se uno scambio è arrivato in tempo.
        </p>
      )}

      <nav className="sta-parti">
        {PARTI.map((p) => (
          <button key={p.id} className={parte === p.id ? 'sceltA' : ''}
                  onClick={() => setParte(p.id)}>{p.nome}</button>
        ))}
      </nav>

      {errore && <p className="sta-errore">{errore}</p>}
      {esito && <p className="sta-esito">{esito}</p>}

      {parte === 'stagione' && dati && <Parametri d={dati} atto={atto} />}
      {parte === 'mercato' && anno && <Mercato stagione={anno} atto={atto} />}
      {parte === 'crediti' && dati && <Crediti d={dati} atto={atto} />}
      {parte === 'voci' && <Catalogo />}
    </Pagina>
  )
}

/* ------------------------------------------------------------- i parametri */

function Parametri({ d, atto }) {
  const [giornate, setGiornate] = useState(d.giornate)
  const [conclusa, setConclusa] = useState(d.conclusa)
  useEffect(() => { setGiornate(d.giornate); setConclusa(d.conclusa) }, [d])

  return (
    <div className="sta-blocco">
      <label>
        Giornate
        <input type="number" value={giornate} min="1" max="38"
               onChange={(e) => setGiornate(e.target.value)} />
        {/* Caprera comincia dopo la chiusura del mercato e salta le prime
            giornate di Serie A: 36 è il caso normale, non un limite. */}
        <em>
          Trentasei è il caso normale: Caprera comincia dopo la chiusura del mercato e salta
          le prime giornate di Serie A. Nel 2022-23 ne saltò tre.
        </em>
      </label>
      <label className="sta-riga">
        <input type="checkbox" checked={conclusa} onChange={(e) => setConclusa(e.target.checked)} />
        <span>
          Stagione conclusa
          <em>Da spuntare quando l’ultima giornata è giocata e l’albo d’oro è scritto.</em>
        </span>
      </label>
      <button className="sta-ok" onClick={() => atto(salvaStagione(d.stagione, giornate, conclusa))}>
        Salva
      </button>
    </div>
  )
}

/* --------------------------------------------------------------- i crediti */

function Crediti({ d, atto }) {
  const [base, setBase] = useState(d.base ?? 250)
  const [giovani, setGiovani] = useState(d.giovani ?? 0)
  useEffect(() => { setBase(d.base ?? 250); setGiovani(d.giovani ?? 0) }, [d])

  return (
    <div className="sta-blocco">
      <p className="sta-nota">
        Valgono per <strong>tutte le società</strong>. Quello che ciascuna si ritrova davvero
        dipende poi da riporti, premi e penalità.
      </p>
      <div className="sta-campi">
        <label>
          Budget d’asta
          <input type="number" value={base} onChange={(e) => setBase(e.target.value)} />
          <em>250 dal regolamento.</em>
        </label>
        <label>
          Crediti under
          <input type="number" value={giovani} onChange={(e) => setGiovani(e.target.value)} />
          <em>3 nelle stagioni in cui è in vigore.</em>
        </label>
      </div>
      <p className="sta-avviso">
        Salvando, <strong>i crediti iniziali di tutte e dieci vengono rifatti</strong>: sono una
        somma — budget più riporti, premi, FPF e assicurazioni — non un numero scritto a mano.
      </p>
      <button className="sta-ok" onClick={() => atto(salvaCreditiStagione(d.stagione, base, giovani))}>
        Salva e ricalcola
      </button>
    </div>
  )
}

/* --------------------------------------------------------------- il mercato */

const TIPI = [
  { id: 'asta', nome: 'Asta' },
  { id: 'scambi', nome: 'Scambi' },
  { id: 'svincoli', nome: 'Svincoli' },
]

function Mercato({ stagione, atto }) {
  const [righe, setRighe] = useState(null)
  const [modifica, setModifica] = useState(null)
  const carica = useCallback(() => {
    leggiFinestre(stagione).then(setRighe).catch(() => setRighe([]))
  }, [stagione])
  useEffect(carica, [carica])

  async function fai(p) { await atto(p); setModifica(null); carica() }

  return (
    <div className="sta-blocco">
      <p className="sta-nota">
        Quando il mercato è aperto. Sono le date che dicono se uno scambio è arrivato in
        tempo — finora vivevano in un messaggio su WhatsApp.
      </p>

      <button className="sta-nuovo"
              onClick={() => setModifica(modifica ? null : { stagione, tipo: 'scambi', etichetta: '' })}>
        {modifica ? 'Lascia stare' : 'Aggiungi una finestra'}
      </button>

      {modifica && (
        <div className="sta-modulo">
          <div className="sta-campi">
            <label>
              Tipo
              <select value={modifica.tipo} onChange={(e) => setModifica({ ...modifica, tipo: e.target.value })}>
                {TIPI.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </label>
            <label>
              Apre
              <input type="date" value={modifica.apre ?? ''}
                     onChange={(e) => setModifica({ ...modifica, apre: e.target.value })} />
            </label>
            <label>
              Chiude
              <input type="date" value={modifica.chiude ?? ''}
                     onChange={(e) => setModifica({ ...modifica, chiude: e.target.value })} />
              <em>Si può lasciare vuoto: certe aste non hanno una fine dichiarata.</em>
            </label>
          </div>
          <label className="sta-largo">
            Come si chiama
            <input value={modifica.etichetta}
                   onChange={(e) => setModifica({ ...modifica, etichetta: e.target.value })}
                   placeholder="Finestra Mercato Scambi" />
          </label>
          <button className="sta-ok" onClick={() => fai(salvaFinestra(modifica))}
                  disabled={!String(modifica.etichetta).trim()}>
            {modifica.id ? 'Salva' : 'Aggiungi'}
          </button>
        </div>
      )}

      {righe && righe.length === 0 && (
        <p className="sta-nota">Nessuna finestra per questa stagione.</p>
      )}

      {righe && righe.length > 0 && (
        <table className="sta-tab">
          <tbody>
            {righe.map((f) => (
              <tr key={f.id}>
                <td className="sta-tipo">{TIPI.find((t) => t.id === f.tipo)?.nome ?? f.tipo}</td>
                <td>{f.etichetta}</td>
                <td className="sta-date">
                  {f.apre ? new Date(f.apre).toLocaleDateString('it-IT') : '—'}
                  {' → '}
                  {f.chiude ? new Date(f.chiude).toLocaleDateString('it-IT') : 'senza fine'}
                </td>
                <td className="sta-azioni">
                  <button onClick={() => setModifica({
                    ...f,
                    apre: f.apre ? f.apre.slice(0, 10) : '',
                    chiude: f.chiude ? f.chiude.slice(0, 10) : '',
                  })}>modifica</button>
                  {/* Le finestre d'archivio non si cancellano: servono a
                      giudicare gli scambi di allora. */}
                  {f.fonte === 'Presidenza'
                    ? <button onClick={() => fai(cancellaFinestra(f.id))}>elimina</button>
                    : <em title={`Da: ${f.fonte}`}>archivio</em>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
