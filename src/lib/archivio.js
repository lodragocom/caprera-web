import { supabase, CONFIGURATO } from './supabase'
import { useEffect, useState } from 'react'

/**
 * L'archivio, letto dal database.
 *
 * Ogni cosa che il sito mostra passa da qui. Le pagine non sanno che esiste
 * Supabase: chiedono "la classifica del 2025-26" e ricevono righe.
 *
 * Tre regole che questo modulo si impone:
 *
 * 1. Si chiede solo quello che serve. L'archivio ha 112.888 righe di
 *    formazione: una pagina che le scaricasse tutte sarebbe peggio dei
 *    sedici mega di file che stiamo togliendo.
 * 2. Si chiede una volta sola. La stessa domanda nella stessa visita torna
 *    dalla memoria, non dalla rete.
 * 3. Non si mente mai sul non sapere. Se il database non risponde, la
 *    pagina lo dice; non inventa una tabella vuota che sembra un archivio
 *    senza dati.
 */

const cache = new Map()

/** Esegue una domanda una volta sola per visita. */
function unaVolta(chiave, domanda) {
  if (cache.has(chiave)) return cache.get(chiave)
  const p = domanda().then(({ data, error }) => {
    if (error) {
      cache.delete(chiave)      // un errore non si tiene in memoria: si riprova
      throw new Error(error.message)
    }
    return data
  })
  cache.set(chiave, p)
  return p
}

/** Svuota la memoria: serve dopo un caricamento nuovo. */
export function dimentica() {
  cache.clear()
}

/*
 * Il tetto delle mille righe, e come si scavalca.
 *
 * Supabase risponde al massimo con mille righe (`db-max-rows`) e **non lo
 * dice**: quello che arriva e' un elenco valido, solo piu' corto della
 * verita'. Nessun errore, nessuna pagina rotta — solo dei buchi.
 *
 * Ci e' costato una giornata. Il listone del 2025-26 sono 1.519 righe fra
 * partenza e fine; le prime mille contenevano tutte le 839 di fine e appena
 * 161 di partenza. Risultato: nella «mia rosa» la colonna «Quot.» era vuota
 * per nove giocatori su dieci, e sembrava che mancassero i dati. I dati
 * c'erano tutti.
 *
 * `tutte()` chiede a pezzi finche' non finiscono. Chi la usa deve dare alla
 * domanda un **ordine deterministico** — di solito `.order('id')` — perche'
 * senza un ordine stabile due pagine consecutive possono ripetere una riga e
 * saltarne un'altra: Postgres non promette lo stesso ordine due volte.
 */
const PAGINA = 1000

async function tutte(fai) {
  const righe = []
  for (let da = 0; da < PAGINA * 100; da += PAGINA) {
    const { data, error } = await fai().range(da, da + PAGINA - 1)
    if (error) return { data: null, error }
    righe.push(...(data ?? []))
    if ((data ?? []).length < PAGINA) break
  }
  return { data: righe, error: null }
}

/**
 * L'hook che usano le pagine.
 *
 *   const { dati, caricamento, errore } = useArchivio(
 *     ['classifica', stagione], () => classifica(stagione), [stagione])
 *
 * `caricamento` e' vero solo la prima volta: se il dato e' gia' in memoria
 * la pagina non sfarfalla mostrando uno scheletro per un istante.
 */
export function useArchivio(chiave, domanda, dipendenze = []) {
  const id = Array.isArray(chiave) ? chiave.join('·') : chiave
  const [stato, setStato] = useState({ dati: null, caricamento: !cache.has(id), errore: null })

  useEffect(() => {
    let vivo = true
    if (!CONFIGURATO) {
      setStato({ dati: null, caricamento: false, errore: 'database non configurato' })
      return
    }
    if (!cache.has(id)) setStato((s) => ({ ...s, caricamento: true, errore: null }))
    // `domanda` e' gia' una delle funzioni qui sotto, che si occupano da sole
    // di chiedere una volta sola. Passarla di nuovo per `unaVolta` la
    // incartava su se' stessa: il secondo giro riceveva le righe gia'
    // spacchettate e ci cercava dentro {data, error}, trovando niente.
    Promise.resolve(domanda())
      .then((d) => vivo && setStato({ dati: d, caricamento: false, errore: null }))
      .catch((e) => vivo && setStato({ dati: null, caricamento: false, errore: e.message }))
    return () => { vivo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ...dipendenze])

  return stato
}

const db = () => supabase

/* ------------------------------------------------------------ anagrafica */

export const societa = () =>
  unaVolta('societa', () => db().from('societa')
    .select('id, nome, breve, sigla, logo, colore, attiva').order('nome'))

export const stagioni = () =>
  unaVolta('stagioni', () => db().from('stagioni')
    .select('id, ordine, giornate, conclusa').order('ordine', { ascending: false }))

export const competizioni = () =>
  unaVolta('competizioni', () => db().from('competizioni')
    .select('id, nome, tipo, colore, ordine').order('ordine'))

/* ------------------------------------------------------------ campionato */

export const classifica = (stagione) =>
  unaVolta(['classifica', stagione].join('·'), () => db().from('classifiche')
    .select('societa, posizione, giocate, vinte, pari, perse, gol_fatti, gol_subiti, punti, fantapunti')
    .eq('stagione', stagione).order('posizione'))

export const partite = (stagione, competizione = 'campionato') =>
  unaVolta(['partite', stagione, competizione].join('·'), () => db().from('partite')
    .select('id, giornata, turno, casa, fuori, gol_casa, gol_fuori, fp_casa, fp_fuori, giocata')
    .eq('stagione', stagione).eq('competizione', competizione)
    .order('giornata', { nullsFirst: false }).order('id'))

/** Le partite di una societa' in una stagione, campionato e coppe insieme. */
export const partiteDi = (stagione, teamId) =>
  unaVolta(['partiteDi', stagione, teamId].join('·'), () => db().from('v_gare')
    .select('id, competizione, giornata, turno, societa, avversario, in_casa,'
            + ' gol_fatti, gol_subiti, fantapunti, fantapunti_avversario, giocata')
    .eq('stagione', stagione).eq('societa', teamId)
    .order('competizione').order('giornata', { nullsFirst: false }))

/** Le ultime giornate di tutte le societa' di una stagione, per la forma. */
export const forma = (stagione) =>
  unaVolta(['forma', stagione].join('·'), () => db().from('v_forma')
    // `id` serve per aprire il tabellino da una pallina V/N/P
    .select('id, societa, giornata, esito, gol_fatti, gol_subiti, avversario, in_casa')
    .eq('stagione', stagione).order('giornata'))

/** La classifica perpetua: cento righe, si sommano qui. */
export const classificaPerpetua = () =>
  unaVolta('perpetua', () => db().from('classifiche')
    .select('stagione, societa, posizione, giocate, vinte, pari, perse, gol_fatti, gol_subiti, punti'))

export const classificaFantapunti = (stagione) =>
  unaVolta(['fantapunti', stagione].join('·'), () => db().from('v_classifica_fantapunti')
    .select('societa, fantapunti, posizione').eq('stagione', stagione).order('posizione'))

/* ----------------------------------------------------------------- coppe */

export const albo = () =>
  unaVolta('albo', () => db().from('v_albo')
    .select('competizione, competizione_nome, stagione, vincitore, finalista, ai_fantapunti')
    .order('stagione', { ascending: false }))

/** La bacheca di tutte le societa': poche centinaia di righe. */
export const bachecaTutti = () =>
  unaVolta('bachecaTutti', () => db().from('v_bacheca')
    .select('societa, competizione, competizione_nome, stagione, ai_fantapunti'))

export const bacheca = (teamId) =>
  unaVolta(['bacheca', teamId].join('·'), () => db().from('v_bacheca')
    .select('competizione, competizione_nome, stagione, ai_fantapunti')
    .eq('societa', teamId).order('stagione', { ascending: false }))

export const edizioni = (stagione) =>
  unaVolta(['edizioni', stagione].join('·'), () => db().from('edizioni')
    .select('id, competizione, vincitore, finalista, ai_fantapunti, in_parita')
    .eq('stagione', stagione))

/**
 * Turni e partite di una coppa: tre letture piatte, non una per turno.
 *
 * Niente `turni(...)` annidato dentro la select: quella scorciatoia funziona
 * quando PostgREST riconosce il legame fra due tabelle, e il sito legge da
 * viste, dove il legame non si vede. Tre domande semplici valgono piu' di una
 * complicata che funziona solo finche' nessuno tocca lo schema.
 */
export async function tabellone(stagione, competizione) {
  const chiave = ['tabellone', stagione, competizione].join('·')
  if (cache.has(chiave)) return cache.get(chiave)
  const p = (async () => {
    const { data: ed, error: e1 } = await db().from('edizioni')
      .select('id, vincitore, finalista, ai_fantapunti, in_parita')
      .eq('stagione', stagione).eq('competizione', competizione).maybeSingle()
    if (e1) throw new Error(e1.message)
    if (!ed) return null
    const { data: tu, error: eT } = await db().from('turni')
      .select('id, ordine, nome').eq('edizione', ed.id).order('ordine')
    if (eT) throw new Error(eT.message)
    ed.turni = tu ?? []
    const ids = ed.turni.map((t) => t.id)
    if (!ids.length) return { ...ed, turni: [] }
    const { data: pa, error: e2 } = await db().from('partite')
      // `id` serve al tabellino: senza, le partite di coppa non si aprono
      .select('id, turno, casa, fuori, gol_casa, gol_fuori, fp_casa, fp_fuori')
      .in('turno', ids)
    if (e2) throw new Error(e2.message)
    const perTurno = new Map()
    for (const x of pa) {
      if (!perTurno.has(x.turno)) perTurno.set(x.turno, [])
      perTurno.get(x.turno).push(x)
    }
    return {
      ...ed,
      turni: [...ed.turni].sort((a, b) => a.ordine - b.ordine)
        .map((t) => ({ ...t, partite: perTurno.get(t.id) ?? [] })),
    }
  })()
  cache.set(chiave, p)
  return p
}

/**
 * Tutte le coppe di una stagione, nella forma che si aspetta la logica dei
 * tabelloni in lib/coppe.js.
 *
 * L'adattatore esiste apposta: quella logica - accoppiare andata e ritorno,
 * riconoscere la finale, decidere chi passa ai gol in trasferta - e' stata
 * verificata su 160 sfide e 34 finali, e non la si tocca per il gusto di
 * rinominare dei campi. Qui si traducono i nomi e basta.
 *
 * Quattro letture per l'intera stagione, non una per turno.
 */
export async function coppeStagione(stagione) {
  const chiave = ['coppeStagione', stagione].join('·')
  if (cache.has(chiave)) return cache.get(chiave)
  const p = (async () => {
    const [comp, ed, pa, fp] = await Promise.all([
      competizioni(),
      edizioni(stagione),
      unaVolta(['partiteCoppa', stagione].join('·'), () => db().from('partite')
        // `id` serve al tabellino: senza, le partite di coppa non si aprono
      .select('id, turno, casa, fuori, gol_casa, gol_fuori, fp_casa, fp_fuori')
        .eq('stagione', stagione).not('turno', 'is', null)),
      classificaFantapunti(stagione),
    ])
    const nomi = new Map(comp.map((c) => [c.id, c]))
    const ids = ed.map((e) => e.id)
    const { data: tu, error } = ids.length
      ? await db().from('turni').select('id, edizione, ordine, nome').in('edizione', ids)
      : { data: [], error: null }
    if (error) throw new Error(error.message)

    const perTurno = new Map()
    for (const x of pa ?? []) {
      if (!perTurno.has(x.turno)) perTurno.set(x.turno, [])
      perTurno.get(x.turno).push({
        casa: x.casa, fuori: x.fuori,
        golCasa: x.gol_casa, golFuori: x.gol_fuori,
        fpCasa: Number(x.fp_casa), fpFuori: Number(x.fp_fuori),
      })
    }
    const perEdizione = new Map()
    for (const t of (tu ?? []).sort((a, b) => a.ordine - b.ordine)) {
      if (!perEdizione.has(t.edizione)) perEdizione.set(t.edizione, [])
      perEdizione.get(t.edizione).push({ turno: t.nome, partite: perTurno.get(t.id) ?? [] })
    }

    return ed.map((e) => {
      const c = nomi.get(e.competizione)
      const base = {
        id: e.competizione, nome: c?.nome ?? e.competizione, stagione,
        vincitore: e.vincitore, finalista: e.finalista,
        aiFantapunti: e.ai_fantapunti, finaleInParita: e.in_parita,
        turni: perEdizione.get(e.id) ?? [],
      }
      // la Classifica Fantapunti non ha tabellone: e' una graduatoria
      if (c?.tipo === 'classifica') {
        base.turni = []
        base.classifica = (fp ?? []).map((r) => ({
          team: r.societa, fantapunti: Number(r.fantapunti),
        }))
      }
      return base
    }).sort((a, b) => (nomi.get(a.id)?.ordine ?? 0) - (nomi.get(b.id)?.ordine ?? 0))
  })()
  cache.set(chiave, p)
  return p
}

/** Le stagioni in cui una societa' ha giocato almeno una gara di coppa. */
export const stagioniCoppeDi = (teamId) =>
  unaVolta(['stagioniCoppeDi', teamId].join('·'), () => db().from('v_gare')
    .select('stagione, competizione').eq('societa', teamId)
    .neq('competizione', 'campionato'))

/* ------------------------------------------------------------ rose e gente */

/**
 * Tutte le rose di una stagione: circa trecento righe, una lettura sola.
 *
 * `momento` dice di che giorno e' la rosa. «fine» e' quella di maggio, dopo il
 * mercato di gennaio: e' quella che il sito mostra dappertutto, ed e' anche
 * l'unica che esisteva prima. «partenza» e' quella uscita dall'asta.
 *
 * Il valore predefinito e' «fine» apposta: chi chiede una rosa senza dire
 * quale intende quella di sempre, e nessuna pagina cambia significato perche'
 * ne e' entrata un'altra accanto.
 */
export const roseStagione = (stagione, momento = 'fine') =>
  unaVolta(['roseStagione', stagione, momento].join('·'), () => db().from('rose')
    // `calciatore` serve per portare dal nome in rosa alla sua scheda
    // `fonte` dice se la rosa di settembre e' trascritta da un file o
    // ricostruita dal campo: senza, chi legge non sa quanto fidarsi.
    .select('calciatore, societa, nome, ruolo, club, costo, costo_stimato, presenze, mv, fm, fonte')
    .eq('stagione', stagione).eq('momento', momento))

/**
 * Il listone di Fantapazz: quanto vale ogni calciatore secondo loro.
 *
 * E' un'altra cosa dal costo in `rose`: quello e' quanto l'hai pagato tu
 * all'asta della Caprera, in crediti nostri.
 *
 * **Ma non tutte le quotazioni sono dello stesso momento.** Fantapazz le
 * muove durante l'anno: chi si fa male scende, chi segna sale. Quella che
 * conta per l'asta e' la quotazione **di partenza**, prima della prima
 * giornata, perche' e' quella che i mister avevano davanti quando hanno
 * rilanciato. Alcune stagioni ce l'hanno, altre no: quelle senza sono state
 * scaricate a stagione finita, e dicono quanto vale un giocatore *adesso*.
 * Quali siano non sta scritto qui — lo dice l'archivio, `momentiDelListone`.
 *
 * Nel 2025-26 la differenza si tocca: Simeone sul listone di partenza vale
 * 10 e all'asta e' costato esattamente 10; su quello scaricato dopo vale 30.
 * Il 30 non racconta un affare mancato: racconta una data diversa.
 *
 * Torna `{ momento, righe }`. Dove ci sono tutti e due i momenti vince la
 * partenza, e la differenza fra i due elenchi e' una storia da raccontare.
 */
export const listone = (stagione) =>
  unaVolta(['listone', stagione].join('\u00b7'), () => tutte(() => db().from('listone')
    .select('momento, nome, ruolo, club, prezzo').eq('stagione', stagione)
    // l'ordine serve a `tutte`: (stagione, momento, nome, ruolo) non ha doppioni
    .order('momento').order('nome').order('ruolo')))
    .then((righe) => {
      const partenza = (righe ?? []).filter((r) => r.momento === 'partenza')
      const fine = (righe ?? []).filter((r) => r.momento === 'fine')
      /* `righe` e' quello che si mette accanto al costo d'asta, e per quello
         serve la partenza: la quotazione di fine anno sa gia' com'e' andata.
         Ma i due elenchi tornano tutti e due, perche' dove ci sono entrambi
         la differenza fra loro e' una storia — chi e' cresciuto e chi no. */
      return {
        momento: partenza.length ? 'partenza' : 'fine',
        righe: partenza.length ? partenza : fine,
        partenza,
        fine,
      }
    })

/**
 * Tutti quelli che hanno giocato per una societa', stagione per stagione.
 *
 * Sono fra le 350 e le 375 righe per societa' su dieci stagioni: si chiede
 * la propria e basta, non l'intera vista da 3.428. E' quello che permette a
 * «la mia rosa» di dire da quanto uno e' qui e cosa ha fatto negli anni,
 * invece del solo costo di quest'anno.
 */
export const carrieraSocieta = (teamId) =>
  unaVolta(['carrieraSocieta', teamId].join('\u00b7'), () => db().from('v_carriera')
    .select(`calciatore, nome, ruolo, stagione, club, costo, fm,
             convocato, titolare, subentrato, con_voto, mv,
             gol, rigori, rigori_sbagliati, rigori_parati, assist,
             gialli, rossi, autogol, imbattuto, gol_subiti`)
    .eq('societa', teamId).order('stagione'))

/** Le stagioni per cui esiste una rosa registrata. */
export const stagioniRose = () =>
  unaVolta('stagioniRose', () => tutte(() => db().from('rose')
    .select('stagione').eq('momento', 'fine').order('id')))

/**
 * La rosa di una societa' in una stagione, a un momento preciso.
 *
 * I momenti sono due e vogliono dire cose diverse. «fine» e' la rosa di
 * maggio: chi c'era quando la stagione e' finita, con presenze e fantamedia.
 * «partenza» e' la rosa di settembre, quella uscita dall'asta. La differenza
 * fra le due **e' il mercato**: chi manca a maggio se n'e' andato, chi compare
 * solo a maggio e' arrivato dopo. Da sola nessuna delle due lo dice.
 *
 * `fonte` va guardata prima dei numeri. «foglio» vuol dire trascritta da un
 * documento; «campo» vuol dire ricostruita dalle formazioni, e vale circa tre
 * nomi su quattro — misurato, non stimato: sul 2020-21, dove poi e' saltato
 * fuori il file vero, la ricostruzione aveva azzeccato 234 nomi su 299.
 */
export const rosa = (stagione, teamId, momento = 'fine') =>
  unaVolta(['rosa', stagione, teamId, momento].join('·'), () => db().from('rose')
    .select('nome, ruolo, club, costo, costo_stimato, presenze, mv, fm, calciatore, fonte')
    .eq('stagione', stagione).eq('societa', teamId).eq('momento', momento)
    .order('ruolo').order('costo', { ascending: false }))

/**
 * Quali stagioni hanno la rosa di settembre, e da dove viene.
 *
 * Stessa idea di `momentiDelListone`: l'elenco lo dice l'archivio, non una
 * frase scritta in pagina che il giorno dopo e' falsa.
 *
 * Torna `{ partenza: [...stagioni], ricostruite: [...stagioni] }`. Le
 * ricostruite sono quelle con `fonte = 'campo'`, e la pagina deve dirlo:
 * mostrarle come se fossero un documento sarebbe una bugia per omissione.
 */
export const momentiDelleRose = () =>
  unaVolta('momentiDelleRose', () => db().from('rose_momenti')
    .select('stagione, momento, fonte'))
    .then((righe) => {
      const p = (righe ?? []).filter((r) => r.momento === 'partenza')
      return {
        partenza: p.map((r) => r.stagione).sort(),
        ricostruite: p.filter((r) => r.fonte === 'campo').map((r) => r.stagione).sort(),
      }
    })

/**
 * Chi ha lasciato una societa', stagione per stagione.
 *
 * Il registro dei crediti dice *quanto e' costato*; questa dice *dov'e'
 * finito*, ed e' una domanda diversa che meritava un posto suo.
 *
 * La colonna che conta non e' il nome, e' `certezza`, perche' non tutto
 * quello che sappiamo lo sappiamo allo stesso modo:
 *   documento - c'e' un contratto firmato e depositato in segreteria;
 *   foglio    - lo scrive il foglio delle rose (svincoli, e chi c'era a
 *               settembre e non c'e' piu' a maggio);
 *   campo     - non lo scrive nessuno, lo dicono le formazioni. Uno sceso in
 *               campo con quella maglia e sparito dalla rosa di maggio.
 * L'ultima e' un indizio, non una registrazione, e chi legge ha il diritto di
 * saperlo senza doverlo dedurre.
 *
 * Qui non passano crediti: quelli stanno in `movimenti`, che e' dei mister.
 */
export const passaggiDi = (teamId) =>
  unaVolta(['passaggi', teamId].join('·'), () => db().from('passaggi')
    .select('stagione, calciatore, nome, da, a, tipo, finestra, certezza, nota')
    .eq('da', teamId).order('stagione'))

/**
 * Cerca un calciatore in dieci stagioni.
 * E' la domanda che con i file non si poteva fare: le formazioni erano
 * quindici mega divisi per stagione e non c'era modo di attraversarli.
 */
export const cercaCalciatore = (testo) =>
  db().from('calciatori').select('id, nome, ruolo').ilike('nome', `%${testo}%`).limit(20)

export const impieghi = (calciatoreId) =>
  unaVolta(['impieghi', calciatoreId].join('·'), () => db().from('v_impieghi')
    .select('societa, stagione, competizione, giornata, titolare, entrato, voto, fascia')
    .eq('calciatore', calciatoreId).order('stagione').order('giornata'))

/** Tutte le rose di tutte le stagioni: 3.309 righe, per le statistiche.
 *  Oltre il tetto delle mille: si legge a pezzi, con `tutte`. */
export const tutteLeRose = () =>
  unaVolta('tutteLeRose', () => tutte(() => db().from('rose')
    .select('calciatore, stagione, societa, nome, ruolo, club, costo, presenze, mv, fm')
    .eq('momento', 'fine').order('id')))

/**
 * La carriera di un calciatore in Caprera: una riga per stagione.
 *
 * Si chiede un calciatore alla volta. La vista intera sono 3.428 righe e
 * mezzo mega di JSON: scaricarla per mostrarne nove sarebbe la stessa cosa
 * che facevano i sedici mega di file che abbiamo tolto.
 */
/**
 * Lo stesso calciatore, ma in Serie A.
 *
 * `v_carriera` racconta il **giocatore di Caprera**: quante volte il suo
 * mister l'ha schierato, e cosa ha portato a quella maglia. E' un conto che
 * esiste solo se qualcuno l'aveva in formazione.
 *
 * `rose.presenze`, `rose.mv` e `rose.fm` sono un'altra cosa: sono le partite
 * che ha giocato **davvero**, in Serie A, che qualcuno lo schierasse o no.
 * Verificato contro l'export di Fantapazz: presenze identiche dieci su dieci.
 *
 * Le due non coincidono quasi mai, ed e' il punto. Suzuki nel 2024-25 ha
 * giocato 37 partite di Serie A; il Real Monghi l'ha schierato sette volte.
 *
 * Si legge da `rose` e non dalla vista perche' la vista non porta `presenze`:
 * aggiungercelo sarebbe una modifica allo schema, e questa e' una domanda da
 * dieci righe.
 */
export const carrieraSerieA = (calciatoreId) =>
  unaVolta(['carrieraSerieA', calciatoreId].join('\u00b7'), () => db().from('rose')
    .select('stagione, societa, presenze, mv, fm')
    .eq('calciatore', calciatoreId).eq('momento', 'fine').order('stagione'))

export const carriera = (calciatoreId) =>
  unaVolta(['carriera', calciatoreId].join('\u00b7'), () => db().from('v_carriera')
    .select(`calciatore, nome, ruolo, stagione, societa, club, costo, fm,
             convocato, titolare, subentrato, con_voto, mv,
             gol, rigori, rigori_sbagliati, rigori_parati, assist,
             gialli, rossi, autogol, imbattuto, gol_subiti, gol_vittoria`)
    .eq('calciatore', calciatoreId).order('stagione'))

/**
 * Una partita sola, per il tabellino.
 *
 * `maybeSingle` e non `single`: un id inventato nell'indirizzo deve dare una
 * pagina che dice «questa partita non esiste», non un errore di rete.
 */
export const partita = (id) =>
  unaVolta(['partita', id].join('\u00b7'), () => db().from('partite')
    .select('id, stagione, competizione, turno, giornata, casa, fuori,'
            + ' gol_casa, gol_fuori, fp_casa, fp_fuori, giocata')
    .eq('id', id).maybeSingle())

/** I nomi dei turni di coppa: «Semifinali», «Finale», una lettura sola. */
export const turni = () =>
  unaVolta('turni', () => db().from('turni').select('id, nome'))

/** Tutte le partite di campionato di sempre: 1.795 righe.
 *  Oltre il tetto delle mille: si legge a pezzi, con `tutte`. */
export const tuttePartite = () =>
  unaVolta('tuttePartite', () => tutte(() => db().from('partite')
    .select('stagione, giornata, casa, fuori, gol_casa, gol_fuori, fp_casa, fp_fuori, giocata')
    .eq('competizione', 'campionato').order('id')))

/**
 * I contratti, senza gli importi.
 *
 * Chi ha sotto contratto chi e' informazione di lega; clausola e ingaggio
 * sono denaro e restano nell'area riservata. La finestra sul database e'
 * gia' della misura giusta anche per quando i dati di Guido riempiranno
 * quelle due colonne.
 */
export const contrattiPubblici = () =>
  unaVolta('contrattiPubblici', () => db().from('contratti_pubblici')
    .select('societa, nome, ruolo, under, dalla, alla, anni'))

/* -------------------------------------------------------------- formazioni */

/**
 * La formazione delle due societa' in una partita.
 *
 * Tre letture per partita, non una per giocatore. Sono i dati che pesavano
 * quindici mega dentro il sito: adesso si chiede la singola partita che si
 * sta guardando, e le altre 2.474 restano dove sono.
 */
export async function formazioniPartita(partitaId) {
  const chiave = ['formazioniPartita', partitaId].join('·')
  if (cache.has(chiave)) return cache.get(chiave)
  const p = (async () => {
    const { data: form, error: e1 } = await db().from('formazioni')
      .select('id, societa, mister, modulo, inviata, avviso').eq('partita', partitaId)
    if (e1) throw new Error(e1.message)
    if (!form?.length) return []
    const ids = form.map((f) => f.id)
    const [{ data: gio, error: e2 }, { data: mod, error: e3 }] = await Promise.all([
      db().from('formazione_giocatori')
        .select('id, formazione, titolare, ordine, calciatore, nome, ruolo, sfida, voto, fascia, entrato')
        .in('formazione', ids).order('ordine'),
      db().from('formazione_modificatori').select('formazione, nome, valore').in('formazione', ids),
    ])
    if (e2) throw new Error(e2.message)
    if (e3) throw new Error(e3.message)

    const idGio = (gio ?? []).map((g) => g.id)
    const { data: bon, error: e4 } = idGio.length
      ? await db().from('formazione_bonus').select('giocatore, bonus, quante').in('giocatore', idGio)
      : { data: [], error: null }
    if (e4) throw new Error(e4.message)

    const perGiocatore = new Map()
    for (const b of bon ?? []) {
      if (!perGiocatore.has(b.giocatore)) perGiocatore.set(b.giocatore, [])
      for (let i = 0; i < b.quante; i += 1) perGiocatore.get(b.giocatore).push({ id: b.bonus })
    }
    return form.map((f) => {
      const suoi = (gio ?? []).filter((g) => g.formazione === f.id)
        .map((g) => ({ ...g, bonus: perGiocatore.get(g.id) ?? [] }))
        .sort((a, b) => a.ordine - b.ordine)
      return {
        ...f,
        titolari: suoi.filter((g) => g.titolare),
        panchina: suoi.filter((g) => !g.titolare),
        modificatori: (mod ?? []).filter((m) => m.formazione === f.id),
      }
    })
  })()
  cache.set(chiave, p)
  return p
}

/** I nomi leggibili dei bonus: undici righe, una lettura sola. */
export const bonusTipi = () =>
  unaVolta('bonusTipi', () => db().from('bonus_tipi').select('id, nome, valore'))

/* --------------------------------------------------------------- crediti */

export const premi = (teamId) =>
  unaVolta(['premi', teamId].join('·'), () => db().from('v_premi_crediti')
    .select('stagione, pos_fantapunti, crediti_fantapunti, pos_marcatori, crediti_marcatori, crediti_calcolati')
    .eq('societa', teamId).order('stagione', { ascending: false }))

/**
 * Quali stagioni hanno quale listone.
 *
 * Dodici righe, non ottomila: c'e' una vista apposta. Serve a scrivere in
 * pagina una frase che resta vera. Prima l'elenco delle stagioni col listone
 * di partenza stava dentro il testo — «l'unica e' il 2025-26» — e il giorno
 * in cui ne sono entrate altre due la frase e' diventata falsa senza che
 * niente si rompesse. Adesso quell'elenco lo dice l'archivio.
 */
export const momentiDelListone = () =>
  unaVolta('momentiDelListone', () => db().from('listone_momenti')
    .select('stagione, momento'))
    .then((righe) => ({
      partenza: (righe ?? []).filter((r) => r.momento === 'partenza')
        .map((r) => r.stagione).sort(),
      fine: (righe ?? []).filter((r) => r.momento === 'fine')
        .map((r) => r.stagione).sort(),
    }))

/**
 * I premi in crediti di una societa', voce per voce.
 *
 * Non e' `v_premi_crediti` con piu' righe: e' un'altra cosa. Quella calcola
 * quanto il regolamento *prevede*; questa dice quanto la Presidenza ha
 * *assegnato*, letto dal registro tenuto da Guido — sei stagioni di verbali.
 * Dove le due divergono ha ragione il registro, perche' il regolamento e' una
 * promessa e il registro e' una ricevuta.
 *
 * Escono solo le categorie che discendono da fatti gia' pubblici. Penalita' e
 * assicurazioni non passano da questa finestra, e non e' una dimenticanza:
 * sta scritto nella vista.
 */
export const premiPubblici = (teamId) =>
  unaVolta(['premiPubblici', teamId].join('·'), () => db().from('premi_pubblici')
    .select('stagione, categoria, voce, crediti').eq('societa', teamId))

/* ------------------------------------------------- riservato ai mister */

/**
 * Contratti e crediti della propria societa'.
 *
 * Il filtro `.eq('societa', ...)` qui e' cortesia, non sicurezza: e' il
 * database che decide cosa esce, e a un mister escono solo i suoi. Se questa
 * riga venisse cancellata per sbaglio non cambierebbe niente di quello che si
 * riesce a leggere - e' la differenza fra una porta chiusa a chiave e un
 * cartello che dice "non entrare".
 */
export const mieiContratti = (teamId) =>
  unaVolta(['mieiContratti', teamId].join('·'), () => db().from('contratti_miei')
    .select('societa, nome, ruolo, under, dalla, alla, anni, clausola, ingaggio')
    .eq('societa', teamId))

export const mieFinanze = (teamId) =>
  unaVolta(['mieFinanze', teamId].join('·'), () => db().from('finanze_mie')
    // `base` perche' la dote non e' sempre 250 - nel 2022-23 e 2023-24 era 253 -
    // e una pagina che lo scrive a mano direbbe una cosa falsa per due stagioni.
    .select('stagione, societa, iniziali, spesi, scambi, residui, riportati, bonus, ffp, base, giovani, assicurazione')
    .eq('societa', teamId))

/**
 * L'estratto conto: da dove viene ogni credito.
 *
 * `finanze.bonus` e' un intero unico — premi, penalita', diritti TV, codice
 * etico, rimborsi, tutto dentro — e nel sito diventava una riga sola. Questa
 * lettura la apre. Al mister esce tutto il suo, penalita' comprese: sono i
 * suoi crediti, ed e' l'unico posto dove le vede scritte.
 */
export const mieiMovimenti = (teamId) =>
  unaVolta(['mieiMovimenti', teamId].join('·'), () => db().from('movimenti_miei')
    .select('stagione, societa, categoria, voce, crediti')
    .eq('societa', teamId))

/* ------------------------------------------------- la Tessera del Tifoso */

/**
 * Gli incarichi di chi e' collegato.
 *
 * Non e' un elenco decorativo: `vede_tutto` e `puo_scrivere` sono le stesse
 * due colonne su cui il database decide le regole di riga. Il sito le legge
 * per sapere cosa mostrare, non per sapere cosa concedere - quello lo ha
 * gia' deciso il database prima che la pagina esistesse.
 */
export const mieiIncarichi = () =>
  unaVolta('mieiIncarichi', () => db().from('i_miei_incarichi')
    .select('incarico, nome, vede_tutto, puo_scrivere'))

/** Tutti gli incarichi previsti, con la loro descrizione. */
export const incarichi = () =>
  unaVolta('incarichi', () => db().from('incarichi')
    .select('id, nome, descrizione, vede_tutto, puo_scrivere, ordine').order('ordine'))

/**
 * La propria scheda: nome, cognome, soprannome, telefono, videochiamata.
 *
 * Questa non passa dalla memoria. La scheda e' l'unica cosa che il mister
 * puo' cambiare: se la rileggessi dalla cache, dopo un salvataggio andato a
 * buon fine gli mostrerei ancora il vecchio numero e lo convincerei che non
 * ha funzionato.
 */
export async function laMiaScheda() {
  /*
    Niente `email` in questa lista, ed e' voluto.

    La vista `la_mia_scheda` ha una colonna `email` che va a prendersela da
    `auth.users`, ma la vista e' `security_invoker`: la sottoquery gira con i
    diritti di chi legge, e `authenticated` su `auth.users` non ha diritti.
    Chiedere quella colonna fa fallire tutta la lettura con «permission denied
    for table users» — e la pagina Tessera restava senza scheda.

    L'email non serviva comunque: la sessione di Supabase ce l'ha gia' in
    mano, ed e' la stessa. Le altre colonne si leggono senza problemi: e'
    solo `email` che tocca `auth.users`.
  */
  const { data, error } = await db().from('la_mia_scheda')
    .select('nome, cognome, soprannome, telefono, videochiamata, aggiornata')
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ?? {}
}

/** Salva la propria scheda. Il database rifiuta di scrivere quella di un altro. */
export async function salvaLaMiaScheda(s) {
  const pulisci = (v) => {
    const t = String(v ?? '').trim()
    return t === '' ? null : t
  }
  const { error } = await db().rpc('salva_la_mia_scheda', {
    p_nome: pulisci(s.nome),
    p_cognome: pulisci(s.cognome),
    p_soprannome: pulisci(s.soprannome),
    p_telefono: pulisci(s.telefono),
    p_videochiamata: pulisci(s.videochiamata),
  })
  if (error) throw new Error(error.message)
}

/**
 * Lo staff della lega: chi c'e' e con quale incarico.
 *
 * Il telefono non compare qui di proposito. Chi vede tutto lo legge da
 * `schede_complete`; agli altri lo staff serve per sapere a chi rivolgersi,
 * non per avere la rubrica di tutti.
 */
export const staff = () =>
  unaVolta('staff', () => db().from('staff')
    .select('utente, societa, chi, soprannome, incarichi'))

/* ==================================================== La Presidenza */

/**
 * Le dieci societa' e chi le guida — la schermata di governo.
 *
 * Ci sono anche le societa' SCOPERTE, con i campi vuoti: l'elenco serve a
 * vedere chi manca, quindi chi manca deve comparire. Per questo il database
 * fa una left join e non una lista di tessere.
 *
 * A chi non ha un incarico con `vede_tutto` questa non torna zero righe per
 * gentilezza della pagina: gliele nega il database. Non aggiungere qui un
 * controllo "di sicurezza": sarebbe finto, come tutti quelli lato React.
 */
export const governoSocieta = () =>
  db().rpc('governo_societa').then(({ data, error }) => {
    if (error) throw new Error(error.message)
    return data ?? []
  })

/** Intesta una societa' a un'email. La persona puo' non esistere ancora. */
export async function emettiTessera(email, societa, nome, incarichi = []) {
  const { data, error } = await db().rpc('emetti_tessera', {
    p_email: String(email ?? '').trim(),
    p_societa: societa,
    p_nome: String(nome ?? '').trim() || null,
    p_incarichi: incarichi,
  })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Toglie la tessera e il collegamento. **L'account resta**: e' della persona,
 * non della lega. Chi resta ha un accesso e nessuna societa' — il caso che
 * ADR-003 prevede gia'. Ed e' reversibile: riemettendo la tessera si ricollega.
 */
export async function revocaTessera(email) {
  const { data, error } = await db().rpc('revoca_tessera', { p_email: email })
  if (error) throw new Error(error.message)
  return data
}

/** Cambia gli incarichi. Valgono subito, anche per chi e' gia' collegato. */
export async function cambiaIncarichi(email, lista) {
  const { data, error } = await db().rpc('cambia_incarichi', {
    p_email: email, p_incarichi: lista,
  })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Elimina l'accesso di una persona: scheda, incarichi, collegamento e account.
 *
 * **Non si torna indietro.** La via normale e' `revocaTessera`, che lascia
 * l'account: questa serve quando la persona deve sparire, non solo cambiare
 * squadra. Il database rifiuta di cancellare chi chiama.
 */
export async function eliminaAccesso(email) {
  const { data, error } = await db().rpc('elimina_accesso', { p_email: email })
  if (error) throw new Error(error.message)
  return data
}

/* --------------------------------------------- Gli atti della Presidenza */

/**
 * Gli atti di governo di una stagione: penalita', premi, Caprera Etica.
 *
 * Il mercato non c'e' e non e' una dimenticanza: quello nasce dalle
 * compravendite e ha una pagina sua. Qui si guarda cio' che la Presidenza
 * **decide**, che e' l'altra meta' di `finanze.bonus`.
 */
export const attiLega = (stagione = null) =>
  db().rpc('atti_lega', { p_stagione: stagione }).then(({ data, error }) => {
    if (error) throw new Error(error.message)
    return data ?? []
  })

/** Scrive un atto. Il database rifiuta chi non governa, e i motivi vuoti. */
export async function registraAtto({ stagione, societa, categoria, voce, crediti }) {
  const { data, error } = await db().rpc('registra_atto', {
    p_stagione: stagione, p_societa: societa, p_categoria: categoria,
    p_voce: String(voce ?? '').trim(), p_crediti: Number(crediti),
  })
  if (error) throw new Error(error.message)
  return data
}

/**
 * Cancella un atto — **solo** quelli decisi dalla Presidenza da qui.
 * Le righe trascritte dal registro di Guido non si toccano: se una e'
 * sbagliata si registra un atto che la corregge, come uno storno.
 */
export async function cancellaAtto(id) {
  const { data, error } = await db().rpc('cancella_atto', { p_id: id })
  if (error) throw new Error(error.message)
  return data
}

/**
 * La conformita' delle clausole rescissorie.
 *
 * Per ogni contratto: il valore Fantapazz di partenza, il minimo previsto dal
 * regolamento (D 50%, C 75%, altri 100%) e se la clausola dichiarata lo
 * rispetta. E' il controllo che mancava quando la clausola si dichiarava per
 * email — ed e' il motivo per cui due contratti sono passati sotto soglia
 * senza che nessuno potesse accorgersene.
 */
export const conformitaClausole = () =>
  db().rpc('conformita_clausole').then(({ data, error }) => {
    if (error) throw new Error(error.message)
    return data ?? []
  })
