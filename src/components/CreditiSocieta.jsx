import { useEffect, useState } from 'react'
import { leggi, CONFIGURATO } from '../lib/supabase'
import { nomeVoce } from '../lib/core'
import './CreditiSocieta.css'

/** Il nome leggibile dei conti del registro. */
const CONTO = {
  classifiche: 'Classifiche',
  'diritti-tv': 'Diritti TV',
  'serie-a-awards': 'Serie A Awards',
  'premi-caprera': 'Premi Caprera',
  giochi: 'Giochi',
}

/**
 * I premi in crediti che una societa' si e' guadagnata.
 *
 * Fino a stasera questo pannello *calcolava* i premi: leggeva i piazzamenti e
 * ci applicava il regolamento. Era una bella idea e aveva un difetto — diceva
 * quanto una societa' **avrebbe dovuto** prendere, e sapeva solo di Fantapunti
 * e capocannoniere. Adesso legge il registro della Presidenza, che dice quanto
 * ha **preso**, e sa anche dei diritti TV, dei Serie A Awards, della Panchina
 * d'Oro e dei Giochi. Dove le due cose divergevano aveva ragione il registro:
 * il regolamento e' una promessa, il registro e' una ricevuta.
 *
 * Escono solo i premi. Penalita' e rimborsi assicurativi non passano da questa
 * finestra — non perche' il sito li nasconda, ma perche' la vista che
 * interroga non li contiene: e' il database a non darglieli.
 *
 * Se l'archivio non risponde il pannello sparisce invece di rompere la
 * pagina: il resto della scheda vive ancora sui dati statici.
 */
export default function CreditiSocieta({ teamId }) {
  const [stato, setStato] = useState({ righe: null, errore: null })

  useEffect(() => {
    let vivo = true
    setStato({ righe: null, errore: null })
    leggi((db) =>
      db.from('premi_pubblici')
        .select('stagione, categoria, voce, crediti')
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

  /* Una stagione per blocco, la piu' recente in alto. */
  const stagioni = []
  for (const r of stato.righe) {
    const ultima = stagioni[stagioni.length - 1]
    if (ultima && ultima.id === r.stagione) ultima.voci.push(r)
    else stagioni.push({ id: r.stagione, voci: [r] })
  }
  for (const s of stagioni) {
    s.tot = s.voci.reduce((n, v) => n + v.crediti, 0)
    s.voci.sort((a, b) => b.crediti - a.crediti
      || a.categoria.localeCompare(b.categoria))
  }

  const totale = stato.righe.reduce((n, r) => n + r.crediti, 0)
  const migliore = stato.righe.reduce((a, b) => (b.crediti > a.crediti ? b : a))

  return (
    <section className="block">
      <h2 className="section-title">Premi in crediti</h2>
      <p className="lede">
        Quanto la Presidenza ha assegnato, stagione per stagione. Non è calcolato
        dal regolamento: è letto dal registro della lega, cioè da quello che è
        stato davvero pagato.
      </p>

      <div className="premi-sommario">
        <div className="premi-cifra">
          <strong className={`num cr ${totale > 0 ? 'su' : totale < 0 ? 'giu' : 'zero'}`}>
            {totale > 0 ? `+${totale}` : totale}
          </strong>
          <span>in {stagioni.length} {stagioni.length === 1 ? 'stagione' : 'stagioni'}</span>
        </div>
        {migliore.crediti > 0 ? (
          <div className="premi-cifra">
            <strong className="num">{nomeVoce(migliore.voce)}</strong>
            <span>il premio più ricco · +{migliore.crediti} nel {migliore.stagione}</span>
          </div>
        ) : null}
      </div>

      <div className="premi-stagioni">
        {stagioni.map((s) => (
          <div className="premi-stagione" key={s.id}>
            <div className="premi-testa">
              <span className="num">{s.id}</span>
              <b className={`num cr ${s.tot > 0 ? 'su' : s.tot < 0 ? 'giu' : 'zero'}`}>
                {s.tot > 0 ? `+${s.tot}` : s.tot}
              </b>
            </div>
            <div className="premi-voci">
              {s.voci.map((v, i) => (
                <div className="premi-voce" key={`${v.voce}·${i}`}>
                  <span className="premi-nome">{nomeVoce(v.voce)}</span>
                  <span className="premi-conto">{CONTO[v.categoria] ?? v.categoria}</span>
                  <b className={`num cr ${v.crediti > 0 ? 'su' : v.crediti < 0 ? 'giu' : 'zero'}`}>
                    {v.crediti > 0 ? `+${v.crediti}` : v.crediti}
                  </b>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="note">
        Qui ci sono solo i premi, e i premi non fanno il bilancio: penalità e
        rimborsi assicurativi restano fra la società e la Presidenza. Il mister
        li trova per intero nella sua area.
      </p>
    </section>
  )
}
