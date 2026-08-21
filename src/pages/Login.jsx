import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { capreraLogo } from '../lib/core'
import { useAuth } from '../lib/auth'
import './Login.css'

/**
 * La Tessera del Tifoso.
 *
 * Tre cose in una pagina sola, perche' sono tre momenti della stessa
 * faccenda e mandare la gente su tre pagine diverse per fare la stessa cosa
 * e' un modo per perderla: entrare, farsi la password la prima volta,
 * rifarsela quando la si dimentica.
 *
 * L'email non e' una scelta: e' quella di Fantapazz, quella su cui la
 * Presidenza ha intestato la tessera. Se ne scrivi un'altra entri lo stesso,
 * ma non vedi nessuna societa' - e la pagina te lo dice con parole sue,
 * invece di fingere un errore.
 */
const MODI = {
  entra: { titolo: 'Entra', bottone: 'Entra' },
  primo: { titolo: 'Prima volta', bottone: 'Crea la password' },
  perso: { titolo: 'Password dimenticata', bottone: 'Mandami il collegamento' },
}

export default function Login() {
  const { entra, registrati, recupera, sessione, utente, pronto,
          recupero, cambiaPassword } = useAuth()
  const nav = useNavigate()

  const [modo, setModo] = useState('entra')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState(null)
  const [avviso, setAvviso] = useState(null)
  const [attesa, setAttesa] = useState(false)

  /*
   * Se la tessera e' valida si va dentro, senza far premere altro.
   *
   * Tranne quando si arriva da un collegamento di recupero: li' la sessione
   * c'e' gia', ma lasciar passare vorrebbe dire rimandare dentro qualcuno con
   * la stessa password che non ricorda. Prima se ne sceglie una nuova.
   */
  useEffect(() => {
    if (sessione && !recupero) nav('/area', { replace: true })
  }, [sessione, recupero, nav])

  if (recupero) return <NuovaPassword cambia={cambiaPassword} email={utente?.email} />


  async function invia(e) {
    e.preventDefault()
    setErrore(null); setAvviso(null); setAttesa(true)
    const m = modo === 'entra' ? await entra(email, password)
      : modo === 'primo' ? await registrati(email, password)
      : await recupera(email)
    setAttesa(false)
    if (m) { setErrore(m); return }
    if (modo === 'primo') {
      setAvviso('Ti abbiamo mandato un messaggio: apri il collegamento per confermare l’email, poi torna qui ed entra.')
    }
    if (modo === 'perso') {
      setAvviso('Se quell’email è registrata, ti arriva un messaggio per rifare la password.')
    }
  }

  /* Registrato ma senza tessera: ha un account e nessuna societa'. */
  if (pronto && utente && !sessione) {
    return (
      <div className="page container login-page">
        <div className="login-box card">
          <img src={capreraLogo} alt="" className="login-crest" />
          <p className="eyebrow">Tessera del Tifoso</p>
          <h1>Non risulti tesserato</h1>
          <p className="login-testo">
            L’accesso ha funzionato, ma a <strong>{utente.email}</strong> non è
            ancora abbinata nessuna società. La tessera la emette la Presidenza,
            e la intesta all’email che hai su Fantapazz: se ti sei registrato con
            un indirizzo diverso, è probabilmente quello il motivo.
          </p>
          <p className="login-testo">
            Scrivi alla Presidenza dicendo quale email hai usato, e la tessera
            si attiva da sola al prossimo accesso.
          </p>
          <button className="btn btn-ghost login-go" onClick={() => nav('/')}>
            Torna al sito
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page container login-page">
      <div className="login-box card">
        <img src={capreraLogo} alt="" className="login-crest" />
        <p className="eyebrow">Tessera del Tifoso</p>
        <h1>{MODI[modo].titolo}</h1>

        <p className="login-testo">
          Usa l’email con cui giochi su Fantapazz: è quella su cui la Presidenza
          ha intestato la tua tessera. La password la scegli tu.
        </p>

        <form onSubmit={invia}>
          <label className="campo">
            <span>Email</span>
            <input type="email" value={email} required autoComplete="username"
                   placeholder="quella di Fantapazz"
                   onChange={(e) => setEmail(e.target.value)} />
          </label>

          {modo !== 'perso' && (
            <label className="campo">
              <span>Password{modo === 'primo' && ' — almeno sei caratteri'}</span>
              <input type="password" value={password} required minLength={6}
                     autoComplete={modo === 'primo' ? 'new-password' : 'current-password'}
                     onChange={(e) => setPassword(e.target.value)} />
            </label>
          )}

          {errore && <p className="login-errore">{errore}</p>}
          {avviso && <p className="login-avviso">{avviso}</p>}

          <button type="submit" className="btn btn-primary login-go" disabled={attesa}>
            {attesa ? 'Un momento…' : MODI[modo].bottone}
          </button>
        </form>

        <div className="login-alt">
          {modo !== 'entra' && (
            <button type="button" onClick={() => { setModo('entra'); setErrore(null); setAvviso(null) }}>
              Ho già la password
            </button>
          )}
          {modo !== 'primo' && (
            <button type="button" onClick={() => { setModo('primo'); setErrore(null); setAvviso(null) }}>
              È la prima volta
            </button>
          )}
          {modo !== 'perso' && (
            <button type="button" onClick={() => { setModo('perso'); setErrore(null); setAvviso(null) }}>
              Ho dimenticato la password
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Arrivo da un collegamento di recupero: scelgo la password nuova.
 *
 * Non chiede quella vecchia — sarebbe assurdo, e' esattamente quella che non
 * si ricorda — e non chiede l'email: la sessione del collegamento dice gia'
 * chi e'. Si limita a farla scrivere due volte, perche' l'unica cosa peggiore
 * di aver perso la password e' averne appena impostata una con un refuso.
 */
function NuovaPassword({ cambia, email }) {
  const nav = useNavigate()
  const [una, setUna] = useState('')
  const [due, setDue] = useState('')
  const [errore, setErrore] = useState(null)
  const [attesa, setAttesa] = useState(false)

  async function invia(e) {
    e.preventDefault()
    setErrore(null)
    if (una.length < 6) return setErrore('Servono almeno sei caratteri.')
    if (una !== due) return setErrore('Le due password non coincidono.')
    setAttesa(true)
    const m = await cambia(una)
    setAttesa(false)
    if (m) return setErrore(m)
    nav('/area', { replace: true })
  }

  return (
    <div className="page container login-page">
      <div className="login-box card">
        <img src={capreraLogo} alt="" className="login-crest" />
        <p className="eyebrow">Tessera del Tifoso</p>
        <h1>Scegli la password</h1>

        <p className="login-testo">
          Il collegamento ha funzionato{email && <> per <strong>{email}</strong></>}.
          Scegli adesso la password: da qui in avanti entri con quella, senza
          passare dalla posta.
        </p>

        <form onSubmit={invia}>
          <label className="campo">
            <span>Nuova password — almeno sei caratteri</span>
            <input type="password" value={una} required minLength={6}
                   autoComplete="new-password" autoFocus
                   onChange={(e) => { setUna(e.target.value); setErrore(null) }} />
          </label>
          <label className="campo">
            <span>Ripetila</span>
            <input type="password" value={due} required minLength={6}
                   autoComplete="new-password"
                   onChange={(e) => { setDue(e.target.value); setErrore(null) }} />
          </label>

          {errore && <p className="login-errore">{errore}</p>}

          <button type="submit" className="btn btn-primary login-go" disabled={attesa}>
            {attesa ? 'Un momento…' : 'Salva ed entra'}
          </button>
        </form>
      </div>
    </div>
  )
}
