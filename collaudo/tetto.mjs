/**
 * La trappola per il tetto delle mille righe.
 *
 * Supabase risponde al massimo con mille righe e non lo dice: quello che
 * arriva e' un elenco valido, solo piu' corto della verita'. Non c'e' errore,
 * non c'e' pagina rotta — ci sono dei buchi, e i buchi sembrano dati mancanti.
 *
 * Ci e' costato una giornata: il listone del 2025-26 sono 1.519 righe, il
 * sito ne riceveva mille, e nella «mia rosa» la colonna delle quotazioni era
 * vuota per nove giocatori su dieci. Sembrava che l'archivio fosse
 * incompleto. L'archivio era completo.
 *
 * Questa non controlla le quattro letture che ho corretto oggi — controlla la
 * **regola**, e vale anche per quelle che scrivera' qualcun altro domani:
 *
 *   se una risposta torna con esattamente mille righe, la stessa domanda deve
 *   chiedere anche il pezzo dopo. Mille righe tonde non sono un archivio: sono
 *   un tetto.
 *
 *   const tetto = guardaIlTetto(p)
 *   ... naviga ...
 *   problemi.push(...tetto.problemi())
 */
const PAGINA = 1000

/** La domanda senza il pezzo: due letture della stessa cosa si somigliano. */
function domanda(url) {
  const u = new URL(url)
  u.searchParams.delete('offset')
  u.searchParams.delete('limit')
  return u.pathname + '?' + [...u.searchParams].sort().map(([k, v]) => `${k}=${v}`).join('&')
}

export function guardaIlTetto(p) {
  const piene = new Map()   // domanda -> da quale riga e' arrivato un pezzo pieno
  const chieste = new Set() // domanda + prima riga chiesta

  p.on('response', (r) => {
    const url = r.url()
    if (!url.includes('/rest/v1/')) return
    const d = domanda(url)
    const intervallo = /^(\d+)-(\d+)\//.exec(r.headers()['content-range'] ?? '')
    if (intervallo) {
      const da = Number(intervallo[1])
      const quante = Number(intervallo[2]) - da + 1
      chieste.add(`${d}@${da}`)
      if (quante === PAGINA) piene.set(d, da)
    }
  })

  return {
    problemi() {
      const fuori = []
      for (const [d, da] of piene) {
        // Un pezzo pieno va bene solo se qualcuno e' andato a vedere il dopo.
        if (!chieste.has(`${d}@${da + PAGINA}`)) {
          fuori.push(`[tetto] mille righe tonde e nessun seguito: ${d}`)
        }
      }
      return fuori
    },
    /** Quante letture sono passate dal tetto e hanno chiesto oltre. */
    resoconto() {
      return `letture oltre le mille righe: ${piene.size}`
    },
  }
}
