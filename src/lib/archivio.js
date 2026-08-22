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

/** Tutte le rose di una stagione: circa trecento righe, una lettura sola. */
export const roseStagione = (stagione) =>
  unaVolta(['roseStagione', stagione].join('·'), () => db().from('rose')
    // `calciatore` serve per portare dal nome in rosa alla sua scheda
    .select('calciatore, societa, nome, ruolo, club, costo, presenze, mv, fm')
    .eq('stagione', stagione))

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
 * rilanciato. Il 2025-26 e' cosi'. Le nove stagioni prima, no: sono state
 * scaricate a stagione finita, e dicono quanto vale un giocatore *adesso*.
 *
 * Nel 2025-26 la differenza si tocca: Simeone sul listone di partenza vale
 * 10 e all'asta e' costato esattamente 10; su quello scaricato dopo vale 30.
 * Il 30 non racconta un affare mancato: racconta una data diversa.
 *
 * Torna `{ momento, righe }`. Se una stagione avesse tutti e due i momenti
 * \u2014 succedera' quando arrivano i dati di Guido \u2014 vince la partenza.
 */
export const listone = (stagione) =>
  unaVolta(['listone', stagione].join('\u00b7'), () => db().from('listone')
    .select('momento, nome, ruolo, club, prezzo').eq('stagione', stagione))
    .then((righe) => {
      const partenza = (righe ?? []).filter((r) => r.momento === 'partenza')
      const scelte = partenza.length ? partenza : (righe ?? [])
      return { momento: partenza.length ? 'partenza' : 'fine', righe: scelte }
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
             convocato, titolare, con_voto, mv,
             gol, rigori, assist, gialli, rossi, imbattuto, gol_subiti`)
    .eq('societa', teamId).order('stagione'))

/** Le stagioni per cui esiste una rosa registrata. */
export const stagioniRose = () =>
  unaVolta('stagioniRose', () => db().from('rose').select('stagione'))

export const rosa = (stagione, teamId) =>
  unaVolta(['rosa', stagione, teamId].join('·'), () => db().from('rose')
    .select('nome, ruolo, club, costo, presenze, mv, fm, calciatore')
    .eq('stagione', stagione).eq('societa', teamId)
    .order('ruolo').order('costo', { ascending: false }))

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

/** Tutte le rose di tutte le stagioni: tremila righe, per le statistiche. */
export const tutteLeRose = () =>
  unaVolta('tutteLeRose', () => db().from('rose')
    .select('calciatore, stagione, societa, nome, ruolo, club, costo, presenze, mv, fm'))

/**
 * La carriera di un calciatore in Caprera: una riga per stagione.
 *
 * Si chiede un calciatore alla volta. La vista intera sono 3.428 righe e
 * mezzo mega di JSON: scaricarla per mostrarne nove sarebbe la stessa cosa
 * che facevano i sedici mega di file che abbiamo tolto.
 */
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

/** Tutte le partite di campionato di sempre: 1.795 righe. */
export const tuttePartite = () =>
  unaVolta('tuttePartite', () => db().from('partite')
    .select('stagione, giornata, casa, fuori, gol_casa, gol_fuori, fp_casa, fp_fuori, giocata')
    .eq('competizione', 'campionato'))

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
    .select('stagione, societa, iniziali, spesi, scambi, residui, riportati, bonus, ffp')
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
  const { data, error } = await db().from('la_mia_scheda')
    .select('nome, cognome, soprannome, telefono, videochiamata, email, aggiornata')
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
