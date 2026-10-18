import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import { laMiaConsegna, inviaFormazione, salvaBozzaFormazione, prossimoImpegno } from '../../lib/archivio'
import { teamName } from '../../lib/core'
import { problemiFormazione } from '../../lib/consegna'
import './Schiera.css'

const dataOra = (v) => new Date(v).toLocaleString('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'short' })

export default function Schiera() {
  const { sessione, inVisita } = useAuth()
  // Rimonta l'editor al cambio societa': nessuna bozza passa a un altro mister.
  return <Editor key={`${sessione.team}-${inVisita}`} inVisita={inVisita} />
}

function Editor({ inVisita }) {
  const [dati, setDati] = useState(null)
  const [bozza, setBozza] = useState({ modulo: '', titolari: [], panchina: [] })
  const [errore, setErrore] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [occupato, setOccupato] = useState(false)
  const [carica, setCarica] = useState(0)
  const [tempo, setTempo] = useState(0)
  const [scarto, setScarto] = useState(0)
  const [modificata, setModificata] = useState(false)
  useEffect(() => {
    if (inVisita) return undefined
    let vivo = true
    laMiaConsegna().then(async (d) => {
      if (d.stagione) {
        // Un guasto al calendario non impedisce di recuperare la propria bozza.
        try { d.impegno = await prossimoImpegno(d.stagione, d.societa) }
        catch { d.calendarioNonDisponibile = true }
      }
      if (!vivo) return
      setDati(d)
      setBozza(d.consegna ?? d.bozza ?? { modulo: d.regole?.moduli_ammessi?.[0] ?? '', titolari: [], panchina: [] })
      setModificata(false)
      setScarto(d.ora_server ? new Date(d.ora_server).getTime() - Date.now() : 0)
      setTempo(Date.now())
    }).catch((e) => vivo && setErrore(e.message))
    return () => { vivo = false }
  }, [carica, inVisita])
  useEffect(() => {
    const timer = setInterval(() => setTempo(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  useEffect(() => {
    if (!modificata) return undefined
    const avvisa = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', avvisa)
    return () => window.removeEventListener('beforeunload', avvisa)
  }, [modificata])

  function ricarica() {
    setDati(null); setErrore(''); setMessaggio(''); setModificata(false)
    setCarica((n) => n + 1)
  }

  const testa = <header><h1>Schiera formazione</h1><p>Scegli i titolari e l’ordine della panchina.</p><Link to="/area/formazioni">Consulta le formazioni storiche</Link></header>
  if (inVisita) return <>{testa}<p>Per inviare la formazione torna alla tua società dal menu laterale.</p></>
  if (!dati) return <>{testa}{errore ? <p role="alert">{errore} <button onClick={ricarica}>Riprova</button></p> : <p>Carico il prossimo turno…</p>}</>
  if (!dati.turno && !dati.rosa?.length) return <>{testa}<section className="pannello card"><h2>Rosa corrente non disponibile</h2><p>Non è ancora stata caricata la rosa della tua società per la stagione aperta.</p><button onClick={ricarica}>Controlla di nuovo</button></section></>

  const { turno, rosa, regole, consegna } = dati
  const preparazione = !turno
  const chiusa = !preparazione && (!turno.aperto || tempo + scarto >= new Date(turno.scadenza).getTime())
  const problemi = problemiFormazione(rosa, regole, bozza.modulo, bozza.titolari, bozza.panchina)
  const bloccata = chiusa || occupato
  const trova = (id) => rosa.find((g) => g.id === id)
  function cambia(nuova) { setBozza(nuova); setModificata(true); setMessaggio(''); setErrore('') }
  function assegna(id, dove) {
    cambia({ ...bozza, titolari: bozza.titolari.filter((x) => x !== id), panchina: bozza.panchina.filter((x) => x !== id),
      ...(dove ? { [dove]: [...bozza[dove].filter((x) => x !== id), id] } : {}) })
  }
  function sposta(i, delta) {
    const panchina = [...bozza.panchina]
    ;[panchina[i], panchina[i + delta]] = [panchina[i + delta], panchina[i]]
    cambia({ ...bozza, panchina })
  }
  async function invia(e) {
    e.preventDefault()
    if (bloccata || problemi.length) return
    setOccupato(true); setErrore(''); setMessaggio('')
    try {
      const salvata = preparazione
        ? await salvaBozzaFormazione(dati.stagione, bozza, dati.bozza?.revisione ?? 0)
        : await inviaFormazione(turno.id, bozza, consegna?.revisione ?? 0)
      setDati((d) => ({ ...d, [preparazione ? 'bozza' : 'consegna']: salvata }))
      setModificata(false)
      setMessaggio(preparazione
        ? `Bozza salvata il ${dataOra(salvata.aggiornata)}. Non è una consegna ufficiale.`
        : `Formazione inviata il ${dataOra(salvata.inviata)}. Puoi modificarla fino alla scadenza.`)
    } catch (err) { setErrore(err.message) }
    finally { setOccupato(false) }
  }
  return <div className="schiera">{testa}
    <section className="pannello card schiera-turno">
      <h2>{preparazione ? `${dati.stagione} · ${dati.impegno ? `Giornata ${dati.impegno.giornata} · Preparazione` : 'Prepara la formazione'}` : `${turno.stagione} · Giornata ${turno.giornata}`}</h2>
      {dati.impegno && <p>{teamName(dati.impegno.casa)} – {teamName(dati.impegno.fuori)}</p>}
      {dati.calendarioNonDisponibile && <p>Il calendario non è disponibile. La tua rosa e la bozza restano utilizzabili.</p>}
      {preparazione ? <p>Puoi preparare e salvare la bozza. La scadenza ufficiale non è ancora pubblicata: <strong>la bozza non vale come consegna ufficiale.</strong></p>
        : <p>Scadenza: <strong>{dataOra(turno.scadenza)}</strong> (ora italiana). Tutta la formazione si blocca cinque minuti prima della prima partita della giornata di Serie A.</p>}
      <p role="status">{chiusa ? 'Consegna chiusa.' : modificata ? 'Hai modifiche non salvate.' : preparazione ? (dati.bozza ? `Ultima bozza: ${dataOra(dati.bozza.aggiornata)}` : 'Nessuna bozza salvata.') : consegna ? `Ultimo invio: ${dataOra(consegna.inviata)}` : 'Formazione ancora da inviare.'}</p>
    </section>
    <form onSubmit={invia}>
      <fieldset disabled={bloccata}>
        <legend>Modulo e convocati</legend>
        <div className="schiera-modulo"><label htmlFor="schiera-modulo">Modulo</label><select id="schiera-modulo" value={bozza.modulo} onChange={(e) => cambia({ ...bozza, modulo: e.target.value })}>
          {(regole?.moduli_ammessi ?? []).map((m) => <option key={m}>{m}</option>)}
        </select></div>
        <div className="schiera-griglia">
          <section className="pannello card"><h2>La tua rosa</h2>
            {!rosa.length && <p>La rosa di questa stagione non è ancora disponibile. Contatta la Presidenza.</p>}
            {['P', 'D', 'C', 'A'].map((ruolo) => <div key={ruolo}>
              <h3>{{ P: 'Portieri', D: 'Difensori', C: 'Centrocampisti', A: 'Attaccanti' }[ruolo]}</h3>
              {rosa.filter((g) => g.ruolo === ruolo).map((g) => <label className="schiera-giocatore" key={g.id}>
                <span><strong>{g.nome}</strong><small>{g.club}</small></span>
                <select aria-label={`Convocazione ${g.nome}`} value={bozza.titolari.includes(g.id) ? 'titolari' : bozza.panchina.includes(g.id) ? 'panchina' : ''} onChange={(e) => assegna(g.id, e.target.value)}>
                  <option value="">Non convocato</option><option value="titolari">Titolare</option><option value="panchina">Panchina</option>
                </select>
              </label>)}
            </div>)}
          </section>
          <div><section className="pannello card"><h2>Titolari · {bozza.titolari.length}/11</h2>
            <div className="schiera-campo" aria-label={`Campo con modulo ${bozza.modulo}`}>
              {['A', 'C', 'D', 'P'].map((r) => <div className="schiera-reparto" key={r}>{bozza.titolari.filter((id) => trova(id)?.ruolo === r).map((id) => <span key={id}><b>{r}</b>{trova(id)?.nome}</span>)}</div>)}
            </div>
          </section>
          <section className="pannello card"><h2>Panchina · {bozza.panchina.length}/{regole?.panchinari ?? '—'}</h2>
            <p>L’ordine indica la priorità delle riserve. Le sostituzioni verranno calcolate secondo il regolamento.</p>
            <ol className="schiera-panchina">{bozza.panchina.map((id, i) => <li key={id}>
              <span>{trova(id)?.ruolo} · {trova(id)?.nome ?? 'Giocatore non più in rosa'}</span>
              <button type="button" disabled={i === 0} aria-label={`Alza priorità ${trova(id)?.nome}`} onClick={() => sposta(i, -1)}>↑</button>
              <button type="button" disabled={i === bozza.panchina.length - 1} aria-label={`Abbassa priorità ${trova(id)?.nome}`} onClick={() => sposta(i, 1)}>↓</button>
            </li>)}</ol>
          </section></div>
        </div>
      </fieldset>
      {problemi.length > 0 && <ul className="schiera-problemi">{problemi.map((p) => <li key={p}>{p}</li>)}</ul>}
      {errore && <p role="alert">{errore}</p>}
      <p role="status">{messaggio}</p>
      <div className="schiera-invio"><button type="submit" disabled={bloccata || problemi.length > 0}>{occupato ? 'Salvataggio in corso…' : preparazione ? 'Salva bozza' : consegna ? 'Aggiorna formazione' : 'Invia formazione'}</button>
        <button type="button" disabled={occupato} onClick={ricarica}>{modificata ? 'Scarta modifiche e rileggi' : 'Rileggi dal server'}</button>
      </div>
    </form>
  </div>
}
