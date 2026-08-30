import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl } from '../../lib/core'
import { attiLega, registraAtto, cancellaAtto, catalogoStagione, stagioni as tutteLeStagioni } from '../../lib/archivio'
import { Pagina } from '../../components/moto'
import './Atti.css'

/**
 * Gli atti di governo.
 *
 * Penalità, Caprera Etica, premi discrezionali: le cose che nessun calcolo
 * produce e che finora finivano dentro `finanze.bonus` — un intero unico in
 * cui non si rientra. Un gioco manageriale deve saper rispondere a «perché ho
 * dodici crediti in meno?», e la risposta non è un numero: è un elenco.
 *
 * Il registro esisteva già, con dieci stagioni dentro. Quello che mancava era
 * poterci scrivere senza aprire il cruscotto del database — cioè, in pratica,
 * non scriverci affatto.
 */

const CATEGORIE = [
  { id: 'penalita', nome: 'Penalità', aiuto: 'Multe, Caprera Etica, sanzioni' },
  { id: 'premi-caprera', nome: 'Premi Caprera', aiuto: 'Mazzarri, Fair Play, Panchina d’oro' },
  { id: 'classifiche', nome: 'Classifiche', aiuto: 'Fantapunti, capocannoniere' },
  { id: 'diritti-tv', nome: 'Diritti TV', aiuto: 'Per chi arriva in finale' },
  { id: 'serie-a-awards', nome: 'Serie A Awards', aiuto: 'I premi dei ruoli' },
  { id: 'giochi', nome: 'Giochi', aiuto: 'Grigliata, Mr Champions' },
  { id: 'assicurazioni', nome: 'Assicurazioni', aiuto: 'Polizze infortuni' },
]

export default function Atti() {
  const { vedeTutto } = useAuth()
  const [stagione, setStagione] = useState(null)
  const [elenco, setElenco] = useState(null)
  const [anni, setAnni] = useState([])
  const [errore, setErrore] = useState(null)
  const [esito, setEsito] = useState(null)
  const [nuovo, setNuovo] = useState(null)
  const [catalogo, setCatalogo] = useState([])

  const carica = useCallback((s) => {
    attiLega(s).then(setElenco).catch((e) => setErrore(e.message))
    // Il catalogo si rilegge ad ogni cambio d'anno: gli importi appartengono
    // alla stagione, e proporre quelli di un'altra sarebbe peggio che non
    // proporne nessuno.
    if (s) {
      catalogoStagione(s)
        .then((v) => setCatalogo(v.filter((x) => x.attiva && x.ha_importo)))
        .catch(() => setCatalogo([]))
    }
  }, [])

  useEffect(() => {
    tutteLeStagioni().then((s) => {
      const ordinate = [...s].sort((a, b) => b.id.localeCompare(a.id))
      setAnni(ordinate)
      const corrente = ordinate[0]?.id ?? null
      setStagione(corrente)
      carica(corrente)
    }).catch((e) => setErrore(e.message))
  }, [carica])

  async function atto(promessa) {
    setErrore(null); setEsito(null)
    try {
      setEsito(await promessa)
      setNuovo(null)
      carica(stagione)
    } catch (e) { setErrore(e.message) }
  }

  /* Raggruppati per società: la domanda vera non è «quali atti ho firmato»
     ma «quanto ha preso o perso ciascuno, e perché». */
  const perSocieta = useMemo(() => {
    const m = new Map()
    for (const r of elenco ?? []) {
      if (!m.has(r.societa)) m.set(r.societa, { nome: r.nome_societa, righe: [], totale: 0 })
      const g = m.get(r.societa)
      g.righe.push(r)
      g.totale += r.crediti
    }
    return [...m.entries()].sort((a, b) => a[1].nome.localeCompare(b[1].nome))
  }, [elenco])

  if (!vedeTutto) {
    return (
      <Pagina className="atti">
        <h1>Atti di governo</h1>
        <p className="atti-nota">Questa sezione è di chi ha un incarico di governo.</p>
      </Pagina>
    )
  }

  return (
    <Pagina className="atti">
      <h1>Atti di governo</h1>
      <p className="atti-nota">
        Penalità, premi e Caprera Etica: le cose che <strong>decide la Presidenza</strong> e
        che nessun calcolo produce. Il mercato non è qui — quello nasce dalle compravendite.
      </p>

      <div className="atti-barra">
        <label>
          Stagione
          <select value={stagione ?? ''} onChange={(e) => { setStagione(e.target.value); carica(e.target.value) }}>
            {anni.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
          </select>
        </label>
        <button className="atti-nuovo" onClick={() => setNuovo(nuovo ? null : { categoria: 'penalita', crediti: '' })}>
          {nuovo ? 'Lascia stare' : 'Registra un atto'}
        </button>
      </div>

      {errore && <p className="atti-errore">{errore}</p>}
      {esito && <p className="atti-esito">{esito}</p>}

      {nuovo && (
        <Modulo
          v={nuovo} set={setNuovo} stagione={stagione} catalogo={catalogo}
          salva={() => atto(registraAtto({ ...nuovo, stagione }))}
        />
      )}

      {!elenco && <p className="atti-nota">Sto guardando…</p>}
      {elenco && elenco.length === 0 && (
        <p className="atti-nota">Nessun atto registrato per questa stagione.</p>
      )}

      {perSocieta.map(([id, g]) => (
        <section key={id} className="atti-soc">
          <header>
            <img src={logoUrl(getTeam(id))} alt="" />
            <h2>{g.nome}</h2>
            <span className={`atti-tot ${g.totale >= 0 ? 'su' : 'giu'}`}>
              {g.totale > 0 ? '+' : ''}{g.totale}
            </span>
          </header>
          <table>
            <tbody>
              {g.righe.map((r) => (
                <tr key={r.id}>
                  <td className="atti-cat">{CATEGORIE.find((c) => c.id === r.categoria)?.nome ?? r.categoria}</td>
                  <td className="atti-voce">
                    {r.voce}
                    {r.nota && <span className="atti-nota-riga">{r.nota}</span>}
                  </td>
                  <td className={`atti-cred ${r.crediti >= 0 ? 'su' : 'giu'}`}>
                    {r.crediti > 0 ? '+' : ''}{r.crediti}
                  </td>
                  <td className="atti-fonte">
                    {/* Da dove viene il numero: un atto deciso oggi non è la
                        stessa cosa di una riga trascritta da un foglio, e fra
                        un anno sarà l'unica cosa che permette di distinguerli. */}
                    {r.fonte === 'Presidenza'
                      ? <button onClick={() => atto(cancellaAtto(r.id))} title="Cancella">×</button>
                      : <em title={`Trascritto da: ${r.fonte}`}>{r.fonte}</em>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </Pagina>
  )
}

function Modulo({ v, set, stagione, salva, catalogo }) {
  const cat = CATEGORIE.find((c) => c.id === v.categoria)
  /* Le voci gia' usate per questo tipo di atto. Scegliere invece di scrivere
     e' l'unico modo di non avere in archivio «FPF» e «FFP», «Formazione non
     data» e «Mancata Formazione» — sinonimi che rendono impossibile contare
     quante volte una cosa e' successa. */
  const voci = (catalogo ?? []).filter((c) => c.categoria === v.categoria)

  /* Scelta una voce, l'importo si propone da solo: e' quello dell'ultima
     volta che quella cosa e' stata assegnata. Resta modificabile, perche' le
     scale cambiano — il Fantapunti 2o e' stato 3 e 4 in stagioni diverse. */
  function scegli(voce) {
    const c = voci.find((x) => x.nome === voce)
    set({ ...v, voce, crediti: c && c.importo != null ? String(c.importo) : v.crediti })
  }

  return (
    <div className="atti-modulo">
      <div className="atti-campi">
        <label>
          Società
          <select value={v.societa ?? ''} onChange={(e) => set({ ...v, societa: e.target.value })}>
            <option value="">scegli…</option>
            {['armata-rossa', 'aston-ville', 'disperata', 'prosecco', 'real-monghi',
              'roburro', 'sanguemisto', 'smit', 'sporting-mangiapreti', 'subbuteo']
              .map((id) => <option key={id} value={id}>{getTeam(id).name}</option>)}
          </select>
        </label>
        <label>
          Tipo
          <select value={v.categoria}
                  onChange={(e) => set({ ...v, categoria: e.target.value, voce: '' })}>
            {CATEGORIE.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <em>{cat?.aiuto}</em>
        </label>
        <label>
          Crediti
          <input type="number" value={v.crediti}
                 onChange={(e) => set({ ...v, crediti: e.target.value })}
                 placeholder="-5" />
          <em>Negativo per togliere, positivo per dare</em>
        </label>
      </div>

      <label className="atti-motivo">
        Voce
        {/* Un elenco, non un campo libero — ma con la possibilità di scriverne
            una nuova: il catalogo nasce dalle voci già usate, e una voce nuova
            ci entra semplicemente usandola. */}
        <input list="voci-atti" value={v.voce ?? ''}
               onChange={(e) => scegli(e.target.value)}
               placeholder="scegli dall’elenco, o scrivine una nuova" />
        <datalist id="voci-atti">
          {voci.map((c) => (
            <option key={c.id} value={c.nome}>
              {c.importo == null ? '' : (c.importo > 0 ? `+${c.importo}` : c.importo)}
              {c.descrizione ? ` · ${c.descrizione}` : ''}
            </option>
          ))}
        </datalist>
        <em>
          {voci.length > 0
            ? `${voci.length} voci a catalogo per questo tipo. Sceglierne una compila i crediti col valore predefinito, che resta modificabile.`
            : 'Nessuna voce a catalogo per questo tipo: definiscila in «Premi e penalità», oppure scrivila qui.'}
        </em>
      </label>

      <label className="atti-motivo">
        Nota <span className="atti-facolt">facoltativa</span>
        <input value={v.nota ?? ''} onChange={(e) => set({ ...v, nota: e.target.value })}
               placeholder="alla 12ª giornata, dopo la segnalazione del Giudice" />
        <em>Il dettaglio che fra un anno spiegherà la riga senza doversi ricordare nulla.</em>
      </label>

      <div className="atti-bottoni">
        <button className="atti-ok" onClick={salva}
                disabled={!v.societa || !v.crediti || !String(v.voce ?? '').trim()}>
          Registra su {stagione}
        </button>
      </div>
    </div>
  )
}
