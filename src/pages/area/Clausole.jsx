import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl } from '../../lib/core'
import { conformitaClausole } from '../../lib/archivio'
import { Pagina } from '../../components/moto'
import './Clausole.css'

/**
 * Le clausole rescissorie, controllate.
 *
 * Il §10.5.1 dice che la clausola non può essere inferiore a una quota del
 * prezzo d'acquisto su Fantapazz: metà per i difensori, tre quarti per i
 * centrocampisti, tutto per gli altri. Finora quel conto non lo faceva
 * nessuno, perché la clausola si dichiarava per email.
 *
 * Non è una pagina che accusa qualcuno: due contratti sono sotto soglia e
 * nessuno ha barato — semplicemente niente poteva accorgersene.
 */
export default function Clausole() {
  const { vedeTutto } = useAuth()
  const [righe, setRighe] = useState(null)
  const [errore, setErrore] = useState(null)
  const [tutti, setTutti] = useState(false)

  useEffect(() => {
    conformitaClausole().then(setRighe).catch((e) => setErrore(e.message))
  }, [])

  const conto = useMemo(() => {
    const c = { 'sotto soglia': 0, 'a norma': 0, 'senza clausola': 0, 'senza prezzo': 0 }
    for (const r of righe ?? []) c[r.esito] = (c[r.esito] ?? 0) + 1
    return c
  }, [righe])

  if (!vedeTutto) {
    return (
      <Pagina className="cla">
        <h1>Clausole</h1>
        <p className="cla-nota">Questa sezione è di chi ha un incarico di governo.</p>
      </Pagina>
    )
  }

  const mostrate = (righe ?? []).filter((r) => tutti || r.esito === 'sotto soglia')

  return (
    <Pagina className="cla">
      <h1>Clausole rescissorie</h1>
      <p className="cla-nota">
        Il regolamento (§10.5.1) chiede che la clausola non sia inferiore a una quota del
        prezzo Fantapazz di partenza: <strong>metà</strong> per i difensori,{' '}
        <strong>tre quarti</strong> per i centrocampisti, <strong>tutto</strong> per gli altri.
      </p>

      {errore && <p className="cla-errore">{errore}</p>}
      {!righe && <p className="cla-nota">Sto controllando…</p>}

      {righe && (
        <>
          <div className="cla-conto">
            <span className="giu"><b>{conto['sotto soglia']}</b> sotto soglia</span>
            <span className="su"><b>{conto['a norma']}</b> a norma</span>
            <span><b>{conto['senza clausola']}</b> senza clausola</span>
            <span><b>{conto['senza prezzo']}</b> senza prezzo a listino</span>
          </div>

          {conto['senza clausola'] > 0 && (
            <p className="cla-avviso">
              I contratti <strong>senza clausola</strong> non sono irregolari di per sé: la
              clausola è obbligatoria <strong>dal 2024-25</strong>, e quelli più vecchi sono nati
              quando non lo era.
            </p>
          )}

          <label className="cla-tutti">
            <input type="checkbox" checked={tutti} onChange={(e) => setTutti(e.target.checked)} />
            Mostra tutti i contratti, non solo quelli fuori norma
          </label>

          <table className="cla-tab">
            <thead>
              <tr>
                <th>Società</th><th>Calciatore</th><th>Dal</th>
                <th className="n">Clausola</th><th className="n">Valore FP</th>
                <th className="n">Minimo</th><th className="n">Scarto</th><th>Esito</th>
              </tr>
            </thead>
            <tbody>
              {mostrate.map((r) => (
                <tr key={r.id} className={r.esito === 'sotto soglia' ? 'fuori' : ''}>
                  <td className="cla-soc">
                    <img src={logoUrl(getTeam(r.societa))} alt="" />
                    {getTeam(r.societa).name}
                  </td>
                  <td>
                    {r.nome} <span className="cla-ruolo">{r.ruolo}</span>
                    {/* Quando il ruolo su Fantapazz è cambiato, la soglia
                        dipende da quale dei due si guarda — ed è una domanda
                        che il regolamento lascia aperta. Meglio dirlo qui che
                        far sembrare il verdetto più sicuro di quanto sia. */}
                    {r.ruolo_cambiato && r.ruolo_listone && (
                      <span className="cla-cambio" title={
                        `A listino era ${r.ruolo_listone}. Minimo col ruolo del contratto: ` +
                        `${r.minimo_ruolo_contratto} · col ruolo di listino: ${r.minimo_ruolo_listone}. ` +
                        `Si applica il più basso.`}>
                        era {r.ruolo_listone}
                      </span>
                    )}
                  </td>
                  <td>{r.dalla}</td>
                  <td className="n">{r.clausola ?? '—'}</td>
                  <td className="n">{r.valore_fp ?? '—'}</td>
                  <td className="n">{r.minimo ?? '—'}</td>
                  <td className={`n ${r.scarto < 0 ? 'giu' : ''}`}>
                    {r.scarto == null ? '—' : (r.scarto > 0 ? `+${r.scarto}` : r.scarto)}
                  </td>
                  <td className={`cla-esito e-${r.esito.replace(/ /g, '-')}`}>{r.esito}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {mostrate.length === 0 && (
            <p className="cla-nota">Nessun contratto fuori norma.</p>
          )}
        </>
      )}
    </Pagina>
  )
}
