/**
 * Il tabellino di una partita: chi è sceso in campo e quanto ha portato.
 *
 * L'archivio registra chi era in formazione e che voto ha preso, ma **non**
 * registra chi è entrato: la colonna `entrato` dice un'altra cosa — dice che
 * quel panchinaro un voto in Serie A quella giornata l'ha preso, cioè che era
 * disponibile. Su una formazione qualsiasi ce ne sono dieci o undici: leggerla
 * come "è entrato" vorrebbe dire mostrare undici sostituzioni in una partita
 * che ne ammette quattro.
 *
 * Le sostituzioni quindi si applicano qui, con la regola della lega: al posto
 * di un titolare senza voto entra **il primo di panchina dello stesso ruolo
 * che il voto ce l'ha**, seguendo l'ordine in cui il mister ha messo la
 * panchina, fino a un massimo di quattro.
 *
 * Ricalcolando così tutte e 4.890 le formazioni dell'archivio, il totale
 * coincide con quello registrato in 4.828 casi (98,73%); nel 2023-24, nel
 * 2024-25 e nel 2025-26 in tutti. I 62 che non tornano stanno quasi tutti
 * nelle prime stagioni. Per questo `quadra` esiste: dove il conto non torna
 * la pagina lo dice, invece di mostrare un totale che contraddice il
 * risultato scritto in archivio.
 */

/**
 * Massimo di sostituzioni per partita, **per stagione**.
 *
 * Erano quattro fino al 2025-26. Dal 2026-27 sono cinque, per esito del
 * Referendum Separazione Carriere (L0, 30/08/2026).
 *
 * Non è una costante e non può esserlo: ricalcolare una partita del 2022-23
 * con cinque sostituzioni vorrebbe dire **riscrivere il passato con la regola
 * di adesso** — e il tabellino serve proprio a spiegare come è andata allora.
 * Stessa logica delle soglie del modificatore difesa qui sotto: ogni valore
 * vale dalla stagione in cui compare fino a quella in cui ne subentra un
 * altro.
 */
const SOSTITUZIONI = [
  ['2026-27', 5],
  ['0000-00', 4],   // tutto ciò che viene prima
]

export function maxSostituzioni(stagione) {
  return (SOSTITUZIONI.find(([da]) => (stagione ?? '9999-99') >= da) ?? ['', 4])[1]
}

/** Quante se ne fanno oggi. Per una partita, usare `maxSostituzioni(stagione)`. */
export const MAX_SOSTITUZIONI = maxSostituzioni('2026-27')

/**
 * Le eccezioni al valore di un bonus, per stagione.
 *
 * Una sola, e documentata nel regolamento: nel 2019-20 il gol vittoria valeva
 * mezzo punto invece di uno. Sta qui e non nel database perché una colonna
 * `valore` non sa dire "tranne quell'anno", e per una riga non vale la pena
 * di una tabella in più.
 */
const ECCEZIONI = {
  '2019-20': { 'gol-vittoria': 0.5 },
}

const ORDINE_RUOLI = { P: 0, D: 1, C: 2, A: 3 }

/**
 * Le soglie del modificatore difesa, stagione per stagione (regolamento,
 * § modificatori). Ogni scala vale dalla stagione in cui compare fino a
 * quella in cui ne subentra un'altra.
 *
 * **Questo non e' la fonte del valore.** Il modificatore che il tabellino
 * somma e mostra e' quello registrato in `formazione_modificatori`: e' quello
 * con cui la partita e' stata giocata, e resta l'unico buono. La scala serve
 * solo a *spiegare* — a dire quanto faceva la media della difesa e quanto
 * mancava alla soglia dopo. Se il ricalcolo non concorda con l'archivio, la
 * pagina tace invece di contraddirlo.
 *
 * Ricalcolata su tutte e 2.442 le formazioni dal 2021-22: coincide sempre.
 */
const SCALE_DIFESA = {
  '2021-22': [[6.5, 1], [6.0, 0.5]],
  '2022-23': [[7.0, 2.5], [6.75, 2], [6.5, 1.5], [6.25, 1], [6.0, 0.5]],
  '2024-25': [[7.25, 4.5], [6.75, 3.5], [6.5, 2.5], [6.25, 1.5], [6.0, 0.5]],
  '2025-26': [[7.0, 4], [6.75, 3], [6.5, 2], [6.25, 1]],
}

/** Quanti difensori bisogna schierare perche' il bonus spetti. */
const MINIMO_DIFENSORI = 4

/** La scala in vigore in una stagione: l'ultima non successiva a quella. */
function scalaDifesa(stagione) {
  const anni = Object.keys(SCALE_DIFESA).sort()
  let buona = null
  for (const a of anni) if (a <= stagione) buona = a
  return buona ? SCALE_DIFESA[buona] : null
}

/**
 * La media della difesa, e quanto mancava alla soglia successiva.
 *
 * Media di portiere e tre migliori difensori fra gli undici in campo, sul
 * **voto base** e non sul fantavoto: un difensore che segna alza il suo
 * fantavoto ma non la tenuta della difesa.
 *
 * Con meno di quattro difensori il bonus non spetta. Non e' scritto nel
 * regolamento, che rimanda a Fantapazz — e' stato ricavato dai dati, e
 * spiega due terzi degli scarti che restavano.
 */
export function mediaDifesa(campo, stagione) {
  const scala = scalaDifesa(stagione)
  if (!scala) return null           // prima del 2021-22 il modificatore non esiste

  const voti = (g) => g.voto != null
  const portiere = campo.find((g) => g.ruolo === 'P' && voti(g))
  const difensori = campo.filter((g) => g.ruolo === 'D' && voti(g))
    .map((g) => Number(g.voto)).sort((a, b) => b - a)

  if (!portiere || difensori.length < MINIMO_DIFENSORI) {
    return { pochi: true, difensori: difensori.length, minimo: MINIMO_DIFENSORI }
  }

  const media = mezzi((Number(portiere.voto) + difensori.slice(0, 3)
    .reduce((n, v) => n + v, 0)) / 4)

  let valore = 0
  let prossima = null
  for (const [soglia, v] of scala) {
    if (media >= soglia) { valore = v; break }
    prossima = { soglia, valore: v }      // l'ultima superata resta la piu' vicina
  }

  return {
    media,
    difensori: difensori.length,
    valore,
    prossima,
    mancano: prossima ? mezzi(prossima.soglia - media) : null,
  }
}

/** I decimali del fantacalcio arrivano a mezzo punto: si arrotonda lì. */
const mezzi = (n) => Math.round(n * 100) / 100

/**
 * Il fantavoto di un giocatore: voto base più i suoi bonus.
 * Senza voto non c'è fantavoto — e non è zero, è niente.
 */
export function fantavoto(g, valori, stagione) {
  if (g.voto == null) return null
  const ecc = ECCEZIONI[stagione] ?? {}
  let v = Number(g.voto)
  for (const b of g.bonus ?? []) {
    v += ecc[b.id] ?? valori.get(b.id) ?? 0
  }
  return mezzi(v)
}

/**
 * Il tabellino di un lato.
 *
 * Torna gli undici che contano davvero — titolari con voto più i sostituti
 * entrati — la panchina con l'esito di ognuno, i modificatori e il totale.
 */
export function tabellinoLato(lato, valori, stagione, fpRegistrati) {
  const conFv = (g) => ({ ...g, fv: fantavoto(g, valori, stagione) })
  // Quante se ne facevano QUELL'anno, non quante se ne fanno adesso.
  const massimo = maxSostituzioni(stagione)

  const titolari = [...(lato.titolari ?? [])]
    .sort((a, b) => a.ordine - b.ordine).map(conFv)
  const panchina = [...(lato.panchina ?? [])]
    .sort((a, b) => a.ordine - b.ordine).map(conFv)

  const usati = new Set()
  const campo = []
  const cambi = []

  for (const t of titolari) {
    if (t.fv != null) {
      campo.push({ ...t, come: 'titolare' })
      continue
    }
    /* Il primo di panchina di quel ruolo che ha preso voto, nell'ordine in
       cui il mister l'ha messa. Esaurite le sostituzioni di quella stagione,
       il posto resta vuoto: e' quello che succede davvero. */
    const i = panchina.findIndex(
      (p, k) => !usati.has(k) && p.ruolo === t.ruolo && p.fv != null
    )
    if (i === -1 || cambi.length >= massimo) {
      campo.push({ ...t, come: 'assente' })
      continue
    }
    usati.add(i)
    const entra = panchina[i]
    cambi.push({ esce: t, entra })
    campo.push({ ...entra, come: 'entrato', alPostoDi: t })
  }

  const modificatori = (lato.modificatori ?? [])
    .map((m) => ({ ...m, valore: Number(m.valore) }))
  const sommaModificatori = modificatori.reduce((n, m) => n + m.valore, 0)

  const sommaCampo = campo.reduce((n, g) => n + (g.fv ?? 0), 0)
  const totale = mezzi(sommaCampo + sommaModificatori)

  /*
   * La difesa: quanto ha fatto di media e quanto mancava alla soglia dopo.
   * Serve a spiegare il modificatore, non a produrlo — il valore sommato
   * resta quello dell'archivio. Se il ricalcolo non concorda con quello che
   * c'e' scritto, `difesa.attendibile` diventa falso e la pagina non ne
   * parla: meglio non dire niente che dire una cosa diversa dall'archivio.
   */
  const difesa = mediaDifesa(campo, stagione)
  if (difesa && !difesa.pochi) {
    const registrato = modificatori.find((m) => /difesa/i.test(m.nome))?.valore ?? 0
    difesa.attendibile = Math.abs(difesa.valore - registrato) < 0.01
  } else if (difesa?.pochi) {
    difesa.attendibile = !modificatori.some((m) => /difesa/i.test(m.nome))
  }

  /* Il confronto con quello che c'e' scritto in archivio: se non coincide,
     e' il ricalcolo a essere sospetto, non l'archivio. */
  const registrati = fpRegistrati == null ? null : Number(fpRegistrati)
  const quadra = registrati == null ? null : Math.abs(totale - registrati) < 0.01

  return {
    societa: lato.societa,
    mister: lato.mister,
    modulo: lato.modulo,
    inviata: lato.inviata,
    avviso: lato.avviso,
    campo,
    cambi,
    panchina: panchina.map((p, k) => ({
      ...p,
      entrato: usati.has(k),
      disponibile: p.fv != null,
    })),
    modificatori,
    difesa,
    sommaCampo: mezzi(sommaCampo),
    sommaModificatori: mezzi(sommaModificatori),
    totale,
    registrati,
    quadra,
  }
}

/** I reparti, per disegnare la formazione a blocchi invece che a elenco. */
export function perReparto(giocatori) {
  const m = new Map([['P', []], ['D', []], ['C', []], ['A', []]])
  for (const g of giocatori) {
    if (!m.has(g.ruolo)) m.set(g.ruolo, [])
    m.get(g.ruolo).push(g)
  }
  return [...m.entries()]
    .filter(([, v]) => v.length)
    .sort((a, b) => (ORDINE_RUOLI[a[0]] ?? 9) - (ORDINE_RUOLI[b[0]] ?? 9))
}
