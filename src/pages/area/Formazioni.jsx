import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, teamName, logoUrl } from '../../lib/core'
import {
  stagioniDi, impegniDi, partitaDi, disponi, contaBonus, schierati,
} from '../../lib/formazioni'
import { Barra, Campo, Schede, Scheda } from '../../components/Filtri'
import './Formazioni.css'

/* Un disegno per ogni bonus. SVG in linea: nitido a ogni dimensione, senza
   richieste di rete, e soprattutto ogni bonus ha una FORMA sua. Il colore e'
   solo un rinforzo: gol e rigore, giallo e rosso si riconoscono anche a
   schermo in bianco e nero o da chi i colori non li distingue. */
const FORME = {
  /* pallone: cerchio con il pentagono al centro */
  gol: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <polygon points="8 4.8 11.04 7.01 9.88 10.59 6.12 10.59 4.96 7.01" fill="currentColor" />
    </>
  ),
  /* pallone sopra il dischetto */
  rigore: (
    <>
      <circle cx="8" cy="5.8" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="8 3.7 10 5.15 9.24 7.5 6.76 7.5 6 5.15" fill="currentColor" />
      <circle cx="8" cy="13.2" r="1.3" fill="currentColor" />
    </>
  ),
  /* pallone sbarrato */
  'rigore-sbagliato': (
    <>
      <circle cx="8" cy="8" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="4" y1="12" x2="12" y2="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  /* guanto */
  'rigore-parato': (
    <>
      <rect x="4.4" y="6.8" width="7.2" height="6.8" rx="1.6" fill="currentColor" />
      <rect x="4.9" y="3.4" width="1.9" height="4.2" rx="0.95" fill="currentColor" />
      <rect x="7.05" y="2.6" width="1.9" height="5" rx="0.95" fill="currentColor" />
      <rect x="9.2" y="3.4" width="1.9" height="4.2" rx="0.95" fill="currentColor" />
      <rect x="1.9" y="8.2" width="2.9" height="2" rx="1" fill="currentColor" />
    </>
  ),
  /* il passaggio: freccia che curva in avanti */
  assist: (
    <>
      <path d="M2.6 13.4 Q2.6 4.4 10 4.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <polygon points="14.2 4.4 9 1.9 9 6.9" fill="currentColor" />
    </>
  ),
  /* cartellino vuoto: l'ammonizione */
  giallo: (
    <rect x="5" y="2.4" width="6" height="11.2" rx="1.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
  ),
  /* cartellino pieno e alzato: l'espulsione */
  rosso: (
    <rect x="5" y="2.4" width="6" height="11.2" rx="1.1" fill="currentColor" transform="rotate(-14 8 8)" />
  ),
  /* pallone spinto all'indietro, nella propria porta */
  autogol: (
    <>
      <circle cx="5" cy="8" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14.2" y1="8" x2="12.4" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <polygon points="9 8 12.4 5.6 12.4 10.4" fill="currentColor" />
    </>
  ),
  /* la porta, con il pallone dentro */
  'gol-subito': (
    <>
      <path d="M2.4 13.6 V4.6 H13.6 V13.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8" cy="10.4" r="1.8" fill="currentColor" />
    </>
  ),
  /* lo scudo: porta inviolata */
  imbattuto: (
    <path d="M8 1.8 13.4 4 V8.4 C13.4 11.4 11 13.4 8 14.3 C5 13.4 2.6 11.4 2.6 8.4 V4 Z" fill="currentColor" />
  ),
  /* la stella: il gol che vince la partita */
  'gol-vittoria': (
    <polygon points="8 1.6 10 6 14.6 6.5 11.2 9.6 12.2 14.2 8 11.8 3.8 14.2 4.8 9.6 1.4 6.5 6 6" fill="currentColor" />
  ),
  ignoto: <circle cx="8" cy="8" r="3" fill="currentColor" />,
}

function Icona({ id }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {FORME[id] ?? FORME.ignoto}
    </svg>
  )
}

/* Due gol non sono due palloni uno accanto all'altro: sono un pallone e un 2.
   Con cinque bonus la riga del nome non regge la fila di disegni. */
function raggruppa(bonus) {
  const fuori = []
  const dove = new Map()
  for (const b of bonus) {
    const i = dove.get(b.id)
    if (i == null) { dove.set(b.id, fuori.length); fuori.push({ ...b, n: 1 }) }
    else fuori[i].n += 1
  }
  return fuori
}

function Bonus({ bonus }) {
  if (!bonus.length) return null
  return (
    <span className="bonus">
      {raggruppa(bonus).map((b) => (
        <span
          key={b.id}
          className={`b b-${b.id}`}
          title={b.n > 1 ? `${b.nome} ×${b.n}` : b.nome}
        >
          <Icona id={b.id} />
          {b.n > 1 && <b className="volte">×{b.n}</b>}
        </span>
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

  const [stagioni, setStagioni] = useState([])
  const [stagione, setStagione] = useState(null)
  const [impegni, setImpegni] = useState([])
  const [n, setN] = useState(null)
  const [p, setP] = useState(null)
  const [guasto, setGuasto] = useState(null)

  /* Le stagioni in cui questa societa' ha giocato. */
  useEffect(() => {
    let vivo = true
    stagioniDi(team.id)
      .then((ss) => { if (vivo) { setStagioni(ss); setStagione(ss[ss.length - 1] ?? null) } })
      .catch((e) => vivo && setGuasto(e.message))
    return () => { vivo = false }
  }, [team.id])

  /* Gli impegni della stagione scelta: una lettura, non una per partita. */
  useEffect(() => {
    if (!stagione) return undefined
    let vivo = true
    setImpegni([]); setN(null); setP(null)
    impegniDi(team.id, stagione).then((imp) => {
      if (!vivo) return
      setImpegni(imp)
      // si apre sull'ultima giornata di campionato, non sull'ultima coppa
      const ultima = [...imp].reverse().find((x) => !x.coppa) ?? imp[imp.length - 1]
      setN(ultima?.chiave ?? null)
    }).catch((e) => vivo && setGuasto(e.message))
    return () => { vivo = false }
  }, [stagione, team.id])

  /* La singola partita, chiesta solo quando serve. */
  useEffect(() => {
    if (n == null || !stagione) return undefined
    let vivo = true
    setP(null)
    partitaDi(n, team.id, stagione)
      .then((x) => vivo && setP(x))
      .catch((e) => vivo && setGuasto(e.message))
    return () => { vivo = false }
  }, [n, stagione, team.id])

  const giornate = impegni.filter((x) => !x.coppa)
  const turniCoppa = impegni.filter((x) => x.coppa)

  /*
   * La striscia delle giornate porta l'esito.
   *
   * Trentasei bottoni con dentro solo un numero sono un elenco: per sapere
   * com'e' andata bisogna aprirle una per una. Con il colore dell'esito la
   * stessa striscia diventa l'andamento della stagione, e si sceglie guardando
   * - «quella persa 0-3» si trova a colpo d'occhio invece che a memoria.
   */
  const Tasto = ({ g }) => (
    <button type="button"
            className={`gio${g.chiave === n ? ' on' : ''}${g.esito ? ` e-${g.esito}` : ''}`}
            onClick={() => setN(g.chiave)}
            title={g.giocata
              ? `${g.titolo} · ${teamName(g.avversario)} ${g.gol}-${g.golSubiti}`
              : `${g.titolo} · non giocata`}>
      {g.breve}
    </button>
  )

  const scelte = (
    <>
      <Barra>
        {stagioni.length > 1 && (
          <Campo etichetta="Stagione">
            <select value={stagione ?? ''} onChange={(e) => setStagione(e.target.value)}>
              {stagioni.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Campo>
        )}
        <div className="fo-legenda">
          <span className="pt e-V" /> vinta
          <span className="pt e-N" /> pari
          <span className="pt e-P" /> persa
        </div>
      </Barra>
      <div className="scelta-giornata">
        {giornate.map((g) => <Tasto key={g.chiave} g={g} />)}
      </div>
      {turniCoppa.length > 0 && (
        <div className="scelta-giornata coppe">
          {turniCoppa.map((t) => <Tasto key={t.chiave} g={t} />)}
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

  if (guasto) {
    return <>{testa}<p className="guasto">Non riesco a leggere l'archivio: {guasto}.</p></>
  }
  if (n == null) {
    return <>{testa}{scelte}<p className="vuoto">Carico la stagione…</p></>
  }
  if (!p) return <>{testa}{scelte}<p className="vuoto">Carico la giornata…</p></>

  const avversario = getTeam(p.avversario)
  const campo = disponi(p.mia.titolari, p.mia.modulo)
  const { entrati, assenti } = schierati(p.mia)
  const bonus = contaBonus(p.mia)
  const esito = p.gol > p.golSubiti ? 'V' : p.gol === p.golSubiti ? 'N' : 'P'
  const senzaFormazione = p.mia.titolari.length === 0

  /* Il voto medio si fa sui titolari che hanno giocato: contare come zero chi
     e' uscito dal campo abbasserebbe la media di una cosa che non e' successa. */
  const votiVeri = p.mia.titolari.filter((g) => g.voto != null).map((g) => g.voto)
  const votoMedio = votiVeri.length
    ? (votiVeri.reduce((a, b) => a + b, 0) / votiVeri.length).toFixed(2) : null
  const modTot = p.mia.modificatori.reduce((a, m) => a + m.valore, 0)

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

      {/* Il riassunto della giornata prima del dettaglio: quattro numeri che
          rispondono a «com'e' andata» senza dover leggere il campo. */}
      <Schede>
        <Scheda etichetta="Fantapunti" valore={p.fp}
                sotto={`avversario ${p.fpAvversario}`} />
        <Scheda etichetta="Risultato" valore={`${p.gol}-${p.golSubiti}`}
                sotto={esito === 'V' ? 'vinta' : esito === 'N' ? 'pareggiata' : 'persa'} />
        {!senzaFormazione && (
          <Scheda etichetta="Voto medio" valore={votoMedio ?? '—'}
                  sotto={`${p.mia.titolari.length} titolari`} />
        )}
        {!senzaFormazione && (
          <Scheda etichetta="Modificatori" valore={modTot > 0 ? `+${modTot}` : modTot}
                  sotto={p.mia.modificatori.length
                    ? `${p.mia.modificatori.length} in gioco` : 'nessuno'} />
        )}
      </Schede>

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
              {/* Le righe del campo, con le misure vere in proporzione: area
                  di rigore 40,3 m su 68 di larghezza e 16,5 su 100 di
                  profondita', area piccola 18,32 x 5,5, dischetto a 11 m,
                  cerchio di raggio 9,15. Le mezzelune sono un cerchio dello
                  stesso raggio centrato sul dischetto: quello che sborda
                  dall'area e' l'arco che si vede sul campo vero. */}
              <div className="linee" aria-hidden="true">
                <span className="meta" />
                <span className="cerchio" />
                <span className="dischetto-meta" />
                <span className="area area-giu" />
                <span className="area area-su" />
                <span className="piccola piccola-giu" />
                <span className="piccola piccola-su" />
                <span className="dischetto dischetto-giu" />
                <span className="dischetto dischetto-su" />
                <span className="mezzaluna luna-giu" />
                <span className="mezzaluna luna-su" />
                <span className="porta porta-giu" />
                <span className="porta porta-su" />
                <i className="angolo a-sg" /><i className="angolo a-sd" />
                <i className="angolo a-ig" /><i className="angolo a-id" />
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
                      <span className={`b b-${b.id}`}><Icona id={b.id} /></span>
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
