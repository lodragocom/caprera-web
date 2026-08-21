import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ACTIVE_TEAMS, HISTORIC_TEAMS, logoUrl } from '../lib/core'
import { useArchivio, classificaPerpetua, bachecaTutti } from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione } from '../components/moto'
import './Squadre.css'

/**
 * Le societa', con la carriera contata dal database.
 *
 * L'anagrafica - nome, sigla, colore, stemma - resta un file: sono tre
 * chilobyte e servono in ogni pagina, subito, senza aspettare la rete. Tutto
 * il resto (partite, punti, titoli, coppe) viene dall'archivio.
 */
export default function Squadre() {
  const cl = useArchivio('perpetua', classificaPerpetua)
  const ba = useArchivio('bachecaTutti', bachecaTutti)

  const carriera = useMemo(() => {
    const acc = new Map()
    for (const r of cl.dati ?? []) {
      const c = acc.get(r.societa)
        ?? { stagioni: 0, giocate: 0, vinte: 0, punti: 0, titoli: 0 }
      c.stagioni += 1
      c.giocate += r.giocate
      c.vinte += r.vinte
      c.punti += r.punti
      if (r.posizione === 1) c.titoli += 1
      acc.set(r.societa, c)
    }
    for (const c of acc.values()) {
      c.percentuale = c.giocate ? Math.round((c.vinte / c.giocate) * 100) : 0
    }
    return acc
  }, [cl.dati])

  const coppe = useMemo(() => {
    const acc = new Map()
    for (const t of ba.dati ?? []) {
      if (t.competizione === 'campionato') continue
      acc.set(t.societa, (acc.get(t.societa) ?? 0) + 1)
    }
    return acc
  }, [ba.dati])

  const ordina = (a, b) =>
    (carriera.get(b.id)?.punti ?? 0) - (carriera.get(a.id)?.punti ?? 0)
  const attive = [...ACTIVE_TEAMS].sort(ordina)
  const storiche = [...HISTORIC_TEAMS].sort(ordina)

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Federazione</p>
        <h1>Società</h1>
        <p className="lede">
          Le dieci società della Lega Caprera, in ordine di punti conquistati
          da quando esiste la Federazione.
        </p>
      </header>

      <Sezione stato={cl} righe={6}>
        <Cascata className="team-grid" tetto={12}>
          {attive.map((t) => (
            <Voce key={t.id}>
              <Scheda t={t} c={carriera.get(t.id)} coppe={coppe.get(t.id)} />
            </Voce>
          ))}
        </Cascata>
      </Sezione>

      {storiche.length > 0 && (
        <section className="block">
          <h2 className="section-title">Non più in attività</h2>
          <p className="lede">
            Società che hanno partecipato al campionato in passato. I loro risultati
            restano nell'archivio e nella classifica perpetua.
          </p>
          <Cascata className="team-grid">
            {storiche.map((t) => (
              <Voce key={t.id}>
                <Scheda t={t} c={carriera.get(t.id)} coppe={coppe.get(t.id)} />
              </Voce>
            ))}
          </Cascata>
        </section>
      )}
    </Pagina>
  )
}

function Scheda({ t, c, coppe }) {
  const src = logoUrl(t)
  return (
    <Link to={`/squadre/${t.id}`} className={`team-card card${t.active ? '' : ' inactive'}`}>
      <span className="team-accent" style={{ background: t.color }} />
      {src ? <img src={src} alt="" loading="lazy" />
           : <span className="team-crest-fallback" style={{ background: t.color }}>{t.code}</span>}
      <div className="team-card-body">
        <h2>{t.name}</h2>
        <p className="code num">
          {t.code}
          {!t.active && (
            <span className="years">
              {' · '}{t.seasons[0]} – {t.seasons[t.seasons.length - 1]}
            </span>
          )}
        </p>
        <dl>
          <div><dt>Stagioni</dt><dd className="num">{c?.stagioni ?? '—'}</dd></div>
          <div><dt>Punti</dt><dd className="num">{c?.punti ?? '—'}</dd></div>
          <div><dt>Vittorie</dt><dd className="num">{c ? `${c.percentuale}%` : '—'}</dd></div>
          <div><dt>Titoli</dt><dd className="num gold-text">{c?.titoli || '—'}</dd></div>
          <div><dt>Coppe</dt><dd className="num gold-text">{coppe || '—'}</dd></div>
        </dl>
      </div>
    </Link>
  )
}
