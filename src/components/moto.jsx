import { motion, useReducedMotion, animate } from 'motion/react'
import { useEffect, useState } from 'react'
import './moto.css'

/**
 * Il vocabolario del movimento.
 *
 * Poche parole usate ovunque, invece di effetti sparsi pagina per pagina.
 * Un sito si muove bene quando il movimento e' prevedibile: la stessa cosa
 * entra sempre allo stesso modo, e chi guarda smette di accorgersene.
 *
 * Tre principi, che qui sono codice e non buone intenzioni:
 *
 * - **Il movimento spiega, non decora.** Le righe di una classifica entrano
 *   dall'alto verso il basso perche' e' l'ordine in cui si leggono. I numeri
 *   salgono perche' stanno contando.
 * - **Corto.** Niente sopra i 400 ms. Un'animazione che si nota due volte
 *   e' gia' troppo lunga.
 * - **Chi ha chiesto di non muovere niente, non vede niente.** Il sistema
 *   operativo ha un'impostazione per ridurre le animazioni: qui si rispetta
 *   sempre, senza eccezioni. Non e' un vezzo di accessibilita', e' che a
 *   qualcuno il movimento fa venire il mal di testa.
 */

/* Le curve. Una sola per le entrate, una per le uscite. */
const ENTRA = { duration: 0.34, ease: [0.22, 0.61, 0.36, 1] }
const ESCE = { duration: 0.16, ease: [0.4, 0, 1, 1] }

/** La pagina intera: entra salendo di poco, esce sparendo. */
export function Pagina({ children, className = '' }) {
  const fermo = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={fermo ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={fermo ? { duration: 0 } : ENTRA}
    >
      {children}
    </motion.div>
  )
}

/**
 * Una lista che si scopre a cascata.
 *
 * Il ritardo fra un elemento e il successivo e' piccolo e ha un tetto: con
 * dieci righe si nota, con centottanta partite diventerebbe un'attesa, quindi
 * oltre le venti la cascata si spegne da sola.
 */
export function Cascata({ children, className = '', passo = 0.028, tetto = 20 }) {
  const fermo = useReducedMotion()
  const quanti = Array.isArray(children) ? children.length : 1
  const vero = quanti > tetto ? 0 : passo
  return (
    <motion.div
      className={className}
      initial="chiuso"
      animate="aperto"
      variants={{ aperto: { transition: { staggerChildren: fermo ? 0 : vero } } }}
    >
      {children}
    </motion.div>
  )
}

/** Un elemento dentro una Cascata. */
export function Voce({ children, className = '', ...resto }) {
  const fermo = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        chiuso: fermo ? { opacity: 1 } : { opacity: 0, y: 8 },
        aperto: { opacity: 1, y: 0, transition: ENTRA },
      }}
      {...resto}
    >
      {children}
    </motion.div>
  )
}

/** Come Voce, ma per le righe di una tabella (un div romperebbe il tbody). */
export function Riga({ children, className = '', ...resto }) {
  const fermo = useReducedMotion()
  return (
    <motion.tr
      className={className}
      variants={{
        chiuso: fermo ? { opacity: 1 } : { opacity: 0, y: 6 },
        aperto: { opacity: 1, y: 0, transition: ENTRA },
      }}
      {...resto}
    >
      {children}
    </motion.tr>
  )
}

/** Il corpo di una tabella che si scopre a cascata. */
export function CorpoTabella({ children, passo = 0.02, tetto = 24 }) {
  const fermo = useReducedMotion()
  const quanti = Array.isArray(children) ? children.length : 1
  return (
    <motion.tbody
      initial="chiuso"
      animate="aperto"
      variants={{ aperto: { transition: { staggerChildren: fermo || quanti > tetto ? 0 : passo } } }}
    >
      {children}
    </motion.tbody>
  )
}

/**
 * Un numero che sale fino al suo valore.
 *
 * Sale solo se e' abbastanza grande da rendere la salita leggibile: far
 * salire un "3" e' un tic nervoso, non un'animazione.
 *
 * La prima versione partiva solo quando il numero entrava nello schermo, e
 * faceva una cosa inaccettabile: le righe sotto la piega restavano a **zero**
 * finche' non ci scorrevi sopra. Un numero puo' arrivare in ritardo, non puo'
 * essere sbagliato. Adesso parte subito: chi lo vede lo vede salire, chi non
 * lo vede lo trova gia' giusto quando ci arriva.
 */
export function Numero({ valore, decimali = 0, gruppi = true, className = '' }) {
  const fermo = useReducedMotion()
  const n = Number(valore) || 0
  const salta = fermo || Math.abs(n) < 20
  const [mostrato, setMostrato] = useState(n)

  useEffect(() => {
    if (salta) { setMostrato(n); return undefined }
    // Durata fissa e non molla: una molla oscilla intorno al valore e non
    // atterra mai esatta, e un numero che continua a tremolare dopo che hai
    // finito di leggerlo e' peggio di un numero fermo. Qui in 520 ms si
    // arriva, e l'ultima cosa che si scrive e' il valore vero.
    const stop = animate(0, n, {
      duration: 0.52,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setMostrato,
      onComplete: () => setMostrato(n),
    })
    return () => stop.stop()
  }, [n, salta])

  // `gruppi = false` toglie il punto delle migliaia. Serve ai fantapunti:
  // "2.699,5" in una colonna stretta si legge come duevirgolasei, e un numero
  // che si puo' leggere in due modi e' un numero sbagliato.
  const testo = mostrato.toLocaleString('it-IT', {
    minimumFractionDigits: decimali, maximumFractionDigits: decimali,
    useGrouping: gruppi,
  })
  return <span className={className}>{testo}</span>
}

/**
 * Lo scheletro dell'attesa.
 *
 * Ha la forma di quello che sta arrivando, cosi' la pagina non salta quando i
 * dati compaiono. E' l'unica animazione che va in circolo, perche' e' l'unica
 * che deve dire "sto ancora lavorando".
 */
export function Scheletro({ righe = 8, alto = 34 }) {
  return (
    <div className="scheletro" aria-busy="true" aria-label="caricamento">
      {Array.from({ length: righe }, (_, i) => (
        <div key={i} className="scheletro-riga" style={{ height: alto, animationDelay: `${i * 0.06}s` }} />
      ))}
    </div>
  )
}

/**
 * Il guscio di una sezione che dipende dal database.
 *
 * Mentre carica mostra lo scheletro; se il database non risponde lo dice, e
 * lo dice in italiano. Non finge mai un archivio vuoto: una tabella senza
 * righe e un database irraggiungibile sono due cose diverse e chi guarda ha
 * il diritto di sapere quale delle due sta vedendo.
 */
export function Sezione({ stato, righe = 8, children, vuoto = 'Nessun dato per questa scelta.' }) {
  if (stato.caricamento) return <Scheletro righe={righe} />
  if (stato.errore) {
    return (
      <p className="guasto">
        Non riesco a leggere l'archivio: {stato.errore}.{' '}
        <button type="button" onClick={() => window.location.reload()}>Riprova</button>
      </p>
    )
  }
  if (!stato.dati || stato.dati.length === 0) return <p className="muted">{vuoto}</p>
  return children
}
