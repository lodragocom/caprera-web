import { useDeferredValue, useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import { getTeam } from '../lib/core'
import { useArchivio, roseStagione, stagioni, momentiDelleRose } from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione, Numero } from '../components/moto'
import { Barra, Campo, Cerca, Gruppo } from '../components/Filtri'
import './Rose.css'

const RUOLI = ['P', 'D', 'C', 'A']

/**
 * Rose e crediti investiti, dal database.
 *
 * Il bilancio crediti che stava qui e' sparito dalla pagina pubblica, e non
 * per dimenticanza: nel database le finanze sono riservate ai mister e alla
 * Presidenza. Prima viaggiavano dentro il pacchetto che il browser scaricava,
 * cioe' erano pubbliche pur sembrando private. Adesso stanno nell'area
 * riservata, dove chiunque le legga ha diritto di leggerle.
 */
export default function Rose() {
  const anni = useArchivio('stagioni', stagioni)
  const elenco = (anni.dati ?? []).map((s) => s.id)
  /* Il menu le elenca tutte, anche quella che deve ancora cominciare - il
     budget del prossimo anno esiste prima dell'asta. Ma la pagina non ci si
     apre sopra: si apre sull'ultima **giocata**, se no il primo che arriva
     trova dieci rose vuote e pensa che l'archivio sia rotto. */
  const ultimaGiocata = (anni.dati ?? []).find((s) => s.conclusa)?.id
  const [stagione, setStagione] = useState('')
  const scelta = stagione || ultimaGiocata || elenco[0] || ''

  const [ruolo, setRuolo] = useState('')
  const [q, setQ] = useState('')
  const [ordine, setOrdine] = useState('costo')
  const cerca = useDeferredValue(q)

  /*
   * Settembre o maggio.
   *
   * Sono due rose diverse e la differenza e' il mercato: chi manca a maggio
   * se n'e' andato, chi compare solo a maggio e' arrivato dopo. Da sola
   * nessuna delle due lo dice, e per anni il sito ha mostrato solo maggio -
   * cioe' la rosa che contiene gli arrivi di gennaio e non contiene le
   * partenze, senza avvertire che era cosi'.
   */
  const [momento, setMomento] = useState('fine')
  const mo = useArchivio('momentiDelleRose', momentiDelleRose)
  const conPartenza = mo.dati?.partenza ?? []
  const ricostruite = mo.dati?.ricostruite ?? []
  const duePunti = conPartenza.includes(scelta)
  const vista = duePunti ? momento : 'fine'
  const dedotta = vista === 'partenza' && ricostruite.includes(scelta)

  const stato = useArchivio(['roseStagione', scelta, vista],
    () => (scelta ? roseStagione(scelta, vista) : Promise.resolve([])), [scelta, vista])

  const righe = useMemo(() => {
    const n = cerca.trim().toLowerCase()
    const out = (stato.dati ?? []).filter((r) =>
      (!ruolo || r.ruolo === ruolo)
      && (!n || r.nome.toLowerCase().includes(n) || (r.club ?? '').toLowerCase().includes(n)))
    const come = {
      costo: (a, b) => (b.costo ?? 0) - (a.costo ?? 0),
      fm: (a, b) => (b.fm ?? -1) - (a.fm ?? -1),
      presenze: (a, b) => (b.presenze ?? -1) - (a.presenze ?? -1),
      nome: (a, b) => a.nome.localeCompare(b.nome),
    }[ordine]
    return [...out].sort(come)
  }, [stato.dati, ruolo, cerca, ordine])

  /* Quanto ha investito ogni societa': si conta qui, sono trecento righe. */
  const investito = useMemo(() => {
    const acc = new Map()
    for (const r of stato.dati ?? []) {
      const c = acc.get(r.societa) ?? { societa: r.societa, spesi: 0, quanti: 0 }
      c.spesi += r.costo ?? 0
      c.quanti += 1
      acc.set(r.societa, c)
    }
    return [...acc.values()].sort((a, b) => b.spesi - a.spesi)
  }, [stato.dati])

  const massimo = Math.max(1, ...investito.map((b) => b.spesi))

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Mercato</p>
        <h1>Rose e crediti</h1>
        <p className="lede">
          Ogni rosa vale 6-9-9-7 e si costruisce con 250 crediti più 3 per gli Under.
          Qui trovi chi ha comprato chi, a quanto, e come è andata.
        </p>
      </header>

      <section className="block">
        <h2 className="section-title">
          {vista === 'partenza'
            ? `Crediti investiti all'asta · ${scelta}`
            : `Valore delle rose a maggio · ${scelta}`}
        </h2>
        <Sezione stato={stato} righe={10}>
          <Cascata className="budget-list" tetto={12}>
            {investito.map((b) => (
              <Voce key={b.societa} className="budget">
                <TeamBadge id={b.societa} size="sm" />
                <div className="bar">
                  <span style={{
                    width: `${(b.spesi / massimo) * 100}%`,
                    background: getTeam(b.societa)?.color,
                  }} />
                </div>
                <span className="num spent"><Numero valore={b.spesi} /></span>
                <span className="num size muted">{b.quanti} cal.</span>
              </Voce>
            ))}
          </Cascata>
        </Sezione>
        <p className="note">
          {vista === 'partenza'
            ? `Questa è la somma dei prezzi d'asta di settembre, e combacia con la voce
               «spesi all'asta» del bilancio: verificata su tutte e dieci le società
               nelle sei stagioni in cui il bilancio esiste.`
            : `Attenzione: a maggio la somma non è quello che è stato speso. Contiene chi
               è arrivato a gennaio e non contiene chi è uscito. Per i crediti investiti
               scegli «settembre».`}
          {' '}Il bilancio completo — crediti iniziali, scambi, residui, premi e FFP —
          è riservato ai mister e si vede nell'area personale.
        </p>
      </section>

      <section className="block">
        <h2 className="section-title">Tutti i calciatori</h2>

        <Barra>
          <Campo etichetta="Stagione">
            <select value={scelta} onChange={(e) => setStagione(e.target.value)}>
              {elenco.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Campo>
          {duePunti && (
            <Gruppo etichetta="Momento della rosa" ora={vista} scegli={setMomento}
                    voci={[['partenza', 'Settembre'], ['fine', 'Maggio']]} />
          )}
          <Cerca valore={q} cambia={setQ} />
          <Campo etichetta="Ordina per">
            <select value={ordine} onChange={(e) => setOrdine(e.target.value)}>
              <option value="costo">Costo</option>
              <option value="fm">Fantamedia</option>
              <option value="presenze">Presenze</option>
              <option value="nome">Nome</option>
            </select>
          </Campo>
          <Gruppo etichetta="Ruolo" ora={ruolo} scegli={setRuolo}
                  voci={[['', 'Tutti'], ...RUOLI.map((r) => [r, r])]} />
        </Barra>

        {dedotta && (
          <p className="note">
            La rosa di settembre del {scelta} non viene da un documento: è
            <b> ricostruita dalle formazioni</b>, e vale circa tre nomi su quattro.
            Non è una stima — sul 2020-21, dove poi è saltato fuori il file vero, la
            ricostruzione aveva azzeccato 234 nomi su 299. Il costo d'asta di quegli
            anni non c'è.
          </p>
        )}

        <p className="result-count num">{righe.length} calciatori</p>

        <Sezione stato={stato} righe={12} vuoto="Nessun risultato.">
          {righe.length === 0 ? <p className="empty">Nessun risultato.</p> : (
            <div className="table-wrap tall">
              <table>
                <thead>
                  <tr>
                    <th className="left">R</th><th className="left">Calciatore</th>
                    <th className="left">Club</th><th className="left">Società</th>
                    <th>Costo</th><th>Pres.</th><th>MV</th><th>FM</th>
                  </tr>
                </thead>
                <tbody>
                  {righe.map((p, i) => (
                    <tr key={i}>
                      <td className="left"><span className={`badge role-${p.ruolo}`}>{p.ruolo}</span></td>
                      <td className="left strong">{p.nome}</td>
                      <td className="left muted num club">{p.club ?? '—'}</td>
                      <td className="left"><TeamBadge id={p.societa} size="sm" /></td>
                      <td className="num">{p.costo ?? '—'}</td>
                      <td className="num muted">{p.presenze ?? '—'}</td>
                      <td className="num muted">{p.mv != null ? Number(p.mv).toFixed(2) : '—'}</td>
                      <td className="num">{p.fm != null ? Number(p.fm).toFixed(2) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Sezione>
      </section>
    </Pagina>
  )
}
