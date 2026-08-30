import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIE, consenso, daChiedere, salvaConsenso, applica } from '../lib/consenso'
import './Consenso.css'

/**
 * Il banner del consenso.
 *
 * Non è una formalità da sbrigare: finché non si è scelto, statistiche e pixel
 * **non sono caricati**. Il banner non "avvisa" che il sito usa i cookie — è
 * l'interruttore che li accende.
 *
 * «Rifiuta» sta accanto ad «Accetta» ed è identico: se rifiutare costasse un
 * clic in più, il sì non sarebbe libero e quindi non varrebbe.
 */
export default function Consenso() {
  const [aperto, setAperto] = useState(() => daChiedere())
  const [dettaglio, setDettaglio] = useState(false)
  const [scelte, setScelte] = useState(() => consenso())
  const [revocato, setRevocato] = useState(false)

  useEffect(() => {
    applica()                      // ciò che era già stato accettato, si accende
    // Dalle pagine legali si riapre il pannello: un solo posto per cambiare idea.
    const riapri = () => { setScelte(consenso()); setDettaglio(true); setAperto(true) }
    window.addEventListener('caprera:apri-consenso', riapri)
    return () => window.removeEventListener('caprera:apri-consenso', riapri)
  }, [])

  if (!aperto) return null

  function chiudi(g) {
    const prima = consenso()
    salvaConsenso(g)
    // Uno script già caricato non si scarica: dirlo è più onesto che fingere.
    if ((prima.statistiche && !g.statistiche) || (prima.marketing && !g.marketing)) {
      setRevocato(true)
      return
    }
    setAperto(false)
  }

  if (revocato) {
    return (
      <div className="cons" role="dialog" aria-label="Preferenze salvate">
        <div className="cons-corpo">
          <p className="cons-testo">
            <strong>Salvato.</strong> Quello che avevi già accettato è stato tolto per le
            prossime visite, ma per questa pagina resta caricato finché non la ricarichi:
            uno script, una volta partito, non si può richiamare indietro.
          </p>
          <div className="cons-bottoni">
            <button className="cons-si" onClick={() => window.location.reload()}>Ricarica</button>
            <button className="cons-no" onClick={() => setAperto(false)}>Va bene così</button>
          </div>
        </div>
      </div>
    )
  }

  const tutto = Object.fromEntries(CATEGORIE.map((c) => [c.id, true]))
  const niente = Object.fromEntries(CATEGORIE.map((c) => [c.id, false]))

  return (
    <div className="cons" role="dialog" aria-modal="false" aria-label="Cookie e consenso">
      <div className="cons-corpo">
        <p className="cons-tit">Cookie</p>
        <p className="cons-testo">
          Questo sito usa cookie tecnici, che servono a tenerti dentro quando entri e
          non si possono spegnere. Vorremmo usarne altri per capire come viene usato il
          sito e per le campagne sui social: quelli <strong>partono solo se dici di sì</strong>.
          {' '}<Link to="/privacy">Privacy</Link> · <Link to="/termini">Termini</Link>
        </p>

        {dettaglio && (
          <div className="cons-voci">
            <div className="cons-voce fissa">
              <div>
                <strong>Tecnici</strong>
                <span>La sessione di chi entra. Ricordano chi sei, non dove vai.</span>
              </div>
              <em>sempre attivi</em>
            </div>
            {CATEGORIE.map((c) => (
              <label key={c.id} className="cons-voce">
                <div>
                  <strong>{c.nome}</strong>
                  <span>{c.testo}</span>
                </div>
                <input type="checkbox" checked={!!scelte[c.id]}
                       onChange={(e) => setScelte({ ...scelte, [c.id]: e.target.checked })} />
              </label>
            ))}
          </div>
        )}

        <div className="cons-bottoni">
          {/* I due che contano, affiancati e uguali. */}
          <button className="cons-si" onClick={() => chiudi(tutto)}>Accetta tutto</button>
          <button className="cons-no" onClick={() => chiudi(niente)}>Rifiuta tutto</button>
          {dettaglio
            ? <button className="cons-terzo" onClick={() => chiudi(scelte)}>Salva le mie scelte</button>
            : <button className="cons-terzo" onClick={() => setDettaglio(true)}>Scegli</button>}
        </div>
      </div>
    </div>
  )
}
