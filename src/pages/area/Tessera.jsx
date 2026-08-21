import { useEffect, useState } from 'react'
import { useAuth } from '../../lib/auth'
import { getTeam, logoUrl } from '../../lib/core'
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
          <Cartellino team={team} scheda={scheda} sessione={sessione}
                      email={utente?.email} incarichi={incarichi} />
        </Voce>

        <Voce>
          {errore
            ? <p className="guasto">Non riesco a leggere la tua scheda: {errore}.</p>
            : <Anagrafica scheda={scheda} setScheda={setScheda} dopo={ricarica} />}
        </Voce>

        <Voce><Password cambia={cambiaPassword} /></Voce>
      </Cascata>
    </Pagina>
  )
}

/* ------------------------------------------------------------ il cartellino */

/**
 * Il lato che non si modifica: società, incarichi, email.
 *
 * Sta in cima e somiglia a una tessera vera perché è la risposta alla
 * domanda che uno si fa aprendo questa pagina — "cosa sono io, qui dentro".
 */
function Cartellino({ team, scheda, sessione, email, incarichi }) {
  const oltre = incarichi.filter((i) => i.incarico !== 'mister')

  return (
    <section className="cartellino card" style={{ '--accent': team.color }}>
      <div className="cart-testa">
        <img src={logoUrl(team)} alt="" />
        <div>
          <strong>{team.name}</strong>
          <span>{scheda?.soprannome || nomeIntero(scheda) || sessione.mister}</span>
        </div>
      </div>

      <dl className="cart-dati">
        <div>
          <dt>Email</dt>
          <dd className="mono">{email ?? '—'}</dd>
        </div>
        <div>
          <dt>Incarichi</dt>
          <dd className="cart-incarichi">
            {oltre.length === 0
              ? <span className="targhetta">Mister</span>
              : oltre.map((i) => (
                  <span key={i.incarico} className={`targhetta ${i.vede_tutto ? 'alta' : ''}`}>
                    {i.nome}
                  </span>
                ))}
          </dd>
        </div>
      </dl>

      <p className="cart-nota">
        Società e incarichi li assegna la Presidenza. Se qualcosa qui è
        sbagliato, scrivile: da questa pagina non si cambiano.
      </p>
    </section>
  )
}

/* ------------------------------------------------------------- l'anagrafica */

function Anagrafica({ scheda, setScheda, dopo }) {
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

      <div className="campi">
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

function Campo({ etichetta, aiuto, ...resto }) {
  return (
    <label className="campo">
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
