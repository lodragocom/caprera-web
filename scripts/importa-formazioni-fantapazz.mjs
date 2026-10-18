import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import pg from 'pg'
import { parseArgs } from 'node:util'

const { values: opzioni } = parseArgs({ options: {
  giornata: { type: 'string', default: '2' },
  versione: { type: 'string' },
  applica: { type: 'boolean', default: false },
} })
const giornata = Number(opzioni.giornata)
assert.ok(Number.isInteger(giornata) && giornata >= 1 && giornata <= 36, 'Giornata non valida')
const suffisso = `g${String(giornata).padStart(2, '0')}`
const version = opzioni.versione ?? (giornata === 2 ? '20261018173000' : '')
assert.match(version, /^\d{14}$/, 'Specificare --versione con un identificativo migrazione di 14 cifre')
const fonte = JSON.parse(await fs.readFile(new URL(`../../caprera-dati/FONTI/2026-27/formazioni-fantapazz-${suffisso}.json`, import.meta.url), 'utf8'))
assert.equal(fonte.stagione, '2026-27')
assert.equal(fonte.giornata, giornata)
assert.equal(fonte.partite.length, 5)
const formazioniFonte = fonte.partite.flatMap(p => p.formazioni)
assert.equal(formazioniFonte.length, 10)
assert.equal(new Set(formazioniFonte.map(f => f.societa)).size, 10)
const giocatoriAttesi = formazioniFonte.reduce((n, f) => n + f.giocatori.length, 0)
const entratiAttesi = formazioniFonte.reduce((n, f) => n + f.giocatori.filter(g => g.entrato).length, 0)
const name = `caprera_formazioni_2026_27_${suffisso}`
const lit = v => v == null ? 'null' : typeof v === 'number' || typeof v === 'boolean' ? String(v) : `'${v.replaceAll("'", "''")}'`
const db = new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(), '.caprera-dsn'), 'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect()
  await db.query('begin')
  await db.query("set local lock_timeout='5s'")
  assert.equal((await db.query('select version from supabase_migrations.schema_migrations where version=$1',[version])).rowCount,0,'Versione migrazione già utilizzata')
  // Stabilizza anche le righe preesistenti durante confronto e importazione.
  await db.query('lock table caprera.formazioni,caprera.formazione_giocatori,caprera.formazione_bonus,caprera.formazione_modificatori in share row exclusive mode')
  const maxF = (await db.query('select coalesce(max(id),0) id from caprera.formazioni')).rows[0].id
  const maxG = (await db.query('select coalesce(max(id),0) id from caprera.formazione_giocatori')).rows[0].id
  const impronta = async () => {
    const out = {}
    for (const [tab,where] of Object.entries({partite:'true',rose:'true',formazioni:`id<=${maxF}`,formazione_giocatori:`id<=${maxG}`,formazione_bonus:`giocatore<=${maxG}`,formazione_modificatori:`formazione<=${maxF}`})) {
      out[tab] = (await db.query(`select count(*)::int n,md5(string_agg(to_jsonb(t)::text,'' order by to_jsonb(t)::text)) hash from caprera.${tab} t where ${where}`)).rows[0]
    }
    return out
  }
  const prima = await impronta()
  const calciatori = (await db.query('select id,nome,ruolo from caprera.calciatori')).rows
  const bonus = new Map((await db.query('select id,valore from caprera.bonus_tipi')).rows.map(b=>[b.id,Number(b.valore)]))
  const partite = (await db.query("select * from caprera.partite where stagione=$1 and giornata=$2 and competizione='campionato' for update", [fonte.stagione,fonte.giornata])).rows
  assert.equal(partite.length, 5)
  const ids = partite.map(p=>p.id)
  assert.equal((await db.query('select id from caprera.formazioni where partita=any($1::bigint[])',[ids])).rowCount,0,'Formazioni già presenti: importazione interrotta senza sostituirle')
  let sql = `-- Fonte: ${fonte.fonte}\n-- HTML SHA256: ${fonte.sha256_html}\n-- Giornata Caprera ${fonte.giornata}, Serie A ${fonte.giornata_serie_a}. Nessuna modifica ai risultati.\n`
  let nGiocatori=0, nEntrati=0, nCollegati=0
  for (const p of fonte.partite) {
    const matches=partite.filter(m=>m.casa===p.casa&&m.fuori===p.fuori)
    assert.equal(matches.length,1)
    const partita=matches[0]
    for(const k of ['gol_casa','gol_fuori','fp_casa','fp_fuori']) assert.equal(Number(partita[k]),p[k],`${p.casa} ${k}`)
    const pSQL=`(select id from caprera.partite where stagione=${lit(fonte.stagione)} and competizione='campionato' and giornata=${fonte.giornata} and casa=${lit(p.casa)} and fuori=${lit(p.fuori)})`
    for (const [i,f] of p.formazioni.entries()) {
      assert.equal(f.societa, i === 0 ? p.casa : p.fuori)
      assert.equal(f.giocatori.filter(g => g.titolare).length, 11)
      assert.equal(new Set(f.giocatori.map(g => g.fantapazz_id)).size, f.giocatori.length)
      const attivi=f.giocatori.filter(g=>(g.titolare||g.entrato)&&g.voto!=null)
      // Una squadra può terminare in inferiorità: la fonte conserva gli undici
      // titolari, ma senza riserve utili i giocatori a voto possono essere meno.
      assert.ok(attivi.length > 0 && attivi.length <= 11, `Giocatori a voto non validi: ${f.societa}`)
      const totale=attivi.reduce((s,g)=>s+g.voto+g.bonus.reduce((t,b)=>{assert.ok(bonus.has(b));return t+bonus.get(b)},0),0)+f.modificatori.reduce((s,m)=>s+(m.valore??0),0)
      assert.equal(totale,p[i===0?'fp_casa':'fp_fuori'],`Punteggio ${f.societa}`)
      sql+=`insert into caprera.formazioni(partita,societa,modulo,inviata) values(${pSQL},${[f.societa,f.modulo,f.inviata].map(lit).join(',')});\n`
      const fSQL=`(select id from caprera.formazioni where partita=${pSQL} and societa=${lit(f.societa)})`
      for(const g of f.giocatori) {
        const noto=calciatori.find(c=>c.id===g.fantapazz_id&&c.nome.toLowerCase()===g.nome.toLowerCase()&&c.ruolo===g.ruolo)
        nCollegati+=Number(Boolean(noto)); nGiocatori++; nEntrati+=Number(g.entrato)
        sql+=`insert into caprera.formazione_giocatori(formazione,titolare,ordine,calciatore,nome,ruolo,sfida,voto,fascia,entrato) values(${fSQL},${[g.titolare,g.ordine,noto?.id??null,g.nome,g.ruolo,g.sfida,g.voto,g.fascia,g.entrato].map(lit).join(',')});\n`
        const gSQL=`(select id from caprera.formazione_giocatori where formazione=${fSQL} and titolare=${lit(g.titolare)} and ordine=${g.ordine})`
        for(const b of new Set(g.bonus)) sql+=`insert into caprera.formazione_bonus(giocatore,bonus,quante) values(${gSQL},${lit(b)},${g.bonus.filter(x=>x===b).length});\n`
      }
      for(const m of f.modificatori) sql+=`insert into caprera.formazione_modificatori(formazione,nome,valore) values(${fSQL},${lit(m.nome)},${lit(m.valore)});\n`
    }
  }
  assert.equal(nGiocatori,giocatoriAttesi); assert.equal(nEntrati,entratiAttesi)
  await db.query(sql)
  assert.deepEqual(await impronta(),prima,'Tutti i dati precedenti devono rimanere identici')
  const nF=(await db.query('select count(*)::int n from caprera.formazioni where partita=any($1::bigint[])',[ids])).rows[0].n
  const nG=(await db.query('select count(*)::int n from caprera.formazione_giocatori g join caprera.formazioni f on f.id=g.formazione where f.partita=any($1::bigint[])',[ids])).rows[0].n
  assert.equal(nF,10); assert.equal(nG,giocatoriAttesi)
  await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[version,name,[sql]])
  if(opzioni.applica) {
    // Fonte autenticata: conserva la migrazione dei contenuti nel repository privato.
    await fs.writeFile(new URL(`../../caprera-dati/SUPABASE/migrazioni-dati/${version}_${name}.sql`,import.meta.url),sql)
    await db.query('commit')
  } else await db.query('rollback')
  console.log(JSON.stringify({stato:opzioni.applica?'applicato':'verificato_rollback',giornata:fonte.giornata,formazioni:nF,giocatori:nG,entrati:nEntrati,collegati:nCollegati,punteggi:'10 su 10 identici',datiPreesistenti:'identici'}))
} catch(e) { await db.query('rollback').catch(()=>{}); console.error(e.message);process.exitCode=1 }
finally { await db.end() }
