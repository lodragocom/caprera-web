import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { catalogoStagione, salvaVoce, salvaImportoVoce, ritiraVoce } from '../../lib/archivio'
import './Catalogo.css'

/**
 * Premi e penalità di una stagione.
 *
 * Due cose separate, e la separazione è il punto:
 *
 * - la **voce** dice *cos'è* — «Formazione non data» — ed è per sempre;
 * - l'**importo** appartiene a *una stagione*, perché le scale della lega
 *   cambiano: il Fantapunti 9º è stato −4, poi −3, poi −2.
 *
 * Tenerne uno solo mentirebbe sul passato o impedirebbe di cambiare in
 * futuro. E quante volte una cosa è successa si **conta** dai movimenti: non
 * si scrive a mano in un testo che il giorno dopo è già vecchio.
 *
 * ⚠️ Qui non stanno i premi che il sistema calcola da solo — classifica
 * fantapunti, capocannoniere: quelli nascono da `lega.regole`, dal regolamento
 * versionato. Se le due cose si mescolassero, lo stesso numero avrebbe due
 * verità.
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

const VUOTA = { id: null, categoria: 'penalita', nome: '', descrizione: '', attiva: true }

export function Catalogo({ stagione }) {
  const { vedeTutto } = useAuth()
  const [voci, setVoci] = useState(null)
  const [errore, setErrore] = useState(null)
  const [esito, setEsito] = useState(null)
  const [modifica, setModifica] = useState(null)
  const [solo, setSolo] = useState('in-uso')

  const carica = useCallback(() => {
    if (!stagione) return
    catalogoStagione(stagione).then(setVoci).catch((e) => setErrore(e.message))
  }, [stagione])
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
      if (solo === 'in-uso' && !v.ha_importo) continue
      if (solo === 'in-uso' && !v.attiva) continue
      m.get(v.categoria)?.push(v)
    }
    return CATEGORIE.map((c) => [c, m.get(c.id) ?? []]).filter(([, v]) => v.length)
  }, [voci, solo])

  const conto = useMemo(() => ({
    valgono: (voci ?? []).filter((v) => v.ha_importo).length,
    tutte: (voci ?? []).length,
  }), [voci])

  if (!vedeTutto) return null

  return (
    <div className="cat">
      <p className="cat-nota">
        Cosa la Presidenza può assegnare <strong>nel {stagione}</strong>, e quanto vale qui.
        L’importo appartiene alla stagione: le scale cambiano, e il Fantapunti 9º è stato
        −4, poi −3, poi −2.
      </p>
      <p className="cat-avviso">
        Qui <strong>non</strong> stanno i premi che il sistema calcola da solo. Queste sono le
        voci che si registrano a mano.
      </p>

      {errore && <p className="cat-errore">{errore}</p>}
      {esito && <p className="cat-esito">{esito}</p>}

      <div className="cat-barra">
        <button className="cat-nuovo" onClick={() => setModifica(modifica ? null : { ...VUOTA })}>
          {modifica ? 'Lascia stare' : 'Aggiungi una voce'}
        </button>
        <div className="cat-filtro">
          <button className={solo === 'in-uso' ? 'sceltA' : ''} onClick={() => setSolo('in-uso')}>
            Valgono nel {stagione} <span>{conto.valgono}</span>
          </button>
          <button className={solo === 'tutte' ? 'sceltA' : ''} onClick={() => setSolo('tutte')}>
            Tutte <span>{conto.tutte}</span>
          </button>
        </div>
      </div>

      {modifica && (
        <Modulo v={modifica} set={setModifica} salva={() => atto(salvaVoce(modifica))} />
      )}

      {!voci && <p className="cat-nota">Sto guardando…</p>}
      {voci && perCategoria.length === 0 && (
        <p className="cat-nota">
          Nessuna voce vale nel {stagione}. Guarda <strong>Tutte</strong> e dai un importo a
          quelle che servono.
        </p>
      )}

      {perCategoria.map(([c, elenco]) => (
        <section key={c.id} className="cat-sez">
          <h2>{c.nome} <span>{elenco.length}</span></h2>
          <table>
            <tbody>
              {elenco.map((v) => (
                <Riga key={v.id} v={v} stagione={stagione} atto={atto}
                      modificaVoce={() => setModifica({ ...v })} />
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}

function Riga({ v, stagione, atto, modificaVoce }) {
  const [imp, setImp] = useState(v.importo ?? '')
  useEffect(() => { setImp(v.importo ?? '') }, [v.importo])
  const cambiato = String(imp) !== String(v.importo ?? '')

  return (
    <tr className={`${v.attiva ? '' : 'ritirata'} ${v.ha_importo ? '' : 'senza'}`}>
      {/* L'importo si cambia dove si legge: aprire un modulo per un numero
          solo, moltiplicato per settanta voci, e' il modo di non farlo mai. */}
      <td className="cat-imp">
        <input type="number" value={imp} onChange={(e) => setImp(e.target.value)}
               placeholder="—" aria-label={`Crediti di ${v.nome} nel ${stagione}`} />
        {cambiato && (
          <button className="cat-conferma"
                  onClick={() => atto(salvaImportoVoce(v.id, stagione, imp))}>salva</button>
        )}
      </td>
      <td className="cat-nome">
        {v.nome}
        {v.descrizione && <span>{v.descrizione}</span>}
        {/* Quante volte e' stata usata, contato dai movimenti. Se e' zero
            ovunque, e' una voce che esiste e non e' mai servita: saperlo aiuta
            a capire se tenerla. */}
        <small>
          {v.usata_qui > 0
            ? `${v.usata_qui} volte nel ${stagione}`
            : `mai nel ${stagione}`}
          {v.usata_sempre > 0 && ` · ${v.usata_sempre} in tutto (${v.stagioni_usata})`}
        </small>
      </td>
      <td className="cat-azioni">
        <button onClick={modificaVoce}>modifica</button>
        <button onClick={() => atto(ritiraVoce(v.id, !v.attiva))}>
          {v.attiva ? 'metti da parte' : 'rimetti in uso'}
        </button>
      </td>
    </tr>
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
          <em>Non cambia mai: è così che si conta quante volte è successo.</em>
        </label>
      </div>
      <label className="cat-descr">
        Cosa vuol dire <span className="cat-facolt">facoltativo</span>
        <input value={v.descrizione ?? ''}
               onChange={(e) => set({ ...v, descrizione: e.target.value })}
               placeholder="quando la formazione non arriva entro l’orario" />
        <em>
          Serve a chi la leggerà fra un anno. Quante volte è stata usata non si scrive qui:
          lo conta il sistema.
        </em>
      </label>
      <div className="cat-bottoni">
        <button className="cat-ok" onClick={salva} disabled={!String(v.nome).trim()}>
          {v.id ? 'Salva' : 'Aggiungi'}
        </button>
        {!v.id && (
          <span className="cat-poi">Poi le darai un importo per questa stagione.</span>
        )}
      </div>
    </div>
  )
}
