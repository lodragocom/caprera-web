import { useEffect, useMemo, useState } from 'react'
import TeamBadge from '../components/TeamBadge'
import { ACTIVE_TEAMS, HISTORIC_TEAMS, CURRENT_SEASON } from '../lib/core'
import {
  useArchivio, stagioni, competizioni, edizioni, partite, tabellone,
} from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione } from '../components/moto'
import './Risultati.css'

/**
 * Risultati, letti dal database.
 *
 * Campionato e coppe arrivano dalla stessa tabella `partite` e finiscono nella
 * stessa forma: un elenco di blocchi con un titolo e delle partite. La pagina
 * non sa piu' distinguere le due cose, ed e' giusto cosi': era la distinzione
 * a generare gli errori.
 */
export default function Risultati() {
  const [stagione, setStagione] = useState(CURRENT_SEASON)
  const [societa, setSocieta] = useState('')
  const [comp, setComp] = useState('campionato')
  const [giornata, setGiornata] = useState(null)

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

  /* Una coppa puo' non esistere nella stagione scelta: si torna al campionato. */
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

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Calendario</p>
        <h1>Risultati</h1>
        <p className="lede">
          Campionato e coppe, partita per partita. Il punteggio grande è il
          risultato in gol, quello piccolo i fantapunti realizzati.
        </p>
      </header>

      <div className="controls">
        <div className="field">
          <label htmlFor="rs">Stagione</label>
          <select id="rs" value={stagione}
                  onChange={(e) => { setStagione(e.target.value); setGiornata(null) }}>
            {(anni.dati ?? []).map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rc">Competizione</label>
          <select id="rc" value={comp} onChange={(e) => setComp(e.target.value)}>
            <option value="campionato">Campionato</option>
            {coppe.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="rt">Società</label>
          <select id="rt" value={societa} onChange={(e) => setSocieta(e.target.value)}>
            <option value="">Tutte</option>
            {ACTIVE_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            {HISTORIC_TEAMS.length > 0 && (
              <optgroup label="Non più in attività">
                {HISTORIC_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            )}
          </select>
        </div>

        {comp === 'campionato' && quante > 0 && (
          <div className="field">
            <label htmlFor="rr">Giornata</label>
            <select id="rr" value={giornata ?? ''}
                    onChange={(e) => setGiornata(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Tutte</option>
              {Array.from({ length: quante }, (_, i) => i + 1).map((r) => (
                <option key={r} value={r}>{r}ª giornata</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Sezione stato={stato} righe={6} vuoto="Nessuna partita per questi filtri.">
        {blocchi.length === 0
          ? <p className="empty">Nessuna partita per questi filtri.</p>
          : blocchi.map((b) => (
              <section key={b.titolo} className="round-block">
                <h2 className="round-title">
                  <span>{b.titolo}</span>
                  {!b.partite.some((p) => p.giocata !== false) && <em>da giocare</em>}
                </h2>
                <Cascata className="match-grid" tetto={12}>
                  {b.partite.map((p, i) => <Voce key={i}><Partita p={p} /></Voce>)}
                </Cascata>
              </section>
            ))}
      </Sezione>
    </Pagina>
  )
}

function Partita({ p }) {
  // nelle coppe `giocata` non c'e' nel select: se manca, e' giocata
  const fatta = p.giocata !== false && p.gol_casa != null
  const vinceCasa = fatta && p.gol_casa > p.gol_fuori
  const vinceFuori = fatta && p.gol_fuori > p.gol_casa

  return (
    <article className={`match card${fatta ? '' : ' pending'}`}>
      <div className={`side${vinceCasa ? ' win' : ''}`}>
        <TeamBadge id={p.casa} size="sm" label="short" />
      </div>
      <div className="score">
        {fatta ? (
          <>
            <strong className="num">
              {p.gol_casa}<span className="sep">–</span>{p.gol_fuori}
            </strong>
            <span className="num fp">
              {Number(p.fp_casa).toFixed(1)} · {Number(p.fp_fuori).toFixed(1)}
            </span>
          </>
        ) : <span className="num tbd">vs</span>}
      </div>
      <div className={`side away${vinceFuori ? ' win' : ''}`}>
        <TeamBadge id={p.fuori} size="sm" label="short" />
      </div>
    </article>
  )
}
