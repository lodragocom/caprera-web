import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ACTIVE_TEAMS, HISTORIC_TEAMS, CURRENT_SEASON, getTeam, logoUrl } from '../lib/core'
import {
  useArchivio, stagioni, competizioni, edizioni, partite, tabellone,
} from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione } from '../components/moto'
import './Risultati.css'

/**
 * Il calendario, letto dal database.
 *
 * Campionato e coppe arrivano dalla stessa tabella `partite` e finiscono nella
 * stessa forma: un elenco di blocchi con un titolo e delle partite. La pagina
 * non sa più distinguere le due cose, ed è giusto così: era la distinzione a
 * generare gli errori.
 *
 * La testa e le schede sono quelle della Classifica — occhiello, titolo
 * grande, stagione in alto a destra, competizioni come linguette invece che
 * come menu a tendina. Sono le due pagine che si guardano una dopo l'altra e
 * avevano due impaginazioni diverse.
 *
 * Ogni partita porta al suo tabellino.
 */
export default function Risultati() {
  const [stagione, setStagione] = useState(CURRENT_SEASON)
  const [societa, setSocieta] = useState('')
  const [comp, setComp] = useState('campionato')
  /*
   * `undefined` vuol dire «non ha ancora scelto»: la pagina si apre
   * sull'ultima giornata giocata invece che su tutte e trentasei. Aprire un
   * calendario e trovarsi centottanta partite in fila, con quella di ieri in
   * fondo, e' il contrario di quello che serve. `null` invece e' una scelta:
   * vuol dire «tutte», e la pagina non ci mette becco.
   */
  const [giornata, setGiornata] = useState(undefined)

  const anni = useArchivio('stagioni', stagioni)
  const tutte = useArchivio('competizioni', competizioni)
  const ediz = useArchivio(['edizioni', stagione], () => edizioni(stagione), [stagione])

  /* Le coppe che quella stagione si sono davvero giocate. */
  const coppe = useMemo(() => {
    const nomi = new Map((tutte.dati ?? []).map((c) => [c.id, c]))
    return (ediz.dati ?? [])
      .map((e) => nomi.get(e.competizione))
      .filter((c) => c && c.tipo !== 'campionato' && c.tipo !== 'classifica')
      .sort((a, b) => a.ordine - b.ordine)
  }, [ediz.dati, tutte.dati])

  /* Una coppa può non esistere nella stagione scelta: si torna al campionato. */
  useEffect(() => {
    if (comp !== 'campionato' && ediz.dati && !ediz.dati.some((e) => e.competizione === comp)) {
      setComp('campionato')
    }
  }, [ediz.dati, comp])

  const camp = useArchivio(['partite', stagione, 'campionato'],
    () => partite(stagione, 'campionato'), [stagione])
  const cup = useArchivio(['tabellone', stagione, comp],
    () => (comp === 'campionato' ? Promise.resolve(null) : tabellone(stagione, comp)),
    [stagione, comp])

  const stato = comp === 'campionato' ? camp : cup

  const blocchi = useMemo(() => {
    const mia = (p) => !societa || p.casa === societa || p.fuori === societa
    if (comp !== 'campionato') {
      return (cup.dati?.turni ?? [])
        .map((t) => ({ titolo: t.nome, partite: t.partite.filter(mia) }))
        .filter((t) => t.partite.length)
    }
    const gruppi = new Map()
    for (const p of camp.dati ?? []) {
      if (!mia(p)) continue
      if (giornata != null && p.giornata !== giornata) continue
      if (!gruppi.has(p.giornata)) gruppi.set(p.giornata, [])
      gruppi.get(p.giornata).push(p)
    }
    return [...gruppi.entries()].sort((a, b) => a[0] - b[0])
      .map(([g, righe]) => ({ titolo: `${g}ª giornata`, partite: righe }))
  }, [comp, camp.dati, cup.dati, societa, giornata])

  const quante = useMemo(
    () => Math.max(0, ...(camp.dati ?? []).map((p) => p.giornata ?? 0)),
    [camp.dati]
  )
  const giocate = useMemo(
    () => Math.max(0, ...(camp.dati ?? []).filter((p) => p.giocata !== false)
      .map((p) => p.giornata ?? 0)),
    [camp.dati]
  )

  /* La scelta automatica, una volta sola, quando arrivano i dati. */
  useEffect(() => {
    if (giornata !== undefined) return
    if (!camp.dati?.length) return
    setGiornata(giocate > 0 ? giocate : null)
  }, [camp.dati, giocate, giornata])

  const quantePartite = blocchi.reduce((n, b) => n + b.partite.length, 0)
  const filtrata = Boolean(societa) || giornata != null

  return (
    <Pagina className="page container wide ri">
      <header className="ri-testa">
        <div>
          <p className="eyebrow">
            {comp === 'campionato'
              ? `Campionato · giornata ${giocate} di ${quante || '—'}`
              : coppe.find((c) => c.id === comp)?.nome ?? 'Coppe'}
          </p>
          <h1>Calendario</h1>
        </div>

        <label className="ri-stagione">
          <span>Stagione</span>
          <select value={stagione}
                  onChange={(e) => { setStagione(e.target.value); setGiornata(undefined) }}>
            {(anni.dati ?? []).map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
          </select>
        </label>
      </header>

      <nav className="ri-schede" role="tablist">
        <button role="tab" aria-selected={comp === 'campionato'}
                className={comp === 'campionato' ? 'on' : ''}
                onClick={() => setComp('campionato')}>
          Campionato
        </button>
        {coppe.map((c) => (
          <button key={c.id} role="tab" aria-selected={comp === c.id}
                  className={comp === c.id ? 'on' : ''}
                  onClick={() => { setComp(c.id); setGiornata(undefined) }}>
            {c.nome}
          </button>
        ))}
      </nav>

      <div className="ri-barra">
        <div className="ri-filtri">
          <label>
            <span>Società</span>
            <select value={societa} onChange={(e) => setSocieta(e.target.value)}>
              <option value="">Tutte</option>
              {ACTIVE_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              {HISTORIC_TEAMS.length > 0 && (
                <optgroup label="Non più in attività">
                  {HISTORIC_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </optgroup>
              )}
            </select>
          </label>

          {comp === 'campionato' && quante > 0 && (
            <label>
              <span>Giornata</span>
              <select value={giornata ?? ''}
                      onChange={(e) => setGiornata(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Tutte</option>
                {Array.from({ length: quante }, (_, i) => i + 1).map((r) => (
                  <option key={r} value={r}>{r}ª</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <p className="ri-conto">
          <b>{quantePartite}</b> {quantePartite === 1 ? 'partita' : 'partite'}
          {filtrata && (
            <button type="button" onClick={() => { setSocieta(''); setGiornata(null) }}>
              {/* la giornata di partenza la sceglie la pagina, non il lettore:
                  chiamarla «filtro» da togliere sarebbe scorretto */}
              {societa ? 'Togli i filtri' : 'Tutte le giornate'}
            </button>
          )}
        </p>
      </div>

      <Sezione stato={stato} righe={6} vuoto="Nessuna partita per questi filtri.">
        {blocchi.length === 0
          ? <p className="empty">Nessuna partita per questi filtri.</p>
          : blocchi.map((b) => (
              <section key={b.titolo} className="ri-blocco">
                <h2 className="ri-titolo">
                  <span>{b.titolo}</span>
                  {!b.partite.some((p) => p.giocata !== false) && <em>da giocare</em>}
                </h2>
                <Cascata className="ri-elenco" tetto={12}>
                  {b.partite.map((p, i) => <Voce key={p.id ?? i}><Partita p={p} /></Voce>)}
                </Cascata>
              </section>
            ))}
      </Sezione>

      <p className="note">
        Ogni partita porta al suo tabellino: le due formazioni, il fantavoto di
        ogni giocatore e da dove arrivano i fantapunti.
      </p>
    </Pagina>
  )
}

/**
 * Una partita: una riga, non una scheda.
 *
 * Il nome per intero, mai tagliato: "Real Mon…" e "Sangue…" non dicono chi ha
 * giocato, e una pagina di risultati che nasconde le squadre ha sbagliato
 * mestiere.
 */
function Partita({ p }) {
  // nelle coppe `giocata` non c'è nel select: se manca, è giocata
  const fatta = p.giocata !== false && p.gol_casa != null
  const vinceCasa = fatta && p.gol_casa > p.gol_fuori
  const vinceFuori = fatta && p.gol_fuori > p.gol_casa

  const dentro = (
    <>
      <Squadra id={p.casa} vince={vinceCasa} />
      <div className="ri-punteggio">
        {fatta ? (
          <>
            <strong>{p.gol_casa}<i>–</i>{p.gol_fuori}</strong>
            <span>{Number(p.fp_casa).toFixed(1)} · {Number(p.fp_fuori).toFixed(1)}</span>
          </>
        ) : <span className="ri-vs">vs</span>}
      </div>
      <Squadra id={p.fuori} vince={vinceFuori} fuori />
    </>
  )

  /* Senza id non c'è tabellino da aprire: resta una riga, non un link morto. */
  if (p.id == null) {
    return <article className={`ri-partita ${fatta ? '' : 'da-giocare'}`}>{dentro}</article>
  }

  return (
    <Link to={`/partita/${p.id}`}
          className={`ri-partita ${fatta ? '' : 'da-giocare'}`}
          aria-label="Apri il tabellino">
      {dentro}
      <span className="ri-freccia" aria-hidden="true">›</span>
    </Link>
  )
}

function Squadra({ id, vince, fuori }) {
  const t = getTeam(id)
  if (!t) return <span className="muted">—</span>
  return (
    <span className={`ri-squadra ${fuori ? 'ospite' : ''} ${vince ? 'vince' : ''}`}>
      <img src={logoUrl(t)} alt="" loading="lazy" />
      <span>{t.short}</span>
    </span>
  )
}
