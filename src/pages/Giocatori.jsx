import { useMemo, useState, useDeferredValue } from 'react'
import TeamBadge from '../components/TeamBadge'
import { teamName } from '../lib/core'
import { useArchivio, tutteLeRose } from '../lib/archivio'
import { Pagina, Sezione } from '../components/moto'
import './Giocatori.css'

const ROLE_ORDER = { P: 0, D: 1, C: 2, A: 3 }

/**
 * Indice dei calciatori: una riga per calciatore, aggregando tutte le
 * stagioni in cui è comparso in una rosa Caprera.
 */
/**
 * Costruisce l'indice a partire dalle righe di rosa lette dal database.
 *
 * Prima era un blocco che girava una volta sola al caricamento del sito,
 * perche' i dati erano gia' li' dentro. Adesso arrivano dalla rete, quindi
 * l'indice si costruisce quando arrivano - e per questo e' una funzione.
 */
function costruisciIndice(righe) {
  const acc = new Map()
  for (const r of righe ?? []) {
    const cur = acc.get(r.nome) ?? {
      player: r.nome, roles: new Set(), teams: new Set(),
      seasons: [], spent: 0, apps: 0, fmSum: 0, fmN: 0, best: null, club: null,
    }
    cur.roles.add(r.ruolo)
    cur.teams.add(r.societa)
    cur.seasons.push(r.stagione)
    cur.spent += r.costo ?? 0
    cur.apps += r.presenze ?? 0
    if (r.fm != null) { cur.fmSum += Number(r.fm); cur.fmN += 1 }
    if (cur.best === null || (r.costo ?? 0) > cur.best) cur.best = r.costo ?? 0
    if (r.club) cur.club = r.club
    acc.set(r.nome, cur)
  }
  return [...acc.values()].map((p) => ({
    ...p,
    role: [...p.roles].sort((a, b) => ROLE_ORDER[a] - ROLE_ORDER[b])[0],
    roles: [...p.roles],
    teams: [...p.teams],
    seasons: [...new Set(p.seasons)].sort(),
    fm: p.fmN ? +(p.fmSum / p.fmN).toFixed(2) : null,
  }))
}

const ORDINAMENTI = {
  spent: (a, b) => b.spent - a.spent,
  best: (a, b) => b.best - a.best,
  seasons: (a, b) => b.seasons.length - a.seasons.length,
  fm: (a, b) => (b.fm ?? -1) - (a.fm ?? -1),
  apps: (a, b) => b.apps - a.apps,
  player: (a, b) => a.player.localeCompare(b.player),
}

export default function Giocatori() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [sort, setSort] = useState('spent')
  const query = useDeferredValue(q)

  const stato = useArchivio('tutteLeRose', tutteLeRose)
  const indice = useMemo(() => costruisciIndice(stato.dati), [stato.dati])

  const righe = useMemo(() => {
    const norm = query.trim().toLowerCase()
    return indice
      .filter(
        (p) =>
          (!role || p.roles.includes(role)) &&
          (!norm ||
            p.player.toLowerCase().includes(norm) ||
            (p.club ?? '').toLowerCase().includes(norm))
      )
      .sort(ORDINAMENTI[sort])
      .slice(0, 400)
  }, [indice, query, role, sort])

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Archivio</p>
        <h1>Giocatori</h1>
        <p className="lede">
          Tutti i {indice.length.toLocaleString('it-IT')} calciatori passati per una
          rosa Caprera dal 2016. Per ognuno: quante stagioni, per quali società,
          quanto è costato in totale e quanto al massimo in una sola asta.
        </p>
      </header>

      <div className="controls">
        <div className="field">
          <label htmlFor="gi-q">Cerca</label>
          <input
            id="gi-q"
            type="search"
            placeholder="Calciatore o club…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="gi-sort">Ordina per</label>
          <select id="gi-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="spent">Costo totale</option>
            <option value="best">Acquisto più caro</option>
            <option value="seasons">Stagioni</option>
            <option value="fm">Fantamedia</option>
            <option value="apps">Presenze</option>
            <option value="player">Nome</option>
          </select>
        </div>
        <div className="seg">
          <button aria-pressed={role === ''} onClick={() => setRole('')}>Tutti</button>
          {['P', 'D', 'C', 'A'].map((r) => (
            <button key={r} aria-pressed={role === r} onClick={() => setRole(r)}>{r}</button>
          ))}
        </div>
      </div>

      <p className="result-count num">
        {righe.length === 400 ? 'primi 400 di ' : ''}
        {righe.length} calciatori
      </p>

      <div className="table-wrap tall">
        <table>
          <thead>
            <tr>
              <th className="left">R</th>
              <th className="left">Calciatore</th>
              <th>St.</th>
              <th className="left">Società</th>
              <th>Speso</th>
              <th>Max</th>
              <th>Pres.</th>
              <th>FM</th>
            </tr>
          </thead>
          <tbody>
            {righe.map((p) => (
              <tr key={p.player}>
                <td className="left">
                  <span className={`badge role-${p.role}`}>{p.roles.join('')}</span>
                </td>
                <td className="left strong">{p.player}</td>
                <td className="num muted" title={p.seasons.join(', ')}>
                  {p.seasons.length}
                </td>
                <td className="left">
                  <span className="squadre">
                    {p.teams.slice(0, 4).map((t) => (
                      <TeamBadge key={t} id={t} size="sm" label="code" />
                    ))}
                    {p.teams.length > 4 && (
                      <em className="piu" title={p.teams.map(teamName).join(', ')}>
                        +{p.teams.length - 4}
                      </em>
                    )}
                  </span>
                </td>
                <td className="num strong">{p.spent}</td>
                <td className="num muted">{p.best}</td>
                <td className="num muted">{p.apps || '—'}</td>
                <td className="num">{p.fm ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Pagina>
  )
}
