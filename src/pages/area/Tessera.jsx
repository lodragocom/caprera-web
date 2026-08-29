import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl, federazioneStemma } from '../../lib/core'
import { laMiaScheda, salvaLaMiaScheda } from '../../lib/archivio'
import { Pagina, Cascata, Voce } from '../../components/moto'
import './Tessera.css'

/**
 * La Tessera del Tifoso.
 *
 * Qui il mister vede chi è per la Federazione e cambia le sole cose che gli
 * appartengono: come si chiama, come lo si chiama, come lo si raggiunge, e la
 * password. La società e gli incarichi no: quelli li assegna la Presidenza, e
 * si vedono ma non si toccano — anche il database la pensa così, quindi non è
 * una gentilezza di questa pagina.
 *
 * Il link della videochiamata è il dettaglio meno vistoso e il più usato:
 * la sera dell'asta è quello che decide se si comincia alle 21 o alle 21 e
 * venti, e finora viveva in dieci messaggi diversi su WhatsApp.
 */

const VUOTA = { nome: '', cognome: '', soprannome: '', telefono: '', videochiamata: '' }

export default function Tessera() {
  const { sessione, utente, incarichi, cambiaPassword, ricarica } = useAuth()
  // `miaSocieta`, non `team`: questa pagina parla di me. Se sto guardando
  // l'area di un'altra società, la mia tessera resta la mia.
  const team = getTeam(sessione.miaSocieta)

  const [scheda, setScheda] = useState(null)
  const [errore, setErrore] = useState(null)

  useEffect(() => {
    let vivo = true
    laMiaScheda()
      .then((d) => vivo && setScheda({ ...VUOTA, ...pulita(d) }))
      .catch((e) => vivo && setErrore(e.message))
    return () => { vivo = false }
  }, [])

  return (
    <Pagina>
      <header>
        <p className="eyebrow">Tessera del Tifoso</p>
        <h1>{titolo(scheda, sessione)}</h1>
      </header>

      <Cascata className="tess-griglia">
        <Voce>
          <Tesserino team={team} scheda={scheda} sessione={sessione}
                     email={utente?.email} incarichi={incarichi} />
          <p className="tess-nota">
            Società e incarichi li assegna la Presidenza. Se qualcosa qui è
            sbagliato, scrivile: da questa pagina non si cambiano.
          </p>
        </Voce>

        <Voce>
          {errore
            ? <p className="guasto">Non riesco a leggere la tua scheda: {errore}.</p>
            : <Anagrafica scheda={scheda} setScheda={setScheda} dopo={ricarica}
                          team={team} email={utente?.email} />}
        </Voce>

        <Voce><Password cambia={cambiaPassword} /></Voce>
      </Cascata>
    </Pagina>
  )
}

/* --------------------------------------------------------------- la tessera */

/**
 * La tessera vera e propria: il lato che non si modifica.
 *
 * Non e' un altro riquadro con una striscia colorata a sinistra — e' una
 * tessera: la banda della Federazione in alto, il colore sociale, i numeri
 * che dicono da quanto uno sta qui, e in fondo la riga in mono con l'email,
 * che su una tessera vera sarebbe la banda magnetica.
 *
 * I numeri non sono inventati: «in lega dal» e «stagioni» vengono da
 * `teams.json`, che elenca le stagioni giocate da ogni societa'; gli scudetti
 * dalla stessa fonte dell'albo d'oro. Se una societa' non ha ancora giocato,
 * il posto resta vuoto invece di mostrare uno zero che sembra un risultato.
 */
function Tesserino({ team, scheda, sessione, email, incarichi }) {
  const oltre = incarichi.filter((i) => i.incarico !== 'mister')
  const stagioni = team?.seasons ?? []
  const dal = stagioni.length ? String(stagioni[0]).slice(0, 4) : null
  const scudetti = team?.titles?.length ?? 0
  const logo = logoUrl(team)
  const chiamato = scheda?.soprannome || nomeIntero(scheda) || sessione.mister || '—'
  const anagrafico = nomeIntero(scheda)

  return (
    <section
      className="tessera"
      style={team?.color ? { '--accent': team.color } : undefined}
    >
      <div className="tess-banda">
        <img src={federazioneStemma} alt="" />
        <div className="tess-ente">
          <b>Federazione Caprera</b>
          <span>Tessera del Tifoso</span>
        </div>
        {team?.code && <span className="tess-sigla">{team.code}</span>}
      </div>

      <div className="tess-corpo">
        {logo
          ? <img className="tess-logo" src={logo} alt="" />
          : <span className="tess-logo tess-logo-vuoto" aria-hidden="true" />}
        <div className="tess-nomi">
          <strong>{chiamato}</strong>
          {anagrafico && anagrafico !== chiamato && <span>{anagrafico}</span>}
          <em>{team?.name ?? 'Società non assegnata'}</em>
        </div>
      </div>

      <dl className="tess-cifre">
        <div>
          <dt>In lega dal</dt>
          <dd>{dal ?? '—'}</dd>
        </div>
        <div>
          <dt>Stagioni</dt>
          <dd>{stagioni.length || '—'}</dd>
        </div>
        <div>
          <dt>Scudetti</dt>
          <dd className={scudetti ? 'oro' : ''}>{scudetti || '—'}</dd>
        </div>
      </dl>

      <div className="tess-incarichi">
        {oltre.length === 0
          ? <span className="targhetta">Mister</span>
          : oltre.map((i) => (
              <span key={i.incarico} className={`targhetta ${i.vede_tutto ? 'alta' : ''}`}>
                {i.nome}
              </span>
            ))}
      </div>

      <p className="tess-firma">{email ?? '—'}</p>
    </section>
  )
}

/* ------------------------------------------------------------- l'anagrafica */

function Anagrafica({ scheda, setScheda, dopo, team, email }) {
  const [stato, setStato] = useState(null)   // null | 'salvo' | 'fatto' | messaggio
  const [sporca, setSporca] = useState(false)

  if (!scheda) return <section className="card pannello"><p className="vuoto">Carico la scheda…</p></section>

  const campo = (k) => ({
    value: scheda[k] ?? '',
    onChange: (e) => { setScheda({ ...scheda, [k]: e.target.value }); setSporca(true); setStato(null) },
  })

  async function salva(e) {
    e.preventDefault()
    const link = String(scheda.videochiamata ?? '').trim()
    if (link && !/^https?:\/\/\S+$/i.test(link)) {
      setStato('Il link della videochiamata deve cominciare con http:// o https://')
      return
    }
    setStato('salvo')
    try {
      await salvaLaMiaScheda(scheda)
      const fresca = await laMiaScheda()
      setScheda({ ...VUOTA, ...pulita(fresca) })
      setSporca(false)
      setStato('fatto')
      await dopo()
    } catch (err) {
      setStato(err.message)
    }
  }

  return (
    <form className="card pannello" onSubmit={salva}>
      <h2>I tuoi dati</h2>
      <p className="pannello-sub">
        Il soprannome è quello che comparirà nelle cronache e nei tabelloni.
      </p>

      {/*
        I primi due campi non si scrivono: nascono quando la Presidenza crea
        l'accesso e vivono in un'altra tabella (`misteri` la societa',
        `auth.users` l'email). Stanno qui lo stesso, in chiaro e con lo stesso
        aspetto degli altri, perche' la domanda «con che squadra e con che
        indirizzo sono dentro?» e' la prima che uno si fa aprendo questa
        pagina — e prima la risposta non c'era da nessuna parte.
      */}
      <div className="campi">
        <Campo etichetta="Società" value={team?.name ?? '—'} readOnly bloccato
               aiuto="La assegna la Presidenza" />
        <Campo etichetta="Email" value={email ?? '—'} readOnly bloccato
               aiuto="È anche il nome con cui entri" />
        <Campo etichetta="Nome" {...campo('nome')} autoComplete="given-name" />
        <Campo etichetta="Cognome" {...campo('cognome')} autoComplete="family-name" />
        <Campo etichetta="Soprannome" {...campo('soprannome')}
               aiuto="Come ti chiamano in lega" />
        <Campo etichetta="Telefono" {...campo('telefono')} type="tel"
               autoComplete="tel" aiuto="Lo vedono solo tu e la Presidenza" />
      </div>

      {/*
        Non `type="url"`: la validazione del browser blocca l'invio e mostra
        un fumetto suo, in inglese e che sparisce da solo. Meglio lasciare
        arrivare il modulo fin qui e dire in italiano cosa manca.
      */}
      <Campo etichetta="Link per la videochiamata dell'asta" {...campo('videochiamata')}
             type="text" inputMode="url" placeholder="https://meet.google.com/…"
             aiuto="La stanza da cui ti colleghi la sera dell'asta" />

      <div className="riga-azioni">
        <button className="btn-oro" disabled={stato === 'salvo' || !sporca}>
          {stato === 'salvo' ? 'Salvo…' : 'Salva'}
        </button>
        <Esito stato={stato} fatto="Scheda aggiornata." />
      </div>
    </form>
  )
}

/* --------------------------------------------------------------- password */

/**
 * Il cambio password.
 *
 * Chiede la nuova due volte e non chiede quella vecchia: chi è arrivato fin
 * qui ha già una sessione valida, e fingere un controllo in più darebbe
 * l'idea di una sicurezza che non c'è. Se la sessione non fosse sua, il
 * problema sarebbe successo molto prima di questo modulo.
 */
function Password({ cambia }) {
  const [una, setUna] = useState('')
  const [due, setDue] = useState('')
  const [stato, setStato] = useState(null)

  async function invia(e) {
    e.preventDefault()
    if (una.length < 6) return setStato('La password è troppo corta: servono almeno sei caratteri.')
    if (una !== due) return setStato('Le due password non coincidono.')
    setStato('salvo')
    const err = await cambia(una)
    if (err) return setStato(err)
    setUna(''); setDue(''); setStato('fatto')
  }

  return (
    <form className="card pannello" onSubmit={invia}>
      <h2>Password</h2>
      <p className="pannello-sub">
        La scegli tu e la Federazione non la conosce: se la perdi si
        reimposta dalla pagina d’accesso.
      </p>

      <div className="campi">
        <Campo etichetta="Nuova password" type="password" autoComplete="new-password"
               value={una} onChange={(e) => { setUna(e.target.value); setStato(null) }} />
        <Campo etichetta="Ripetila" type="password" autoComplete="new-password"
               value={due} onChange={(e) => { setDue(e.target.value); setStato(null) }} />
      </div>

      <div className="riga-azioni">
        <button className="btn-oro" disabled={stato === 'salvo' || !una}>
          {stato === 'salvo' ? 'Cambio…' : 'Cambia password'}
        </button>
        <Esito stato={stato} fatto="Password cambiata." />
      </div>
    </form>
  )
}

/* ------------------------------------------------------------- minuteria */

function Campo({ etichetta, aiuto, bloccato = false, ...resto }) {
  return (
    <label className={`campo${bloccato ? ' bloccato' : ''}`}>
      <span>{etichetta}</span>
      <input {...resto} />
      {aiuto && <em>{aiuto}</em>}
    </label>
  )
}

/** Un solo posto per dire com'è andata, in tre modi diversi. */
function Esito({ stato, fatto }) {
  if (!stato || stato === 'salvo') return null
  if (stato === 'fatto') return <p className="esito ok" role="status">{fatto}</p>
  return <p className="esito no" role="alert">{stato}</p>
}

/** Il database restituisce `null`; i campi di testo vogliono `''`. */
function pulita(d = {}) {
  const o = {}
  for (const k of Object.keys(VUOTA)) o[k] = d[k] ?? ''
  return o
}

function nomeIntero(s) {
  return [s?.nome, s?.cognome].filter(Boolean).join(' ').trim()
}

function titolo(scheda, sessione) {
  return nomeIntero(scheda) || sessione.mister || 'La tua tessera'
}
