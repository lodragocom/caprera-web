import { useDeferredValue, useMemo, useState } from 'react'
import {
  useArchivio, rosa as rosaDi, momentiDelleRose, passaggiDi,
} from '../lib/archivio'
import { Sezione } from './moto'
import { Barra, Campo, Cerca, Gruppo, Schede, Scheda, Conto, Avviso } from './Filtri'
import './RosaSocieta.css'

/**
 * La rosa di una societa', uguale ovunque.
 *
 * Prima esistevano due rose diverse: quella pubblica nella scheda societa',
 * che mostrava solo maggio, e quella dell'area personale, che sapeva anche di
 * settembre e del mercato. Due schermate per la stessa domanda, e solo una
 * delle due diceva la verita' intera. Adesso e' una sola, e la usano tutte e
 * dieci le societa'.
 *
 * Quello che cambia fra pubblico e privato non e' il disegno: sono i crediti.
 * Qui non ne passa nessuno - il bilancio resta dei mister, come e' sempre
 * stato. Passano i nomi, i momenti e le uscite, che sono fatti di campo.
 */
const RUOLI = [['tutti', 'Tutti'], ['P', 'P'], ['D', 'D'], ['C', 'C'], ['A', 'A']]

const COLONNE = [
  { k: 'costo', t: 'Costo', lungo: 'i costi' },
  { k: 'presenze', t: 'Pres.', lungo: 'le presenze' },
  { k: 'mv', t: 'MV', dec: 2, lungo: 'la media voto' },
  { k: 'fm', t: 'FM', dec: 2, lungo: 'la fantamedia' },
]

const TIPO = {
  svincolo: 'svincolo',
  scambio: 'scambio',
  clausola: 'clausola',
  uscita: 'uscita',
}

export default function RosaSocieta({ teamId, stagioni, stagioneIniziale, compatta = false }) {
  const [scelta, setScelta] = useState('')
  const [momento, setMomento] = useState('fine')
  const [ruolo, setRuolo] = useState('tutti')
  const [q, setQ] = useState('')
  const [ordine, setOrdine] = useState(null)
  const cerca = useDeferredValue(q)

  const anni = useMemo(
    () => [...new Set(stagioni ?? [])].sort().reverse(),
    [stagioni]
  )
  const stagione = scelta && anni.includes(scelta)
    ? scelta
    : (stagioneIniziale && anni.includes(stagioneIniziale) ? stagioneIniziale : anni[0])

  /* Quali stagioni hanno la rosa di settembre, e quali di quelle sono
     ricostruite invece che trascritte. Lo dice l'archivio, non una costante. */
  const mo = useArchivio('momentiDelleRose', momentiDelleRose)
  const conPartenza = mo.dati?.partenza ?? []
  const ricostruite = mo.dati?.ricostruite ?? []
  const duePunti = conPartenza.includes(stagione)
  const vista = duePunti ? momento : 'fine'

  const stato = useArchivio(['rosa', stagione, teamId, vista],
    () => (stagione ? rosaDi(stagione, teamId, vista) : Promise.resolve([])),
    [stagione, teamId, vista])

  /* L'altro momento, per dire in una riga quanti sono usciti e quanti
     arrivati. Non e' un dettaglio: e' la sola cosa che le due rose sanno
     dire insieme e nessuna delle due da sola. */
  const altro = useArchivio(['rosa', stagione, teamId, duePunti ? 'altro' : 'no'],
    () => (duePunti ? rosaDi(stagione, teamId, vista === 'fine' ? 'partenza' : 'fine')
                    : Promise.resolve([])),
    [stagione, teamId, duePunti, vista])

  const pa = useArchivio(['passaggi', teamId], () => passaggiDi(teamId), [teamId])
  const usciti = useMemo(
    () => (pa.dati ?? []).filter((p) => p.stagione === stagione),
    [pa.dati, stagione]
  )

  const tutte = stato.dati ?? []

  const mercato = useMemo(() => {
    if (!duePunti) return null
    const qui = new Set(tutte.map((p) => p.calciatore).filter(Boolean))
    const la = new Set((altro.dati ?? []).map((p) => p.calciatore).filter(Boolean))
    if (!la.size) return null
    const soloQui = [...qui].filter((x) => !la.has(x)).length
    const soloLa = [...la].filter((x) => !qui.has(x)).length
    return vista === 'fine'
      ? { arrivati: soloQui, partiti: soloLa }
      : { arrivati: soloLa, partiti: soloQui }
  }, [duePunti, tutte, altro.dati, vista])

  const righe = useMemo(() => {
    const n = cerca.trim().toLowerCase()
    const f = tutte.filter((p) =>
      (ruolo === 'tutti' || p.ruolo === ruolo)
      && (!n || p.nome.toLowerCase().includes(n) || (p.club ?? '').toLowerCase().includes(n)))
    if (!ordine) {
      return [...f].sort((a, b) =>
        'PDCA'.indexOf(a.ruolo) - 'PDCA'.indexOf(b.ruolo) || (b.costo ?? 0) - (a.costo ?? 0))
    }
    const { k, giu } = ordine
    return [...f].sort((a, b) => {
      const x = a[k] == null ? -Infinity : Number(a[k])
      const y = b[k] == null ? -Infinity : Number(b[k])
      return giu ? y - x : x - y
    })
  }, [tutte, ruolo, cerca, ordine])

  const riepilogo = useMemo(() => {
    const perRuolo = { P: 0, D: 0, C: 0, A: 0 }
    let spesi = 0; let somma = 0; let quanti = 0; let conCosto = 0
    for (const p of tutte) {
      perRuolo[p.ruolo] = (perRuolo[p.ruolo] ?? 0) + 1
      if (p.costo != null) { spesi += p.costo; conCosto += 1 }
      if (p.fm != null) { somma += Number(p.fm); quanti += 1 }
    }
    return { perRuolo, spesi, conCosto, quanti: tutte.length,
             fmMedia: quanti ? (somma / quanti).toFixed(2) : null }
  }, [tutte])

  const colonne = useMemo(
    () => COLONNE.filter((c) => tutte.some((p) => p[c.k] != null)),
    [tutte]
  )
  const mancanti = COLONNE.filter((c) => !colonne.includes(c))
  const dedotta = tutte.some((p) => p.fonte === 'campo') || ricostruite.includes(stagione)

  const cambia = (k) => setOrdine((o) =>
    o?.k !== k ? { k, giu: true } : o.giu ? { k, giu: false } : null)

  if (!anni.length) return null

  return (
    <div className="rs">
      <Barra>
        <Campo etichetta="Stagione">
          <select value={stagione} onChange={(e) => setScelta(e.target.value)}>
            {anni.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Campo>
        {duePunti && (
          <Gruppo etichetta="Momento della rosa" ora={vista} scegli={setMomento}
                  voci={[['partenza', 'Settembre'], ['fine', 'Maggio']]} />
        )}
        <Cerca valore={q} cambia={setQ} />
        <Gruppo etichetta="Ruolo" ora={ruolo} scegli={setRuolo}
                voci={RUOLI.map(([v, l]) =>
                  (v === 'tutti' ? [v, l] : [v, l, riepilogo.perRuolo[v] ?? 0]))} />
      </Barra>

      <Schede>
        <Scheda etichetta="Calciatori" valore={riepilogo.quanti}
                sotto={`${riepilogo.perRuolo.P}-${riepilogo.perRuolo.D}-${riepilogo.perRuolo.C}-${riepilogo.perRuolo.A}`} />
        {riepilogo.conCosto > 0 && (
          <Scheda etichetta={vista === 'partenza' ? 'Speso all’asta' : 'Valore rosa'}
                  valore={riepilogo.spesi} sotto="crediti" />
        )}
        {riepilogo.fmMedia && <Scheda etichetta="Fantamedia" valore={riepilogo.fmMedia} sotto="media rosa" />}
        {mercato && <Scheda etichetta="Mercato" valore={`+${mercato.arrivati} / −${mercato.partiti}`}
                            sotto="arrivati e partiti" />}
        {usciti.length > 0 && <Scheda etichetta="Uscite registrate" valore={usciti.length}
                                      sotto="nella tabella passaggi" />}
      </Schede>

      {dedotta && (
        <Avviso>
          Questa rosa di settembre non viene da un documento: è <b>ricostruita dalle
          formazioni</b>, e vale circa tre nomi su quattro. Il numero non è una stima —
          sul 2020-21, dove poi è saltato fuori il file vero, la ricostruzione aveva
          azzeccato 234 nomi su 299. Il costo d’asta di quegli anni non c’è.
        </Avviso>
      )}

      <Conto>{righe.length} calciatori{ruolo !== 'tutti' || cerca ? ' sui filtri scelti' : ''}</Conto>

      <Sezione stato={stato} righe={10} vuoto="Nessuna rosa registrata.">
        <div className="rs-tabella">
          <table>
            <thead>
              <tr>
                <th className="c-r">R</th>
                <th className="c-nome">Calciatore</th>
                <th className="c-club">Club</th>
                {colonne.map((c) => (
                  <th key={c.k} className="num">
                    <button type="button" className={`ord ${ordine?.k === c.k ? 'on' : ''}`}
                            onClick={() => cambia(c.k)}>
                      {c.t}{ordine?.k === c.k && <i>{ordine.giu ? '▾' : '▴'}</i>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {righe.map((p, i) => (
                <tr key={i}>
                  <td className="c-r"><span className={`badge role-${p.ruolo}`}>{p.ruolo}</span></td>
                  <td className="c-nome">{p.nome}</td>
                  <td className="c-club">{p.club ?? '—'}</td>
                  {colonne.map((c) => (
                    <td key={c.k} className={`num ${ordine?.k === c.k ? 'in-ordine' : ''}`}>
                      {p[c.k] == null ? '—' : c.dec ? Number(p[c.k]).toFixed(c.dec) : p[c.k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mancanti.length > 0 && (
          <p className="rs-nota">
            Per il {stagione} l’archivio non ha {elenco(mancanti.map((c) => c.lungo))}:
            {' '}le colonne compaiono quando arrivano i dati.
          </p>
        )}
      </Sezione>

      {!compatta && <UsciteSocieta teamId={teamId} stagione={stagione} />}
    </div>
  )
}


/** "a, b e c" — perche' "a, b, c" in una frase italiana suona un elenco della spesa. */
function elenco(voci) {
  if (voci.length <= 1) return voci[0] ?? ''
  return `${voci.slice(0, -1).join(', ')} e ${voci[voci.length - 1]}`
}

/**
 * Chi ha lasciato una societa' in una stagione.
 *
 * Sta qui e non dentro la rosa perche' lo usano tutte e due le parti del
 * sito: la scheda pubblica della societa' e l'area del mister. Il registro
 * dei crediti dice quanto e' costato; questa dice dov'e' finito.
 *
 * La marca che conta e' `certezza`, e va letta prima dei nomi: non tutto
 * quello che sappiamo lo sappiamo allo stesso modo, e chi legge ha il
 * diritto di saperlo senza doverlo dedurre.
 */
export function UsciteSocieta({ teamId, stagione }) {
  const pa = useArchivio(['passaggi', teamId], () => passaggiDi(teamId), [teamId])
  const usciti = useMemo(
    () => (pa.dati ?? []).filter((p) => p.stagione === stagione),
    [pa.dati, stagione]
  )
  if (!usciti.length) return null
  return (
    <section className="rs-usciti block">
      <h3>Chi ha lasciato la società nel {stagione}</h3>
      <p className="rs-nota">
        La marca che conta è come si sa. <b>Documento</b> vuol dire contratto firmato e
        depositato in segreteria; <b>foglio</b> vuol dire scritto nel foglio delle rose;
        <b> campo</b> vuol dire che non l’ha scritto nessuno e lo dicono le formazioni,
        cioè un indizio, non una registrazione.
      </p>
      <ul className="rs-lista">
        {usciti.map((u, i) => (
          <li key={`${u.nome}-${i}`}>
            <span className="rs-chi">{u.nome}</span>
            <span className={`rs-tipo t-${u.tipo}`}>{TIPO[u.tipo] ?? u.tipo}</span>
            {u.a && <span className="rs-dove">{"\u2192 "}{u.a}</span>}
            <span className={`rs-cert c-${u.certezza}`}>{u.certezza}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
