import { useMemo, useState, useDeferredValue } from 'react'
import { Link } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { teamName } from '../lib/core'
import { useArchivio, tutteLeRose } from '../lib/archivio'
import { Pagina } from '../components/moto'
import { Barra, Campo, Cerca, Gruppo, Schede, Scheda, Conto, Avviso } from '../components/Filtri'
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
      player: r.nome, id: null, roles: new Set(), teams: new Set(),
      seasons: [], spent: 0, apps: 0, fmSum: 0, fmN: 0, best: null, club: null,
    }
    /* L'id serve per la scheda. Sessantatre nomi su 1.136 non sono mai stati
       agganciati a un calciatore dell'archivio: quelli restano righe senza
       scheda, e sotto la tabella c'e' scritto quanti sono. */
    if (cur.id === null && r.calciatore != null) cur.id = r.calciatore
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

/* Oltre questo non si disegna: quattromila righe in una tabella sola non le
   legge nessuno, e il browser le disegna lo stesso. */
const TETTO = 400

const ORDINAMENTI = {
  spent: (a, b) => b.spent - a.spent,
  best: (a, b) => b.best - a.best,
  seasons: (a, b) => b.seasons.length - a.seasons.length,
  fm: (a, b) => (b.fm ?? -1) - (a.fm ?? -1),
  apps: (a, b) => b.apps - a.apps,
  player: (a, b) => a.player.localeCompare(b.player),
}

/**
 * Il calciatore o il suo club.
 *
 * I club in archivio sono sigle di tre lettere — JUV, INT, ROM — perché così
 * arrivano da Fantapazz. Chi cerca però scrive "juve" o "inter", e con il solo
 * `includes` non trovava niente: la sigla è più corta della parola cercata.
 * Qui si guarda anche il contrario, se la sigla è l'inizio di quello che hai
 * scritto. "juve" trova JUV, "inter" trova INT, "roma" trova ROM.
 */
function combacia(p, cercato) {
  if (p.player.toLowerCase().includes(cercato)) return true
  const club = (p.club ?? '').toLowerCase()
  if (!club) return false
  return club.includes(cercato) || cercato.startsWith(club)
}

/** Un'intestazione che ordina. Stessa cosa del menu a tendina, a portata di dito. */
function Ord({ k, ora, vai, children }) {
  return (
    <button type="button" className={`ord ${ora === k ? 'on' : ''}`} onClick={() => vai(k)}>
      {children}{ora === k && <i>▾</i>}
    </button>
  )
}

export default function Giocatori() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [sort, setSort] = useState('spent')
  const query = useDeferredValue(q)

  const stato = useArchivio('tutteLeRose', tutteLeRose)
  const indice = useMemo(() => costruisciIndice(stato.dati), [stato.dati])

  /*
   * `trovati` e' quanti ne ha trovati; `righe` sono i primi quattrocento che
   * si mostrano. Prima si contava dopo il taglio, e la pagina diceva sempre
   * "primi 400 di 400" anche quando i calciatori erano milleocentotrentasei:
   * un conteggio che non conta niente.
   */
  const { righe, trovati } = useMemo(() => {
    const norm = query.trim().toLowerCase()
    const filtrati = indice
      .filter(
        (p) =>
          (!role || p.roles.includes(role)) &&
          (!norm || combacia(p, norm))
      )
      .sort(ORDINAMENTI[sort])
    return { righe: filtrati.slice(0, TETTO), trovati: filtrati.length }
  }, [indice, query, role, sort])

  const senzaScheda = useMemo(
    () => indice.filter((p) => p.id == null).length, [indice]
  )

  /* I numeri in testa. Si contano sull'indice intero, non sui filtri: dicono
     quant'e' grande l'archivio, non quanto e' grande la ricerca di adesso -
     quello lo dice gia' la riga del conto. */
  const { perRuolo, totaleSpeso, ilPiuCaro, ilPiuFedele } = useMemo(() => {
    const perRuolo = { P: 0, D: 0, C: 0, A: 0 }
    let totaleSpeso = 0; let caro = null; let fedele = null
    for (const p of indice) {
      if (perRuolo[p.role] != null) perRuolo[p.role] += 1
      totaleSpeso += p.spent
      if (caro === null || p.best > caro.best) caro = p
      if (fedele === null || p.seasons.length > fedele.seasons.length) fedele = p
    }
    return { perRuolo, totaleSpeso, ilPiuCaro: caro, ilPiuFedele: fedele }
  }, [indice])

  return (
    <Pagina className="page container wide gi">
      <header className="page-head">
        <p className="eyebrow">Archivio</p>
        <h1>Giocatori</h1>
        <p className="lede">
          Tutti i {indice.length.toLocaleString('it-IT')} calciatori passati per una
          rosa Caprera dal 2016. Per ognuno: quante stagioni, per quali società,
          quanto è costato in totale e quanto al massimo in una sola asta.
          Il nome porta alla scheda, con gol, assist e carriera stagione per
          stagione.
        </p>
      </header>

      <Barra>
        <Cerca valore={q} cambia={setQ} />
        <Campo etichetta="Ordina per">
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="spent">Costo totale</option>
            <option value="best">Acquisto più caro</option>
            <option value="seasons">Stagioni</option>
            <option value="fm">Fantamedia</option>
            <option value="apps">Presenze</option>
            <option value="player">Nome</option>
          </select>
        </Campo>
        <Gruppo etichetta="Ruolo" ora={role} scegli={setRole}
                voci={[['', 'Tutti'], ...['P', 'D', 'C', 'A'].map((r) => [r, r, perRuolo[r] ?? 0])]} />
      </Barra>

      {/* Il riassunto prima del dettaglio, come nelle rose: quattromila righe
          senza una cifra in testa non dicono di che dimensione e' la cosa che
          stai guardando. */}
      <Schede>
        <Scheda etichetta="Calciatori" valore={indice.length.toLocaleString('it-IT')}
                sotto={`${perRuolo.P}-${perRuolo.D}-${perRuolo.C}-${perRuolo.A}`} />
        <Scheda etichetta="Crediti spesi" valore={totaleSpeso.toLocaleString('it-IT')}
                sotto="in dieci stagioni" />
        <Scheda etichetta="Il più caro" valore={ilPiuCaro?.best ?? '—'}
                sotto={ilPiuCaro?.player} />
        <Scheda etichetta="Con più stagioni" valore={ilPiuFedele?.seasons.length ?? '—'}
                sotto={ilPiuFedele?.player} />
      </Schede>

      <Conto>
        {trovati > TETTO
          ? `primi ${TETTO} di ${trovati.toLocaleString('it-IT')} calciatori`
          : `${trovati.toLocaleString('it-IT')} ${trovati === 1 ? 'calciatore' : 'calciatori'}`}
      </Conto>

      {senzaScheda > 0 && (
        <Avviso>
          <b>{senzaScheda}</b> {senzaScheda === 1 ? 'nome non è agganciato' : 'nomi non sono agganciati'}
          {' '}a un calciatore dell'archivio e {senzaScheda === 1 ? 'non ha' : 'non hanno'} la
          scheda: {senzaScheda === 1 ? 'compare' : 'compaiono'} in tabella senza il collegamento.
        </Avviso>
      )}

      <div className="table-wrap tall">
        <table>
          <thead>
            <tr>
              <th className="left">R</th>
              <th className="left"><Ord k="player" ora={sort} vai={setSort}>Calciatore</Ord></th>
              <th><Ord k="seasons" ora={sort} vai={setSort}>St.</Ord></th>
              <th className="left">Società</th>
              <th><Ord k="spent" ora={sort} vai={setSort}>Speso</Ord></th>
              <th><Ord k="best" ora={sort} vai={setSort}>Max</Ord></th>
              <th><Ord k="apps" ora={sort} vai={setSort}>Pres.</Ord></th>
              <th><Ord k="fm" ora={sort} vai={setSort}>FM</Ord></th>
            </tr>
          </thead>
          <tbody>
            {righe.map((p) => (
              <tr key={p.player}>
                <td className="left">
                  <span className={`badge role-${p.role}`}>{p.roles.join('')}</span>
                </td>
                <td className="left strong">
                  {p.id != null
                    ? <Link to={`/giocatori/${p.id}`} className="gi-nome">{p.player}</Link>
                    : <span title="Nome non agganciato a un calciatore dell'archivio">
                        {p.player}
                      </span>}
                </td>
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
