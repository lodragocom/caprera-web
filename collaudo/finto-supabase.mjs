/**
 * Un finto Supabase, giusto quanto basta per collaudare il sito.
 *
 * Il container in cui lavoro non ha rete verso Supabase, quindi senza questo
 * le pagine che leggono dal database si potrebbero solo guardare in fotografia.
 * E spedire pagine non provate e' esattamente l'errore che ha ucciso la
 * pagina Coppe.
 *
 * Parla il minimo dialetto di PostgREST che il sito usa davvero:
 *   ?select=a,b,c        le colonne, anche annidate: turni(id, nome)
 *   ?colonna=eq.valore   uguale
 *   ?colonna=in.(1,2,3)  dentro un elenco
 *   ?colonna=ilike.*x*   contiene
 *   ?order=col.desc      ordinamento, anche multiplo
 *   ?limit=20
 *   Accept: application/vnd.pgrst.object+json   una riga sola
 *
 * Davanti ha il Postgres di prova, che contiene lo stesso archivio caricato
 * su Supabase. Non e' un doppione del vero: e' un banco di prova.
 *
 *     node collaudo/finto-supabase.mjs &
 *     VITE_SUPABASE_URL=http://localhost:5410 npm run build
 */
import { createServer } from 'node:http'
import pg from 'pg'

/*
 * Sa fare anche l'accesso, quel tanto che basta.
 *
 * La Tessera del Tifoso cambia cosa il sito riesce a leggere, e senza queste
 * quaranta righe l'unica parte provabile sarebbe la porta chiusa. Non e' un
 * sistema di autenticazione: e' un manichino che risponde come risponderebbe
 * Supabase, cosi' si puo' vedere davvero cosa succede dopo l'ingresso.
 */
const UTENTI = new Map()   // email -> { id, email }

function finto_jwt(u) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return [b64({ alg: 'HS256', typ: 'JWT' }),
          b64({ sub: u.id, email: u.email, role: 'authenticated',
                exp: Math.floor(Date.now() / 1000) + 3600 }),
          'finto'].join('.')
}

function sessione(u) {
  return {
    access_token: finto_jwt(u), refresh_token: 'finto', token_type: 'bearer',
    expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: u,
  }
}

function utente(email) {
  const e = String(email).trim().toLowerCase()
  if (!UTENTI.has(e)) {
    UTENTI.set(e, {
      id: `00000000-0000-4000-8000-${String(UTENTI.size + 1).padStart(12, '0')}`,
      email: e, aud: 'authenticated', role: 'authenticated',
      created_at: new Date(0).toISOString(), user_metadata: {}, app_metadata: {},
    })
  }
  return UTENTI.get(e)
}

/** Chi e' collegato adesso, letto dal token che il sito rimanda indietro. */
function chiE(req) {
  const a = req.headers.authorization ?? ''
  const t = a.replace(/^Bearer /, '')
  if (!t || t.split('.').length !== 3 || t === process.env.CHIAVE) return null
  try {
    const p = JSON.parse(Buffer.from(t.split('.')[1], 'base64url').toString())
    return p.email ?? null
  } catch { return null }
}

const PORTA = Number(process.env.PORTA ?? 5410)

// PostgREST rimanda i bigint come numeri; il driver di node li darebbe come
// stringhe. Senza questo il banco di prova mentirebbe sui tipi, ed e'
// esattamente sui tipi che nascono i guai.
pg.types.setTypeParser(20, (v) => Number(v))     // int8
pg.types.setTypeParser(1700, (v) => Number(v))   // numeric
const pool = new pg.Pool({
  host: '/tmp', port: 5433, user: 'caprera', database: process.env.PGDB ?? 'prova2',
})

/** select=a,b,figli(x,y) -> colonne semplici piu' le tabelle annidate */
function leggiSelect(s) {
  const semplici = []
  const annidate = []
  let i = 0
  while (i < s.length) {
    let j = i
    let liv = 0
    while (j < s.length && !(s[j] === ',' && liv === 0)) {
      if (s[j] === '(') liv += 1
      if (s[j] === ')') liv -= 1
      j += 1
    }
    const pezzo = s.slice(i, j).trim()
    const m = pezzo.match(/^(\w+)\((.*)\)$/s)
    if (m) annidate.push({ tabella: m[1], colonne: leggiSelect(m[2]).semplici })
    else if (pezzo) semplici.push(pezzo)
    i = j + 1
  }
  return { semplici, annidate }
}

const CONFRONTI = {
  eq: '=', neq: '<>', gt: '>', gte: '>=', lt: '<', lte: '<=',
}

function condizione(colonna, valore, valori) {
  // `colonna=not.is.null` -> la stessa condizione, negata
  if (valore.startsWith('not.')) {
    return `not (${condizione(colonna, valore.slice(4), valori)})`
  }
  const [op, ...resto] = valore.split('.')
  const arg = resto.join('.')
  if (CONFRONTI[op]) {
    valori.push(arg === 'null' ? null : arg)
    return `"${colonna}" ${CONFRONTI[op]} $${valori.length}`
  }
  if (op === 'is') return `"${colonna}" is ${arg === 'null' ? 'null' : arg}`
  if (op === 'in') {
    const elenco = arg.replace(/^\(|\)$/g, '').split(',').filter(Boolean)
    const segna = elenco.map((v) => { valori.push(v); return `$${valori.length}` })
    return segna.length ? `"${colonna}" in (${segna.join(',')})` : 'false'
  }
  if (op === 'ilike') {
    valori.push(arg.replace(/\*/g, '%'))
    return `"${colonna}"::text ilike $${valori.length}`
  }
  throw new Error(`confronto non previsto: ${op}`)
}

createServer(async (req, res) => {
  const rispondi = (codice, corpo) => {
    res.writeHead(codice, {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,OPTIONS',
    })
    res.end(JSON.stringify(corpo))
  }
  if (req.method === 'OPTIONS') return rispondi(200, {})

  /** Il corpo della richiesta, quando c'e'. */
  const leggiCorpo = () => new Promise((ok) => {
    let b = ''
    req.on('data', (c) => { b += c })
    req.on('end', () => { try { ok(JSON.parse(b || '{}')) } catch { ok({}) } })
  })

  try {
    const u = new URL(req.url, 'http://x')

    /* ------------------------------------------------ l'accesso */
    if (u.pathname.startsWith('/auth/v1/')) {
      const corpo = await leggiCorpo()
      if (u.pathname.endsWith('/token') || u.pathname.endsWith('/signup')) {
        if (!corpo.email) return rispondi(400, { message: 'manca l\'email' })
        return rispondi(200, sessione(utente(corpo.email)))
      }
      if (u.pathname.endsWith('/user')) {
        const e = chiE(req)
        if (!e) return rispondi(401, { message: 'non collegato' })
        // Il cambio password: qui non c'e' niente da cambiare, ma la
        // risposta deve avere la forma giusta, comprese le lamentele.
        if (req.method === 'PUT' && corpo.password !== undefined) {
          if (String(corpo.password).length < 6) {
            return rispondi(422, { message: 'Password should be at least 6 characters' })
          }
        }
        return rispondi(200, utente(e))
      }
      if (u.pathname.endsWith('/logout')) return rispondi(204, {})
      if (u.pathname.endsWith('/recover')) return rispondi(200, {})
      return rispondi(200, {})
    }
    /* La rete di sicurezza: il sito la chiama quando non risulta collegato. */
    if (u.pathname === '/rest/v1/rpc/attiva_la_mia_tessera') {
      const e = chiE(req)
      if (!e) return rispondi(200, [])
      const { rows } = await pool.query(
        'select societa, nome, ruolo from caprera.tessere where email = $1', [e])
      return rispondi(200, rows)
    }

    /* La scheda: si scrive passando da qui, come sul vero. */
    if (u.pathname === '/rest/v1/rpc/salva_la_mia_scheda') {
      const e = chiE(req)
      if (!e) return rispondi(401, { message: 'non sei entrato' })
      const c = await leggiCorpo()
      await pool.query(
        `insert into caprera.schede_prova
           (email, nome, cognome, soprannome, telefono, videochiamata, aggiornata)
         values ($1,$2,$3,$4,$5,$6, now())
         on conflict (email) do update set nome = excluded.nome,
           cognome = excluded.cognome, soprannome = excluded.soprannome,
           telefono = excluded.telefono, videochiamata = excluded.videochiamata,
           aggiornata = now()`,
        [e, c.p_nome, c.p_cognome, c.p_soprannome, c.p_telefono, c.p_videochiamata])
      return rispondi(200, null)
    }

    const tabella = u.pathname.replace(/^\/rest\/v1\//, '')
    if (!/^\w+$/.test(tabella)) return rispondi(404, { message: 'tabella?' })

    const { semplici, annidate } = leggiSelect(u.searchParams.get('select') ?? '*')
    const valori = []
    const dove = []
    let ordine = ''
    let limite = ''

    for (const [k, v] of u.searchParams) {
      if (k === 'select') continue
      if (k === 'order') {
        ordine = ' order by ' + v.split(',').map((p) => {
          const [c, d, n] = p.split('.')
          return `"${c}" ${d === 'desc' ? 'desc' : 'asc'}`
            + (n === 'nullsfirst' ? ' nulls first' : n === 'nullslast' ? ' nulls last' : '')
        }).join(', ')
        continue
      }
      if (k === 'limit') { limite = ` limit ${Number(v) || 100}`; continue }
      if (k === 'offset') continue
      dove.push(condizione(k, v, valori))
    }

    /* La tessera dipende da chi e' collegato: qui la si cerca per email. */
    if (tabella === 'la_mia_tessera') {
      const e = chiE(req)
      if (!e) return rispondi(200, null)
      const { rows } = await pool.query(
        'select societa, nome, ruolo from caprera.tessere where email = $1', [e])
      return rispondi(200, (req.headers.accept ?? '').includes('pgrst.object')
        ? (rows[0] ?? null) : rows)
    }

    /* Anche queste due dipendono da chi e' collegato, non dalla query. */
    if (tabella === 'i_miei_incarichi') {
      const e = chiE(req)
      if (!e) return rispondi(200, [])
      const { rows } = await pool.query(
        `select a.incarico, i.nome, i.vede_tutto, i.puo_scrivere
           from caprera.assegnazioni_prova a
           join caprera.incarichi i on i.id = a.incarico
          where a.email = $1 order by i.ordine`, [e])
      return rispondi(200, rows)
    }

    if (tabella === 'la_mia_scheda') {
      const e = chiE(req)
      if (!e) return rispondi(200, null)
      const { rows } = await pool.query(
        `select nome, cognome, soprannome, telefono, videochiamata, aggiornata,
                email from caprera.schede_prova where email = $1`, [e])
      return rispondi(200, (req.headers.accept ?? '').includes('pgrst.object')
        ? (rows[0] ?? null) : rows)
    }

    const cols = semplici.length ? semplici.map((c) => `"${c}"`).join(', ') : '*'
    const sql = `select ${cols} from public."${tabella}"`
      + (dove.length ? ' where ' + dove.join(' and ') : '') + ordine + limite
    const { rows } = await pool.query(sql, valori)

    // le tabelle annidate: una lettura in piu' per ciascuna, con la chiave
    // che PostgREST ricava dalle foreign key. Qui la sappiamo: e' `edizione`.
    for (const a of annidate) {
      const ids = rows.map((r) => r.id).filter((x) => x != null)
      const figli = ids.length
        ? (await pool.query(
            `select ${a.colonne.map((c) => `"${c}"`).join(', ')}, edizione
               from public."${a.tabella}" where edizione = any($1)`, [ids])).rows
        : []
      for (const r of rows) {
        r[a.tabella] = figli.filter((f) => f.edizione === r.id)
          .map(({ edizione, ...resto }) => resto)
      }
    }

    const unaSola = (req.headers.accept ?? '').includes('pgrst.object')
    rispondi(200, unaSola ? (rows[0] ?? null) : rows)
  } catch (e) {
    rispondi(400, { message: String(e.message ?? e) })
  }
}).listen(PORTA, () => console.log(`finto Supabase in ascolto sulla ${PORTA}`))
