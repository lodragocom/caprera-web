import { useDeferredValue, useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import { getTeam } from '../lib/core'
import { useArchivio, roseStagione, stagioni } from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione, Numero } from '../components/moto'
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
  const [stagione, setStagione] = useState('')
  const scelta = stagione || elenco[0] || ''

  const [ruolo, setRuolo] = useState('')
  const [q, setQ] = useState('')
  const [ordine, setOrdine] = useState('costo')
  const cerca = useDeferredValue(q)

  const stato = useArchivio(['roseStagione', scelta],
    () => (scelta ? roseStagione(scelta) : Promise.resolve([])), [scelta])

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
        <h2 className="section-title">Crediti investiti · {scelta}</h2>
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
          Il bilancio completo — crediti iniziali, scambi, residui, premi e FFP —
          è riservato ai mister e si vede nell'area personale.
        </p>
      </section>

      <section className="block">
        <h2 className="section-title">Tutti i calciatori</h2>

        <div className="controls">
          <div className="field">
            <label htmlFor="ro-stagione">Stagione</label>
            <select id="ro-stagione" value={scelta} onChange={(e) => setStagione(e.target.value)}>
              {elenco.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="field">
            <label htmlFor="ro-q">Cerca</label>
            <input id="ro-q" type="search" placeholder="Calciatore o club…"
                   value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="ro-ordine">Ordina per</label>
            <select id="ro-ordine" value={ordine} onChange={(e) => setOrdine(e.target.value)}>
              <option value="costo">Costo</option>
              <option value="fm">Fantamedia</option>
              <option value="presenze">Presenze</option>
              <option value="nome">Nome</option>
            </select>
          </div>

          <div className="seg role-seg">
            <button aria-pressed={ruolo === ''} onClick={() => setRuolo('')}>Tutti</button>
            {RUOLI.map((r) => (
              <button key={r} aria-pressed={ruolo === r} onClick={() => setRuolo(r)}>{r}</button>
            ))}
          </div>
        </div>

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
