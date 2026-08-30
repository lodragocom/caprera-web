import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { catalogoVoci, salvaVoce, ritiraVoce } from '../../lib/archivio'
import { Pagina } from '../../components/moto'
import './Catalogo.css'

/**
 * Premi e penalità: il catalogo.
 *
 * Prima le voci si ricavavano da quelle già usate. Funzionava per riproporre
 * ciò che esisteva, ma non permetteva le due cose che servono davvero:
 * **definire una penalità prima di doverla applicare**, e **correggere un
 * importo** senza aspettare l'occasione di riusarlo.
 *
 * ⚠️ Qui non stanno i premi che il sistema calcola da solo — classifica
 * fantapunti, capocannoniere: quelli nascono da `lega.regole`, che viene dal
 * regolamento versionato. Qui ci sono le voci che si registrano **a mano**.
 * Se le due cose si mescolassero, lo stesso numero avrebbe due verità.
 */

const CATEGORIE = [
  { id: 'penalita', nome: 'Penalità' },
  { id: 'premi-caprera', nome: 'Premi Caprera' },
  { id: 'classifiche', nome: 'Classifiche' },
  { id: 'diritti-tv', nome: 'Diritti TV' },
  { id: 'serie-a-awards', nome: 'Serie A Awards' },
  { id: 'giochi', nome: 'Giochi' },
  { id: 'assicurazioni', nome: 'Assicurazioni' },
]

const VUOTA = {
  id: null, categoria: 'penalita', nome: '', importo: '',
  descrizione: '', attiva: true, ordine: 100,
}

export default function Catalogo() {
  const { vedeTutto } = useAuth()
  const [voci, setVoci] = useState(null)
  const [errore, setErrore] = useState(null)
  const [esito, setEsito] = useState(null)
  const [modifica, setModifica] = useState(null)
  const [ritirate, setRitirate] = useState(false)

  const carica = useCallback(() => {
    catalogoVoci().then(setVoci).catch((e) => setErrore(e.message))
  }, [])
  useEffect(carica, [carica])

  async function atto(promessa) {
    setErrore(null); setEsito(null)
    try {
      setEsito(await promessa)
      setModifica(null)
      carica()
    } catch (e) { setErrore(e.message) }
  }

  const perCategoria = useMemo(() => {
    const m = new Map(CATEGORIE.map((c) => [c.id, []]))
    for (const v of voci ?? []) {
      if (!ritirate && !v.attiva) continue
      m.get(v.categoria)?.push(v)
    }
    return CATEGORIE.map((c) => [c, m.get(c.id) ?? []]).filter(([, v]) => v.length)
  }, [voci, ritirate])

  if (!vedeTutto) {
    return (
      <Pagina className="cat">
        <h1>Premi e penalità</h1>
        <p className="cat-nota">Questa sezione è di chi ha un incarico di governo.</p>
      </Pagina>
    )
  }

  return (
    <Pagina className="cat">
      <h1>Premi e penalità</h1>
      <p className="cat-nota">
        Le voci che la Presidenza può assegnare. Definirle qui vuol dire poter{' '}
        <strong>creare una penalità prima di doverla applicare</strong>, invece di
        scriverla al volo la sera in cui serve.
      </p>
      <p className="cat-avviso">
        Qui <strong>non</strong> stanno i premi che il sistema calcola da solo — classifica
        fantapunti, capocannoniere e simili: quelli nascono dal regolamento. Queste sono le
        voci che si registrano a mano.
      </p>

      {errore && <p className="cat-errore">{errore}</p>}
      {esito && <p className="cat-esito">{esito}</p>}

      <div className="cat-barra">
        <button className="cat-nuovo" onClick={() => setModifica(modifica ? null : { ...VUOTA })}>
          {modifica ? 'Lascia stare' : 'Aggiungi una voce'}
        </button>
        <label>
          <input type="checkbox" checked={ritirate}
                 onChange={(e) => setRitirate(e.target.checked)} />
          Mostra anche quelle messe da parte
        </label>
      </div>

      {modifica && (
        <Modulo v={modifica} set={setModifica} salva={() => atto(salvaVoce(modifica))} />
      )}

      {!voci && <p className="cat-nota">Sto guardando…</p>}

      {perCategoria.map(([c, elenco]) => (
        <section key={c.id} className="cat-sez">
          <h2>{c.nome} <span>{elenco.length}</span></h2>
          <table>
            <tbody>
              {elenco.map((v) => (
                <tr key={v.id} className={v.attiva ? '' : 'ritirata'}>
                  <td className="cat-imp">
                    {v.importo == null ? '—' : (v.importo > 0 ? `+${v.importo}` : v.importo)}
                  </td>
                  <td className="cat-nome">
                    {v.nome}
                    {v.descrizione && <span>{v.descrizione}</span>}
                  </td>
                  <td className="cat-azioni">
                    <button onClick={() => setModifica({ ...v, importo: v.importo ?? '' })}>
                      modifica
                    </button>
                    <button onClick={() => atto(ritiraVoce(v.id, !v.attiva))}>
                      {v.attiva ? 'metti da parte' : 'rimetti in uso'}
                    </button>
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

function Modulo({ v, set, salva }) {
  return (
    <div className="cat-modulo">
      <div className="cat-campi">
        <label>
          Tipo
          <select value={v.categoria} onChange={(e) => set({ ...v, categoria: e.target.value })}>
            {CATEGORIE.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </label>
        <label>
          Nome
          <input value={v.nome} onChange={(e) => set({ ...v, nome: e.target.value })}
                 placeholder="Formazione non data" />
          <em>Il nome non cambia mai: è così che si conta quante volte è successo.</em>
        </label>
        <label>
          Crediti
          <input type="number" value={v.importo}
                 onChange={(e) => set({ ...v, importo: e.target.value })} placeholder="-1" />
          {/* L'importo è un suggerimento e non un vincolo: le scale della lega
              cambiano nel tempo, e imporlo renderebbe impossibile registrare la
              storia com'è andata davvero. */}
          <em>Il valore predefinito. Resta modificabile quando si registra l’atto.</em>
        </label>
      </div>
      <label className="cat-descr">
        Cosa vuol dire
        <input value={v.descrizione ?? ''}
               onChange={(e) => set({ ...v, descrizione: e.target.value })}
               placeholder="quando un mister non invia la formazione entro l’orario" />
      </label>
      <div className="cat-bottoni">
        <button className="cat-ok" onClick={salva} disabled={!String(v.nome).trim()}>
          {v.id ? 'Salva le modifiche' : 'Aggiungi al catalogo'}
        </button>
      </div>
    </div>
  )
}
