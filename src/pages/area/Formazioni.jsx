import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl } from '../../lib/core'
import {
  stagioniDi, caricaStagione, impegniDi, partitaDi, disponi, contaBonus, schierati,
} from '../../lib/formazioni'
import './Formazioni.css'

/* Icona di ogni bonus. Testo, non immagini: restano nitide a ogni dimensione
   e non aggiungono richieste di rete. */
const SIMBOLO = {
  gol: '⚽', rigore: '⚽', 'rigore-parato': '🧤', assist: '↳',
  giallo: '▮', rosso: '▮', autogol: '⊗', 'rigore-sbagliato': '✕',
  'gol-subito': '−', imbattuto: '✓', 'gol-vittoria': '★',
}

function Bonus({ bonus }) {
  if (!bonus.length) return null
  return (
    <span className="bonus">
      {bonus.map((b, i) => (
        <i key={i} className={`b b-${b.id}`} title={b.nome}>{SIMBOLO[b.id] ?? '•'}</i>
      ))}
    </span>
  )
}

function Maglia({ g }) {
  const uscito = g.voto == null
  return (
    <div
      className={`giocatore${uscito ? ' fuori' : ''}`}
      style={{ left: `${g.x}%`, top: `${g.y}%` }}
      title={uscito ? `${g.nome} — non ha giocato, sostituito da un riserva` : g.nome}
    >
      <span className={`pallino role-${g.ruolo}`}>
        <b className="v">{g.voto ?? '–'}</b>
        {g.fascia && <b className="fascia">{g.fascia}</b>}
      </span>
      <span className="etichetta">
        <b>{g.nome}</b>
        <Bonus bonus={g.bonus} />
      </span>
    </div>
  )
}

export default function Formazioni() {
  const { sessione } = useAuth()
  const team = getTeam(sessione.team)
  const stagioni = stagioniDi(team.id)
  const [stagione, setStagione] = useState(stagioni[stagioni.length - 1])
  const [dati, setDati] = useState(null)
  const [n, setN] = useState(null)

  useEffect(() => {
    let vivo = true
    setDati(null)
    caricaStagione(stagione).then((d) => {
      if (!vivo) return
      setDati(d)
      const imp = impegniDi(d, team.id)
      // si apre sull'ultima giornata di campionato, non sull'ultima coppa
      const ultima = [...imp].reverse().find((x) => !x.coppa) ?? imp[imp.length - 1]
      setN(ultima?.chiave ?? null)
    })
    return () => { vivo = false }
  }, [stagione, team.id])

  const impegni = impegniDi(dati, team.id)
  const giornate = impegni.filter((x) => !x.coppa)
  const turniCoppa = impegni.filter((x) => x.coppa)

  const scelte = (
    <>
      {stagioni.length > 1 && (
        <div className="scelta-giornata stagioni">
          {stagioni.map((s) => (
            <button key={s} className={s === stagione ? 'on' : ''}
                    onClick={() => setStagione(s)}>{s}</button>
          ))}
        </div>
      )}
      <div className="scelta-giornata">
        {giornate.map((g) => (
          <button key={g.chiave} className={g.chiave === n ? 'on' : ''}
                  onClick={() => setN(g.chiave)}>{g.breve}</button>
        ))}
      </div>
      {turniCoppa.length > 0 && (
        <div className="scelta-giornata coppe">
          {turniCoppa.map((t) => (
            <button key={t.chiave} className={t.chiave === n ? 'on' : ''}
                    onClick={() => setN(t.chiave)} title={t.titolo}>{t.breve}</button>
          ))}
        </div>
      )}
    </>
  )

  const testa = (
    <header>
      <p className="eyebrow">Formazioni · {stagione}</p>
      <h1>In campo</h1>
    </header>
  )

  if (!dati || n == null) {
    return <>{testa}{scelte}<p className="vuoto">Carico la stagione…</p></>
  }

  const p = partitaDi(dati, team.id, n)
  if (!p) return <>{testa}{scelte}<p className="vuoto">Giornata non disponibile.</p></>

  const avversario = getTeam(p.avversario)
  const campo = disponi(p.mia.titolari)
  const { entrati, assenti } = schierati(p.mia)
  const bonus = contaBonus(p.mia)
  const esito = p.gol > p.golSubiti ? 'V' : p.gol === p.golSubiti ? 'N' : 'P'
  const senzaFormazione = p.mia.titolari.length === 0

  return (
    <>
      {testa}
      {scelte}

      <section className="pannello card testa-partita">
        <div className="squadra-riga">
          <img src={logoUrl(team)} alt="" />
          <strong>{team.name}</strong>
          {!senzaFormazione && <span className="num modulo">{p.mia.modulo}</span>}
        </div>
        <div className={`risultato esito-${esito}`}>
          <b className="num">{p.gol} - {p.golSubiti}</b>
          <span className="num fp">{p.fp} · {p.fpAvversario}</span>
          <em>{p.inCasa ? 'in casa' : 'in trasferta'}</em>
        </div>
        <div className="squadra-riga fine">
          {p.sua.titolari.length > 0 && <span className="num modulo">{p.sua.modulo}</span>}
          <strong>{avversario.name}</strong>
          <img src={logoUrl(avversario)} alt="" />
        </div>
      </section>

      {senzaFormazione ? (
        <p className="note">
          Per questa giornata Fantapazz conserva il risultato ma non la
          formazione: succede nelle prime giornate di alcune stagioni.
        </p>
      ) : (
        <div className="due-campo">
          <section className="pannello card campo-box">
            <h2>In campo · {p.mia.modulo}</h2>
            <div className="campo">
              <div className="linee" aria-hidden="true">
                <span className="meta" /><span className="cerchio" />
                <span className="area area-giu" /><span className="area area-su" />
              </div>
              {campo.map((g, i) => <Maglia key={i} g={g} />)}
            </div>
            <p className="legenda">
              Il numero nel pallino è il voto. Le maglie sbiadite sono i titolari
              che non hanno giocato: al loro posto è entrato un riserva.
            </p>
          </section>

          <div className="colonna">
            <section className="pannello card">
              <h2>Come sono nati i fantapunti</h2>
              <div className="mod-riga">
                {p.mia.modificatori.length ? p.mia.modificatori.map((m, i) => (
                  <span key={i} className="mod">
                    <b className="num">{m.valore > 0 ? '+' : ''}{m.valore}</b>
                    <em>{m.nome}</em>
                  </span>
                )) : <span className="vuoto">Nessun modificatore.</span>}
              </div>
              {bonus.length > 0 && (
                <ul className="conta-bonus">
                  {bonus.map((b) => (
                    <li key={b.id}>
                      <i className={`b b-${b.id}`}>{SIMBOLO[b.id] ?? '•'}</i>
                      <span>{b.nome}</span>
                      <b className="num">{b.n}</b>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="pannello card">
              <h2>Panchina</h2>
              {entrati.length > 0 && (
                <>
                  <p className="pannello-sub">
                    {entrati.length === 1 ? 'È entrato' : 'Sono entrati'} al posto di{' '}
                    {assenti.map((g) => g.nome).join(', ') || '—'}.
                  </p>
                  <ul className="lista-panchina">
                    {entrati.map((g, i) => (
                      <li key={i}>
                        <span className={`badge role-${g.ruolo}`}>{g.ruolo}</span>
                        <b>{g.nome}</b>
                        <Bonus bonus={g.bonus} />
                        <span className="num voto">{g.voto}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <ul className="lista-panchina spenta">
                {p.mia.panchina.filter((g) => !g.entrato).map((g, i) => (
                  <li key={i}>
                    <span className={`badge role-${g.ruolo}`}>{g.ruolo}</span>
                    <b>{g.nome}</b>
                    <span className="num voto">{g.voto ?? '–'}</span>
                  </li>
                ))}
              </ul>
            </section>

            {p.mia.inviata && (
              <p className="note">
                Formazione inviata da <b>{p.mia.mister}</b> — {p.mia.inviata}.
                {p.mia.avviso && <> {p.mia.avviso}</>}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
