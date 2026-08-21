import { createClient } from '@supabase/supabase-js'

/**
 * Il collegamento all'archivio su Supabase.
 *
 * La chiave qui sotto e' quella "pubblicabile": e' fatta per stare dentro una
 * pagina web e non apre niente da sola. Chi vede cosa lo decidono le regole di
 * riga del database, non questa chiave — con essa si leggono partite,
 * classifiche e formazioni, e contratti e crediti restano chiusi.
 *
 * Il progetto e' `caprera` (ziggietzdtdtpsfmpthm). L'archivio vive nello
 * schema `caprera`, ma il sito legge da `public`, dove ogni tabella si
 * affaccia con una vista sottile. Il motivo e' pratico: l'API di Supabase
 * serve solo gli schemi elencati in un'impostazione del cruscotto, e una
 * spunta in un pannello non sta in nessun file, non si versiona e prima o poi
 * qualcuno la perde. Le viste invece sono scritte in una migrazione.
 * Le regole di riga restano quelle delle tabelle sotto.
 */
const URL = import.meta.env.VITE_SUPABASE_URL
const CHIAVE = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Vero se il sito e' configurato per parlare con il database. */
export const CONFIGURATO = Boolean(URL && CHIAVE)

export const supabase = CONFIGURATO
  ? createClient(URL, CHIAVE, {
      auth: {
        // La tessera resta in tasca: la sessione sopravvive al ricaricamento
        // e alla chiusura del browser. Prima era voluto il contrario, quando
        // l'accesso era finto e non volevamo dare l'illusione di una sessione
        // vera; adesso l'accesso e' vero, e un mister buttato fuori a ogni
        // F5 smetterebbe di usare l'area.
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'caprera-tessera',
      },
    })
  : null

/**
 * Piccolo aiuto per le pagine: esegue una lettura e torna sempre la stessa
 * forma, {dati, errore, caricamento}.
 *
 * Se il database non e' configurato o non risponde, `errore` e' valorizzato e
 * la pagina deve continuare a funzionare con i dati statici: finche' il sito
 * regge senza database, un'interruzione di Supabase non lo butta giu'.
 */
export async function leggi(costruisci) {
  if (!supabase) return { dati: null, errore: 'database non configurato' }
  try {
    const { data, error } = await costruisci(supabase)
    if (error) return { dati: null, errore: error.message }
    return { dati: data, errore: null }
  } catch (e) {
    return { dati: null, errore: String(e.message ?? e) }
  }
}
