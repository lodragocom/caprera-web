/**
 * Il consenso ai cookie, e cosa vuol dire farlo sul serio.
 *
 * Tre regole che non sono opinioni ma il modo in cui il consenso è valido:
 *
 * 1. **Prima del sì non parte niente.** Non si caricano gli script e poi si
 *    chiede: il consenso è preventivo, quindi Google e i pixel non esistono
 *    finché qualcuno non li ha accettati. Per questo il caricamento sta qui e
 *    non in `index.html`.
 * 2. **Rifiutare costa quanto accettare.** Un bottone "Accetta" grande e un
 *    "Preferenze" nascosto in fondo non è una scelta libera. I due bottoni
 *    stanno affiancati e sono identici.
 * 3. **Si può cambiare idea.** Il consenso si revoca dallo stesso posto in cui
 *    si è dato, sempre, e revocarlo deve essere facile quanto darlo.
 *
 * I cookie **tecnici** non passano di qui: la sessione di chi è entrato serve a
 * tenerlo dentro, non a osservarlo, e per quella non si chiede permesso. È la
 * differenza fra ricordare chi sei e seguire dove vai.
 */

const CHIAVE = 'caprera-consenso'
const VERSIONE = 1

/** Le famiglie su cui si sceglie. `tecnici` non c'è: non si sceglie. */
export const CATEGORIE = [
  {
    id: 'statistiche',
    nome: 'Statistiche',
    testo: 'Quante persone aprono il sito e quali pagine guardano. Serve a capire ' +
           'cosa vale la pena migliorare, non a riconoscere nessuno.',
  },
  {
    id: 'marketing',
    nome: 'Social e annunci',
    testo: 'I pixel di Meta e TikTok. Permettono di misurare le campagne e di ' +
           'mostrare annunci a chi ha già visitato il sito. Questi sì seguono la ' +
           'persona anche fuori di qui.',
  },
]

const VUOTO = { versione: VERSIONE, statistiche: false, marketing: false, quando: null }

/** Quello che l'utente ha scelto. Nessuna scelta = nessun consenso. */
export function consenso() {
  try {
    const g = JSON.parse(localStorage.getItem(CHIAVE) || 'null')
    // Una versione vecchia non vale: se cambiano le categorie, il vecchio sì
    // non copre le nuove e va richiesto.
    if (!g || g.versione !== VERSIONE) return VUOTO
    return { ...VUOTO, ...g }
  } catch {
    return VUOTO
  }
}

/** Se la scelta non è mai stata fatta, il banner va mostrato. */
export function daChiedere() {
  return consenso().quando === null
}

/** Salva la scelta e accende ciò che è stato accettato. */
export function salvaConsenso(scelte) {
  const g = { ...VUOTO, ...scelte, versione: VERSIONE, quando: new Date().toISOString() }
  try { localStorage.setItem(CHIAVE, JSON.stringify(g)) } catch { /* modalità privata */ }
  applica(g)
  window.dispatchEvent(new CustomEvent('caprera:consenso', { detail: g }))
  return g
}

/**
 * Accende quello che è stato accettato.
 *
 * ⚠️ **Spegnere non è simmetrico.** Uno script di terze parti, una volta
 * caricato, non si scarica: revocare il consenso toglie il permesso per la
 * prossima visita, ma per questa serve ricaricare la pagina. Per questo la
 * revoca lo dice e propone di ricaricare, invece di far finta di niente.
 */
export function applica(g = consenso()) {
  if (g.statistiche) accendiStatistiche()
  if (g.marketing) accendiMarketing()
}

/* ---------------------------------------------------------------- i codici */

/*
 * Gli identificativi stanno nelle variabili d'ambiente, non qui: sono
 * configurazione, cambiano fra prova ed esercizio, e uno che non c'è deve
 * semplicemente non accendere niente invece di caricare uno script vuoto.
 */
const GA = import.meta.env.VITE_GA_ID
const META = import.meta.env.VITE_META_PIXEL
const TIKTOK = import.meta.env.VITE_TIKTOK_PIXEL

const acceso = new Set()

function scriptUnaVolta(chiave, url, dopo) {
  if (acceso.has(chiave)) return
  acceso.add(chiave)
  const s = document.createElement('script')
  s.async = true
  s.src = url
  s.onload = dopo
  document.head.appendChild(s)
}

function accendiStatistiche() {
  if (!GA) return
  scriptUnaVolta('ga', `https://www.googletagmanager.com/gtag/js?id=${GA}`, () => {
    window.dataLayer = window.dataLayer || []
    function gtag() { window.dataLayer.push(arguments) }
    window.gtag = gtag
    gtag('js', new Date())
    // `anonymize_ip` e niente segnali pubblicitari: qui misuriamo le visite,
    // non costruiamo pubblici.
    gtag('config', GA, { anonymize_ip: true, allow_google_signals: false })
  })
}

function accendiMarketing() {
  if (META && !acceso.has('meta')) {
    acceso.add('meta')
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js')
    /* eslint-enable */
    window.fbq('init', META)
    window.fbq('track', 'PageView')
  }
  if (TIKTOK && !acceso.has('tiktok')) {
    acceso.add('tiktok')
    scriptUnaVolta('tiktok', `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${TIKTOK}`)
  }
}

/** Riapre il pannello per cambiare idea. Lo chiamano le pagine legali. */
export function apriConsenso() {
  window.dispatchEvent(new CustomEvent('caprera:apri-consenso'))
}
