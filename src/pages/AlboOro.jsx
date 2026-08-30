import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import TeamBadge from '../components/TeamBadge'
import { useArchivio, classificaPerpetua, bachecaTutti } from '../lib/archivio'
import { Pagina, Cascata, Voce, Sezione, Numero } from '../components/moto'
import './AlboOro.css'

/**
 * L'albo d'oro, dal database.
 *
 * Due letture sole - le cento righe di classifica e la bacheca di tutte le
 * societa' - e il resto e' conteggio fatto qui. Le medaglie e i trofei non
 * sono scritti da nessuna parte: si contano ogni volta dai risultati, cosi'
 * non possono divergere dall'archivio.
 */
export default function AlboOro() {
  const cl = useArchivio('perpetua', classificaPerpetua)
  const ba = useArchivio('bachecaTutti', bachecaTutti)

  /** Le stagioni, dalla piu' recente, e la classifica di ciascuna. */
  const perStagione = useMemo(() => {
    const m = new Map()
    for (const r of cl.dati ?? []) {
      if (!m.has(r.stagione)) m.set(r.stagione, [])
      m.get(r.stagione).push(r)
    }
    for (const v of m.values()) v.sort((a, b) => a.posizione - b.posizione)
    return [...m.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  }, [cl.dati])

  /** Quante volte ogni societa' ha chiuso 1ª, 2ª, 3ª e ultima. */
  const medaglie = useMemo(() => {
    const acc = new Map()
    for (const [, tabella] of perStagione) {
      for (const r of tabella) {
        const c = acc.get(r.societa)
          ?? { societa: r.societa, oro: 0, argento: 0, bronzo: 0, ultimo: 0, titoli: [] }
        if (r.posizione === 1) { c.oro += 1; c.titoli.push(r.stagione) }
        else if (r.posizione === 2) c.argento += 1
        else if (r.posizione === 3) c.bronzo += 1
        if (r.posizione === tabella.length) c.ultimo += 1
        acc.set(r.societa, c)
      }
    }
    for (const c of acc.values()) c.titoli.sort()
    return [...acc.values()].sort(
      (a, b) => b.oro - a.oro || b.argento - a.argento || b.bronzo - a.bronzo)
  }, [perStagione])

  /** Le coppe di ogni societa', raggruppate per competizione. */
  const coppe = useMemo(() => {
    const acc = new Map()
    for (const t of ba.dati ?? []) {
      if (t.competizione === 'campionato') continue
      if (!acc.has(t.societa)) acc.set(t.societa, new Map())
      const suo = acc.get(t.societa)
      const c = suo.get(t.competizione)
        ?? { id: t.competizione, nome: t.competizione_nome, n: 0, stagioni: [] }
      c.n += 1
      c.stagioni.push(t.stagione)
      suo.set(t.competizione, c)
    }
    return acc
  }, [ba.dati])

  const quante = perStagione.length

  return (
    <Pagina className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Archivio</p>
        <h1>Albo d'oro</h1>
        <p className="lede">
          Il campionato di Lega Caprera, stagione per stagione, e tutti i trofei
          vinti da ogni società. I tabelloni completi delle coppe sono{' '}
          <Link to="/coppe">nella pagina Coppe</Link>.
        </p>
      </header>

      <section className="block">
        <h2 className="section-title">Bacheca</h2>
        <Sezione stato={cl} righe={6}>
          <Cascata className="bacheca" tetto={12}>
            {medaglie.map((b) => {
              const sue = [...(coppe.get(b.societa)?.values() ?? [])]
                .sort((x, y) => y.n - x.n)
              return (
                <Voce key={b.societa} className="trofeo card">
                  <TeamBadge id={b.societa} size="lg" />
                  <div className="medaglie">
                    <span className="m oro" title="Primi posti">{b.oro}</span>
                    <span className="m argento" title="Secondi posti">{b.argento}</span>
                    <span className="m bronzo" title="Terzi posti">{b.bronzo}</span>
                  </div>
                  {b.titoli.length > 0 && <p className="anni num">{b.titoli.join(' · ')}</p>}
                  {sue.length > 0 && (
                    <p className="coppe-mini">
                      {sue.map((t) => (
                        <span key={t.id} title={[...t.stagioni].sort().join(' · ')}>
                          {t.nome}{t.n > 1 && <b> ×{t.n}</b>}
                        </span>
                      ))}
                    </p>
                  )}
                </Voce>
              )
            })}
          </Cascata>
        </Sezione>
        <p className="note">
          Le tre medaglie sono, nell'ordine, primi / secondi / terzi posti in
          campionato. Sotto, le coppe vinte in {quante || 'dieci'} stagioni: passa
          il puntatore sopra per vedere gli anni.
        </p>
      </section>

      <section className="block">
        <h2 className="section-title">Stagione per stagione</h2>
        <Sezione stato={cl} righe={10}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="left">Stagione</th><th className="left">Campione</th>
                  <th>Pt</th><th className="left">Seconda</th>
                  <th className="left">Terza</th><th className="left">Ultima</th>
                </tr>
              </thead>
              <tbody>
                {perStagione.map(([s, t]) => (
                  <tr key={s}>
                    <td className="left num season-cell">{s}</td>
                    <td className="left"><TeamBadge id={t[0].societa} size="sm" /></td>
                    <td className="num strong"><Numero valore={t[0].punti} /></td>
                    <td className="left muted-badge">
                      <TeamBadge id={t[1].societa} size="sm" label="short" />
                    </td>
                    <td className="left muted-badge">
                      <TeamBadge id={t[2].societa} size="sm" label="short" />
                    </td>
                    <td className="left muted-badge">
                      <TeamBadge id={t[t.length - 1].societa} size="sm" label="short" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Sezione>
      </section>
    </Pagina>
  )
}
