import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam } from '../../lib/core'
import { diarioLega, salvaVoceDiario, chiudiVoceDiario } from '../../lib/archivio'
import { Pagina } from '../../components/moto'
import './Diario.css'

/**
 * Il diario della Federazione.
 *
 * Le cose da fare, le decisioni prese, i referendum da indire e le note che
 * fra sei mesi spiegheranno perché si è scelto così. Finora vivevano su
 * WhatsApp e nella testa della Presidenza — che è lo stesso posto, e non è
 * un posto.
 *
 * Gli **eventi** non li scrive nessuno: li scrive il sistema. Quando un
 * mister si registra compare qui da solo, e parte anche un'email. Prima non
 * lo sapeva nessuno: il trigger attivava la tessera e tirava dritto.
 */

const TIPI = [
  { id: 'task', nome: 'Da fare', icona: '☐' },
  { id: 'referendum', nome: 'Referendum', icona: '☰' },
  { id: 'nota', nome: 'Nota', icona: '✎' },
  { id: 'evento', nome: 'Successo', icona: '◈' },
]

const SOCIETA = ['armata-rossa', 'aston-ville', 'disperata', 'prosecco', 'real-monghi',
  'roburro', 'sanguemisto', 'smit', 'sporting-mangiapreti', 'subbuteo']

const VUOTA = { id: null, tipo: 'task', titolo: '', testo: '', scadenza: '', societa: '' }

export default function Diario() {
  const { vedeTutto } = useAuth()
  const [righe, setRighe] = useState(null)
  const [stato, setStato] = useState('aperto')
  const [errore, setErrore] = useState(null)
  const [esito, setEsito] = useState(null)
  const [modifica, setModifica] = useState(null)

  const carica = useCallback(() => {
    diarioLega(stato).then(setRighe).catch((e) => setErrore(e.message))
  }, [stato])
  useEffect(carica, [carica])

  async function atto(promessa) {
    setErrore(null); setEsito(null)
    try { setEsito(await promessa); setModifica(null); carica() }
    catch (e) { setErrore(e.message) }
  }

  const conto = useMemo(() => {
    const c = { task: 0, referendum: 0, nota: 0, evento: 0, scadute: 0 }
    for (const r of righe ?? []) {
      c[r.tipo] = (c[r.tipo] ?? 0) + 1
      if (r.scaduto) c.scadute++
    }
    return c
  }, [righe])

  if (!vedeTutto) {
    return (
      <Pagina className="dia">
        <h1>Diario</h1>
        <p className="dia-nota">Questa sezione è di chi ha un incarico di governo.</p>
      </Pagina>
    )
  }

  return (
    <Pagina className="dia">
      <h1>Diario</h1>
      <p className="dia-nota">
        Cose da fare, referendum, note. E quello che succede: quando un mister si registra,
        <strong> compare qui da solo</strong> e parte un’email.
      </p>

      {errore && <p className="dia-errore">{errore}</p>}
      {esito && <p className="dia-esito">{esito}</p>}

      {conto.scadute > 0 && (
        <p className="dia-scadute">
          <strong>{conto.scadute === 1 ? 'Una cosa è scaduta' : `${conto.scadute} cose sono scadute`}.</strong>{' '}
          Stanno in cima.
        </p>
      )}

      <div className="dia-barra">
        <button className="dia-nuovo" onClick={() => setModifica(modifica ? null : { ...VUOTA })}>
          {modifica ? 'Lascia stare' : 'Aggiungi'}
        </button>
        <div className="dia-filtro">
          {[['aperto', 'Aperte'], ['fatto', 'Fatte'], ['archiviato', 'Archiviate'], ['tutti', 'Tutte']]
            .map(([id, nome]) => (
              <button key={id} className={stato === id ? 'sceltA' : ''} onClick={() => setStato(id)}>
                {nome}
              </button>
            ))}
        </div>
      </div>

      {modifica && <Modulo v={modifica} set={setModifica}
                           salva={() => atto(salvaVoceDiario(modifica))} />}

      {!righe && <p className="dia-nota">Sto guardando…</p>}
      {righe && righe.length === 0 && (
        <p className="dia-nota">
          {stato === 'aperto' ? 'Niente in sospeso.' : 'Niente da mostrare.'}
        </p>
      )}

      <div className="dia-lista">
        {(righe ?? []).map((r) => {
          const t = TIPI.find((x) => x.id === r.tipo)
          return (
            <article key={r.id} className={`dia-voce ${r.tipo} ${r.scaduto ? 'scaduta' : ''}`}>
              <div className="dia-icona" title={t?.nome}>{t?.icona}</div>
              <div className="dia-corpo">
                <h2>{r.titolo}</h2>
                {r.testo && <p>{r.testo}</p>}
                <div className="dia-sotto">
                  <span className="dia-tipo">{t?.nome}</span>
                  {r.societa && <span>{getTeam(r.societa).name}</span>}
                  {r.scadenza && (
                    <span className={r.scaduto ? 'giu' : ''}>
                      {/* Un giorno di ritardo detto in giorni si capisce; detto in
                          data va contato a mente ogni volta che si legge. */}
                      {r.scaduto
                        ? `scaduta da ${Math.abs(r.giorni)} ${Math.abs(r.giorni) === 1 ? 'giorno' : 'giorni'}`
                        : r.giorni === 0 ? 'scade oggi'
                        : `fra ${r.giorni} ${r.giorni === 1 ? 'giorno' : 'giorni'}`}
                    </span>
                  )}
                  <span className="dia-quando">
                    {new Date(r.creato).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>
              <div className="dia-azioni">
                {/* Gli eventi non si modificano: sono cose successe, non opinioni. */}
                {r.tipo !== 'evento' && (
                  <button onClick={() => setModifica({
                    ...r, scadenza: r.scadenza ?? '', societa: r.societa ?? '', testo: r.testo ?? '',
                  })}>modifica</button>
                )}
                {r.stato === 'aperto'
                  ? <>
                      <button onClick={() => atto(chiudiVoceDiario(r.id, 'fatto'))}>fatto</button>
                      <button onClick={() => atto(chiudiVoceDiario(r.id, 'archiviato'))}>archivia</button>
                    </>
                  : <button onClick={() => atto(chiudiVoceDiario(r.id, 'aperto'))}>riapri</button>}
              </div>
            </article>
          )
        })}
      </div>
    </Pagina>
  )
}

function Modulo({ v, set, salva }) {
  return (
    <div className="dia-modulo">
      <div className="dia-campi">
        <label>
          Tipo
          <select value={v.tipo} onChange={(e) => set({ ...v, tipo: e.target.value })}>
            {TIPI.filter((t) => t.id !== 'evento')
              .map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
          </select>
        </label>
        <label>
          Scadenza <span className="dia-facolt">facoltativa</span>
          <input type="date" value={v.scadenza ?? ''}
                 onChange={(e) => set({ ...v, scadenza: e.target.value })} />
        </label>
        <label>
          Società <span className="dia-facolt">facoltativa</span>
          <select value={v.societa ?? ''} onChange={(e) => set({ ...v, societa: e.target.value })}>
            <option value="">nessuna in particolare</option>
            {SOCIETA.map((id) => <option key={id} value={id}>{getTeam(id).name}</option>)}
          </select>
        </label>
      </div>
      <label className="dia-largo">
        Cosa
        <input value={v.titolo} onChange={(e) => set({ ...v, titolo: e.target.value })}
               placeholder="Emettere le nove tessere" />
      </label>
      <label className="dia-largo">
        Perché, o cosa serve sapere
        <textarea value={v.testo ?? ''} rows="3"
                  onChange={(e) => set({ ...v, testo: e.target.value })}
                  placeholder="Le altre nove società non hanno ancora un accesso: finché è così, l’area non l’ha mai vista nessuno." />
      </label>
      <button className="dia-ok" onClick={salva} disabled={!String(v.titolo).trim()}>
        {v.id ? 'Salva' : 'Aggiungi'}
      </button>
    </div>
  )
}
