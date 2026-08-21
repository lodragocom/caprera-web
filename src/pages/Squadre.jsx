import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ACTIVE_TEAMS, HISTORIC_TEAMS, logoUrl, getTeam, LAST_PLAYED_SEASON } from '../lib/core'
import {
  useArchivio, classificaPerpetua, bachecaTutti, classifica, forma,
} from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione } from '../components/moto'
import './Squadre.css'

/**
 * Le società.
 *
 * L'anagrafica — nome, sigla, colore, stemma — resta un file: sono tre
 * chilobyte e servono in ogni pagina, subito, senza aspettare la rete. Tutto
 * il resto (partite, punti, titoli, coppe, forma) viene dall'archivio.
 *
 * Le schede si riordinano. Non è un vezzo: "chi ha vinto di più" e "chi sta
 * andando meglio adesso" sono due domande diverse, e prima la pagina
 * rispondeva solo alla prima.
 */
const ORDINI = [
  { k: 'punti', t: 'Punti di sempre', get: (d) => d.c?.punti ?? -1 },
  { k: 'titoli', t: 'Titoli', get: (d) => (d.c?.titoli ?? 0) * 1000 + (d.c?.punti ?? 0) },
  { k: 'trofei', t: 'Trofei totali', get: (d) => (d.trofei ?? 0) * 1000 + (d.c?.punti ?? 0) },
  { k: 'ora', t: `Posizione ${LAST_PLAYED_SEASON}`, get: (d) => (d.pos ? 100 - d.pos : -1) },
  { k: 'nome', t: 'Nome', get: (d) => d.t.name, testo: true },
]

export default function Squadre() {
  const [ordine, setOrdine] = useState('punti')
  const [storiche, setStoriche] = useState(false)

  const cl = useArchivio('perpetua', classificaPerpetua)
  const ba = useArchivio('bachecaTutti', bachecaTutti)
  const og = useArchivio(['classifica', LAST_PLAYED_SEASON], () => classifica(LAST_PLAYED_SEASON))
  const fo = useArchivio(['forma', LAST_PLAYED_SEASON], () => forma(LAST_PLAYED_SEASON))

  const carriera = useMemo(() => {
    const acc = new Map()
    for (const r of cl.dati ?? []) {
      const c = acc.get(r.societa)
        ?? { stagioni: 0, giocate: 0, vinte: 0, punti: 0, titoli: 0, gol: 0 }
      c.stagioni += 1
      c.giocate += r.giocate
      c.vinte += r.vinte
      c.punti += r.punti
      c.gol += r.gol_fatti
      if (r.posizione === 1) c.titoli += 1
      acc.set(r.societa, c)
    }
    for (const c of acc.values()) {
      c.percentuale = c.giocate ? Math.round((c.vinte / c.giocate) * 100) : 0
    }
    return acc
  }, [cl.dati])

  /* I trofei di coppa, separati dai titoli di campionato. */
  const coppe = useMemo(() => {
    const acc = new Map()
    for (const t of ba.dati ?? []) {
      if (t.competizione === 'campionato') continue
      acc.set(t.societa, (acc.get(t.societa) ?? 0) + 1)
    }
    return acc
  }, [ba.dati])

  const posizioni = useMemo(
    () => new Map((og.dati ?? []).map((r) => [r.societa, r.posizione])), [og.dati])

  const ultime = useMemo(() => {
    const m = new Map()
    for (const g of fo.dati ?? []) {
      if (!m.has(g.societa)) m.set(g.societa, [])
      m.get(g.societa).push(g)
    }
    for (const [k, v] of m) m.set(k, v.slice(-5))
    return m
  }, [fo.dati])

  const prepara = (elenco) => {
    const con = elenco.map((t) => ({
      t,
      c: carriera.get(t.id),
      trofei: coppe.get(t.id) ?? 0,
      pos: posizioni.get(t.id),
      gare: ultime.get(t.id),
    }))
    const o = ORDINI.find((x) => x.k === ordine)
    return con.sort((a, b) => (o.testo
      ? String(o.get(a)).localeCompare(String(o.get(b)))
      : o.get(b) - o.get(a)))
  }

  const attive = prepara([...ACTIVE_TEAMS])
  const fuori = prepara([...HISTORIC_TEAMS])

  return (
    <Pagina className="page container wide">
      <header className="sq-testa">
        <div>
          <p className="eyebrow">Federazione · dieci società affiliate</p>
          <h1>Società</h1>
        </div>
        <div className="sq-comandi">
          <label className="sq-ordine">
            <span>Ordina per</span>
            <select value={ordine} onChange={(e) => setOrdine(e.target.value)}>
              {ORDINI.map((o) => <option key={o.k} value={o.k}>{o.t}</option>)}
            </select>
          </label>
          {HISTORIC_TEAMS.length > 0 && (
            <button type="button" className={`sq-storiche ${storiche ? 'on' : ''}`}
                    onClick={() => setStoriche((v) => !v)}>
              {storiche ? '✓ ' : ''}Mostra le storiche
            </button>
          )}
        </div>
      </header>

      <Sezione stato={cl} righe={6}>
        <Cascata className="sq-griglia" tetto={12}>
          {attive.map((d) => <Voce key={d.t.id}><Scheda {...d} /></Voce>)}
        </Cascata>
      </Sezione>

      {storiche && fuori.length > 0 && (
        <section className="block">
          <h2 className="section-title">Non più in attività</h2>
          <p className="lede">
            Hanno partecipato al campionato in passato. I loro risultati restano
            nell'archivio e nella classifica perpetua.
          </p>
          <Cascata className="sq-griglia">
            {fuori.map((d) => <Voce key={d.t.id}><Scheda {...d} /></Voce>)}
          </Cascata>
        </section>
      )}
    </Pagina>
  )
}

/**
 * Una scheda società.
 *
 * Lo stemma è grande perché è la cosa che si riconosce da lontano: sono
 * disegni fatti uno per uno, non icone, e rimpicciolirli a trentadue pixel
 * sarebbe come stampare uno stendardo su un francobollo.
 */
function Scheda({ t, c, trofei, pos, gare }) {
  const src = logoUrl(t)
  return (
    <Link to={`/squadre/${t.id}`}
          className={`sq-carta card ${t.active ? '' : 'fuori'}`}
          style={{ '--accent': t.color }}>
      <span className="sq-accento" />

      {pos && <span className="sq-posizione"><b>{pos}</b><em>º</em></span>}

      <div className="sq-stemma">
        {src ? <img src={src} alt="" loading="lazy" />
             : <span className="sq-ripiego">{t.code}</span>}
      </div>

      <h2>{t.name}</h2>

      <p className="sq-sigla">
        {t.code}
        {!t.active && (
          <span className="sq-anni">
            {' · '}{t.seasons[0]} – {t.seasons[t.seasons.length - 1]}
          </span>
        )}
      </p>

      {(c?.titoli > 0 || trofei > 0) && (
        <p className="sq-palmares">
          {c?.titoli > 0 && (
            <span className="sq-trofeo" title={`${c.titoli} scudetti`}>
              <i>★</i>{c.titoli} {c.titoli === 1 ? 'titolo' : 'titoli'}
            </span>
          )}
          {trofei > 0 && (
            <span className="sq-trofeo" title={`${trofei} coppe`}>
              <i>❖</i>{trofei} {trofei === 1 ? 'coppa' : 'coppe'}
            </span>
          )}
        </p>
      )}

      <dl className="sq-numeri">
        <div><dt>Stagioni</dt><dd>{c?.stagioni ?? '—'}</dd></div>
        <div><dt>Punti</dt><dd>{c?.punti ?? '—'}</dd></div>
        <div><dt>Vittorie</dt><dd>{c ? `${c.percentuale}%` : '—'}</dd></div>
        <div><dt>Gol</dt><dd>{c?.gol ?? '—'}</dd></div>
      </dl>

      {gare?.length > 0 && (
        <div className="sq-forma">
          <span>Ultime cinque</span>
          <span className="forma">
            {gare.map((g, i) => (
              <i key={i} className={`pastiglia p-${g.esito}`}
                 title={`${g.giornata}ª · ${g.gol_fatti}-${g.gol_subiti}${g.avversario ? ` con ${getTeam(g.avversario).name}` : ''}`}>
                {g.esito}
              </i>
            ))}
          </span>
        </div>
      )}
    </Link>
  )
}
