import { useState } from 'react'
import './Assicurazioni.css'

/** Investimento → percentuale di rimborso sul costo delle assenze (§7.2). */
const SCAGLIONI = [3, 4, 5, 6, 7, 8, 9, 10]

export default function Assicurazioni() {
  const [investito, setInvestito] = useState(5)
  const [costoAssenze, setCostoAssenze] = useState(400)

  const perMille = investito
  const rimborso = Math.round((costoAssenze * perMille) / 1000)
  const tetto = investito * 2
  const effettivo = Math.min(rimborso, tetto)

  return (
    <div className="page container wide">
      <header className="page-head">
        <p className="eyebrow">Cura Caprera</p>
        <h1>Assicurazioni</h1>
        <p className="lede">
          Due polizze, entrambe da decidere prima della 1ª giornata e da pagare a
          inizio anno. I crediti vengono restituiti la stagione seguente, insieme
          ai 250 del budget.
        </p>
      </header>

      <div className="avviso card">
        <strong>Dal 2026/27 la polizza infortuni è obbligatoria</strong>, con un
        minimo di 3 crediti (DPCM Assicurazione infortuni 11.25).
      </div>

      <section className="block">
        <h2 className="section-title">A · Infortuni e squalifiche</h2>
        <p className="lede">
          Si investe da 3 a 10 crediti. Il rimborso è una percentuale del valore
          d'asta dei calciatori assenti durante la stagione — più si investe, più
          alta la percentuale. <b>Il rimborso non può superare il doppio
          dell'investito.</b>
        </p>

        <div className="due-col">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th className="left">Investimento</th>
                  <th>Rimborso</th>
                  <th>Tetto massimo</th>
                </tr>
              </thead>
              <tbody>
                {SCAGLIONI.map((s) => (
                  <tr key={s} className={s === investito ? 'sel' : undefined}>
                    <td className="left num strong">{s} crediti</td>
                    <td className="num">{s} ‰</td>
                    <td className="num muted">{s * 2} crediti</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="calc card">
            <h3>Quanto rende</h3>
            <label>
              <span>Crediti investiti</span>
              <input
                type="range" min="3" max="10" value={investito}
                onChange={(e) => setInvestito(Number(e.target.value))}
              />
              <b className="num">{investito}</b>
            </label>
            <label>
              <span>Valore d'asta degli assenti</span>
              <input
                type="range" min="0" max="1500" step="50" value={costoAssenze}
                onChange={(e) => setCostoAssenze(Number(e.target.value))}
              />
              <b className="num">{costoAssenze}</b>
            </label>

            <div className="esito">
              <div>
                <span>Rimborso teorico</span>
                <strong className="num">{rimborso}</strong>
              </div>
              <div>
                <span>Tetto ({investito} × 2)</span>
                <strong className="num muted">{tetto}</strong>
              </div>
              <div className={effettivo > investito ? 'buono' : 'magro'}>
                <span>Ricevi</span>
                <strong className="num">{effettivo}</strong>
              </div>
            </div>
            <p className="verdetto">
              {effettivo > investito
                ? `In guadagno di ${effettivo - investito} crediti.`
                : effettivo === investito
                  ? 'In pareggio.'
                  : `In perdita di ${investito - effettivo} crediti.`}
            </p>
          </div>
        </div>
      </section>

      <section className="block">
        <h2 className="section-title">B · Polizza penalità "Rechsschuetz"</h2>
        <p className="lede">
          Costo fisso <b>2 crediti</b>. Copre le penalità di Caprera Etica, la
          formazione non data e il ritardo nella consegna delle liste. <b>Non
          copre</b> il ritardo nei pagamenti.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">Entità della penalità</th>
                <th className="left">Rimborso</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="left">Fino a 2 crediti</td>
                <td className="left muted">franchigia — nulla</td>
              </tr>
              <tr>
                <td className="left">Da 2 a 5 crediti</td>
                <td className="left strong">100% della penalità</td>
              </tr>
              <tr>
                <td className="left">Oltre 5 crediti</td>
                <td className="left strong">5 crediti + 50% dell'eccedenza</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="block">
        <h2 className="section-title">Indennizzo Carnevali</h2>
        <p className="lede">
          Non è una polizza ma un premio: se un calciatore sotto contratto viene
          venduto all'estero — e quindi svincolato d'ufficio — la società riceve
          crediti in base alla cifra della cessione.
        </p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="left">Valore della cessione</th>
                <th>Crediti</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="left">Oltre 10 M€</td><td className="num strong">1</td></tr>
              <tr><td className="left">Oltre 20 M€</td><td className="num strong">2</td></tr>
              <tr><td className="left">…e così via</td><td className="num muted">+1 ogni 10 M€</td></tr>
            </tbody>
          </table>
        </div>
        <p className="note">
          Si considera la parte fissa, senza bonus. In caso di prestito conta
          l'obbligo di riscatto, non il diritto. L'indennizzo arriva all'inizio
          della stagione successiva.
        </p>
      </section>
    </div>
  )
}
