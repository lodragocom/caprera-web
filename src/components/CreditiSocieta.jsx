import { useEffect, useState } from 'react'
import { leggi, CONFIGURATO } from '../lib/supabase'
import './CreditiSocieta.css'

/**
 * I crediti che una societa' si e' guadagnata (o persa) con i piazzamenti.
 *
 * Questo pannello e' il primo pezzo del sito che NON legge un file: interroga
 * l'archivio su Supabase ogni volta che si apre la pagina. I premi non sono
 * scritti da nessuna parte nel sito - nemmeno i numeri +5, +3, +1 - perche' li
 * calcola una vista del database leggendoli dal regolamento. Se la Presidenza
 * cambia un premio, cambia il regolamento e questa tabella lo segue da sola.
 *
 * Se il database non risponde, il pannello sparisce invece di rompere la
 * pagina: il resto della scheda vive ancora sui dati statici.
 */
export default function CreditiSocieta({ teamId }) {
  const [stato, setStato] = useState({ righe: null, errore: null })

  useEffect(() => {
    let vivo = true
    setStato({ righe: null, errore: null })
    leggi((db) =>
      db.from('v_premi_crediti')
        .select('stagione, pos_fantapunti, crediti_fantapunti, pos_marcatori, crediti_marcatori, crediti_calcolati')
        .eq('societa', teamId)
        .order('stagione', { ascending: false })
    ).then(({ dati, errore }) => {
      if (vivo) setStato({ righe: dati, errore })
    })
    return () => { vivo = false }
  }, [teamId])

  if (!CONFIGURATO || stato.errore) return null
  if (!stato.righe) return <section className="block"><p className="muted">Carico i crediti…</p></section>
  if (!stato.righe.length) return null

  const totale = stato.righe.reduce((n, r) => n + Number(r.crediti_calcolati), 0)

  return (
    <section className="block">
      <h2 className="section-title">Crediti dai piazzamenti</h2>
      <p className="lede">
        Premi e penalità della Classifica Fantapunti e della classifica
        marcatori, stagione per stagione. Calcolati dall'archivio applicando il
        regolamento — non sono trascritti da nessuna parte.
      </p>

      <div className="table-wrap">
        <table className="crediti-premi">
          <thead>
            <tr>
              <th className="left">Stagione</th>
              <th>Fantapunti</th>
              <th>Crediti</th>
              <th>Marcatori</th>
              <th>Crediti</th>
              <th>Totale</th>
            </tr>
          </thead>
          <tbody>
            {stato.righe.map((r) => (
              <tr key={r.stagione}>
                <td className="left num">{r.stagione}</td>
                <td className="num muted">{r.pos_fantapunti ? `${r.pos_fantapunti}º` : '—'}</td>
                <td className="num"><Cr n={r.crediti_fantapunti} /></td>
                <td className="num muted">{r.pos_marcatori ? `${r.pos_marcatori}º` : '—'}</td>
                <td className="num"><Cr n={r.crediti_marcatori} /></td>
                <td className="num strong"><Cr n={r.crediti_calcolati} /></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="left" colSpan="5">In dieci stagioni</td>
              <td className="num strong"><Cr n={totale} /></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="note">
        Dati letti dall'archivio in tempo reale. Mancano i premi del Ranking
        Caprera — la tabella dei punteggi non compare nel regolamento — e le
        penalità, che le registra la Presidenza.
      </p>
    </section>
  )
}

/* Un credito: verde se guadagnato, rosso se perso, grigio se zero. */
function Cr({ n }) {
  const v = Number(n)
  if (!v) return <span className="muted">—</span>
  return <span className={v > 0 ? 'cr su' : 'cr giu'}>{v > 0 ? `+${v}` : v}</span>
}
