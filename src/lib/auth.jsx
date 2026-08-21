import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase, CONFIGURATO } from './supabase'

/**
 * La Tessera del Tifoso.
 *
 * Un mister entra con la sua email di Fantapazz e una password che sceglie
 * lui. La societa' non la sceglie: gliela ha gia' assegnata la Presidenza,
 * emettendo una tessera intestata a quell'email. Al primo accesso la tessera
 * si attiva e da quel momento il mister vede la sua societa' e nessun'altra.
 *
 * Chi entra con un'email senza tessera ha un account e nessuna societa'. Non
 * e' un errore ed e' importante che non lo sembri: e' una persona che si e'
 * registrata prima che la Presidenza gliela desse.
 *
 * Da qui in poi non e' il sito a decidere cosa si vede. Il sito chiede, e il
 * database risponde solo quello che quel mister ha diritto di leggere: le
 * regole di riga stanno sulle tabelle, non in queste pagine. Una pagina
 * scritta male non puo' far uscire i contratti di un altro.
 */
const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [utente, setUtente] = useState(null)
  const [tessera, setTessera] = useState(null)
  const [incarichi, setIncarichi] = useState([])
  const [visita, setVisita] = useState(null)
  const [pronto, setPronto] = useState(!CONFIGURATO)

  /*
   * Sto arrivando da un collegamento di recupero password?
   *
   * Il collegamento contiene gia' una sessione valida: chi lo apre e' dentro,
   * senza aver digitato niente. Va benissimo che sia cosi' - e' come funziona
   * il recupero - ma se il sito si limitasse a farlo entrare, quella persona
   * si ritroverebbe nell'area con la stessa password di prima, cioe' nessuna
   * che si ricordi, e la volta dopo sarebbe di nuovo fuori. Quindi qui lo si
   * segna, e la pagina d'accesso chiede la password nuova prima di lasciar
   * passare.
   *
   * Si guarda anche l'indirizzo a mano: `supabase-js` annuncia il recupero
   * una volta sola, e se la pagina si ricarica quell'annuncio e' gia' passato.
   */
  const [recupero, setRecupero] = useState(
    () => typeof window !== 'undefined'
      && /type=recovery/.test(window.location.hash + window.location.search)
  )

  /**
   * Chi sono, e per quale societa'.
   *
   * Se non risulta collegato a niente si chiede al database di riprovare ad
   * attivare la tessera. Serve per i casi in cui il collegamento automatico
   * non e' scattato: chi si era registrato prima che la tessera esistesse,
   * o una registrazione andata storta a meta'. Il database attiva solo la
   * tessera di chi chiede, mai quella di un altro.
   */
  async function leggiTessera(u) {
    if (!u) { setTessera(null); setIncarichi([]); return }
    const { data } = await supabase.from('la_mia_tessera')
      .select('societa, nome, ruolo').maybeSingle()
    if (data) { setTessera(data); await leggiIncarichi(); return }

    const { data: riprova } = await supabase.rpc('attiva_la_mia_tessera')
    setTessera(riprova?.[0] ?? null)
    if (riprova?.[0]) await leggiIncarichi()
  }

  /**
   * Che incarichi ha, oltre a guidare la sua societa'.
   *
   * Serve a decidere cosa mostrare, mai cosa permettere. Le due colonne
   * `vede_tutto` e `puo_scrivere` sono le stesse su cui il database ha gia'
   * deciso le regole di riga: se questa lettura fallisse, il sito
   * nasconderebbe qualche voce di menu e nient'altro.
   */
  async function leggiIncarichi() {
    const { data } = await supabase.from('i_miei_incarichi')
      .select('incarico, nome, vede_tutto, puo_scrivere')
    setIncarichi(data ?? [])
  }

  useEffect(() => {
    if (!CONFIGURATO) return undefined
    let vivo = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!vivo) return
      setUtente(data.session?.user ?? null)
      await leggiTessera(data.session?.user)
      if (vivo) setPronto(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (evento, sessione) => {
      if (!vivo) return
      if (evento === 'PASSWORD_RECOVERY') setRecupero(true)
      setUtente(sessione?.user ?? null)
      await leggiTessera(sessione?.user)
      setPronto(true)
    })
    return () => { vivo = false; sub.subscription.unsubscribe() }
  }, [])

  const valore = useMemo(() => ({
    pronto,
    utente,
    tessera,
    /*
     * La sessione come la leggono le pagine: chi sono e che societa' guardo.
     *
     * `team` e' la societa' guardata, che di norma e' la propria. Chi ha un
     * incarico con `vede_tutto` puo' spostarsi su un'altra: serve a controllare
     * le dieci aree prima di consegnarle ai mister, e a capire dove il sito
     * sbaglia senza chiedere a loro di accorgersene.
     *
     * `miaSocieta` invece non si sposta mai: e' la societa' della tessera. Le
     * pagine che parlano di *me* - la Tessera del Tifoso - devono usare
     * quella, altrimenti in visita mostrerebbero lo stemma sbagliato accanto
     * al mio nome.
     *
     * Questo non e' un cambio di identita': il database continua a vedere la
     * mia, ed e' per questo che funziona solo per chi ha gia' il diritto di
     * leggere quei dati. Cambia cosa chiedo, non chi sono.
     */
    sessione: tessera
      ? { team: visita ?? tessera.societa, miaSocieta: tessera.societa, mister: tessera.nome }
      : null,
    inVisita: Boolean(visita) && visita !== tessera?.societa,

    /** Sposta lo sguardo su un'altra societa'. `null` torna alla propria. */
    guarda(societaId) {
      if (!incarichi.some((i) => i.vede_tutto)) return
      setVisita(societaId && societaId !== tessera?.societa ? societaId : null)
    },

    /* Gli incarichi, e le due domande che le pagine fanno davvero. */
    incarichi,
    recupero,
    vedeTutto: incarichi.some((i) => i.vede_tutto),
    puoScrivere: incarichi.some((i) => i.puo_scrivere),
    ha: (codice) => incarichi.some((i) => i.incarico === codice),
    /* `presidenza` resta il nome storico: vuol dire "vede oltre la sua societa'". */
    presidenza: incarichi.some((i) => i.vede_tutto) || tessera?.ruolo === 'presidenza',

    /** Da richiamare dopo aver salvato la scheda o cambiato incarico. */
    async ricarica() {
      const { data } = await supabase.auth.getSession()
      await leggiTessera(data.session?.user ?? null)
    },

    /**
     * Cambio password di chi e' gia' entrato.
     *
     * Supabase la cambia solo per la sessione in corso: non esiste un modo,
     * da qui, di cambiare quella di un altro. E' il motivo per cui questa
     * funzione non chiede l'email.
     */
    async cambiaPassword(nuova) {
      const { error } = await supabase.auth.updateUser({ password: nuova })
      if (error) return traduci(error.message)
      // Da qui in poi la password la sa: il recupero e' finito, e
      // l'indirizzo va ripulito del pezzo che lo farebbe ricominciare.
      setRecupero(false)
      if (typeof window !== 'undefined' && /type=recovery/.test(window.location.hash)) {
        window.history.replaceState(null, '', window.location.pathname)
      }
      return null
    },

    async entra(email, password) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      })
      return error ? traduci(error.message) : null
    },

    async registrati(email, password) {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), password,
      })
      return error ? traduci(error.message) : null
    },

    async recupera(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(), { redirectTo: `${window.location.origin}/login` })
      return error ? traduci(error.message) : null
    },

    async esci() {
      await supabase.auth.signOut()
      setTessera(null)
      setIncarichi([])
      setVisita(null)
    },
  }), [pronto, utente, tessera, incarichi, visita, recupero])

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>
}

/**
 * I messaggi di Supabase sono in inglese e parlano di "credentials".
 * Qui diventano frasi che dicono cosa fare.
 */
function traduci(m = '') {
  const t = m.toLowerCase()
  if (t.includes('invalid login credentials')) {
    return 'Email o password non corrispondono. Se è la prima volta, devi prima creare la password.'
  }
  if (t.includes('email not confirmed')) {
    return 'Devi ancora confermare l’email: cerca il messaggio della Federazione, anche fra la posta indesiderata.'
  }
  if (t.includes('user already registered')) {
    return 'Questa email è già registrata: entra con la tua password, o falla reimpostare.'
  }
  if (t.includes('password should be') || t.includes('at least')) {
    return 'La password è troppo corta: servono almeno sei caratteri.'
  }
  if (t.includes('should be different') || t.includes('same_password')) {
    return 'La nuova password è identica a quella di adesso: scegline un’altra.'
  }
  if (t.includes('rate limit') || t.includes('too many')) {
    return 'Troppi tentativi ravvicinati. Aspetta un minuto e riprova.'
  }
  return m
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth va usato dentro <AuthProvider>')
  return v
}
