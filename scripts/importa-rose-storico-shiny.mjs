import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import pg from 'pg'
import {normalizza} from './rose-storico-source.mjs'

const source=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/rose-storico-shiny.json',import.meta.url)))
const dati=normalizza(source)
const schema=await fs.readFile(new URL('../supabase/migrations/20261018210000_caprera_rose_storico_shiny.sql',import.meta.url),'utf8')
const lit=v=>v==null?'null':typeof v==='number'?String(v):`'${v.replaceAll("'","''")}'`
let sql='-- Clubs > Rose, fotografia Shiny 18/10/2026. Contiene dettagli riservati: solo repository privato.\n'
for(const [key,table]of Object.entries({rose:'rose_storico_shiny',assenze:'rose_assenze_shiny',sintesi:'rose_sintesi_shiny',riservati:'rose_riservate_shiny'})){
 const cols=Object.keys(dati[key][0])
 sql+=`insert into caprera.${table} (${cols.join(',')}) values\n${dati[key].map(r=>`(${cols.map(k=>lit(r[k])).join(',')})`).join(',\n')};\n`
}
if(process.argv.includes('--solo-fonte')){console.log(JSON.stringify(Object.fromEntries(Object.entries(dati).map(([k,v])=>[k,v.length]))));process.exit(0)}
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
 await db.connect();await db.query('begin');await db.query("set local lock_timeout='5s'")
 const snapshot=async()=>{const out={};for(const t of ['partite','formazioni','formazione_giocatori','rose','listone','contratti','finanze'])out[t]=(await db.query(`select count(*)::int n,md5(string_agg(to_jsonb(t)::text,'' order by to_jsonb(t)::text)) hash from caprera.${t} t`)).rows[0];return out}
 const prima=await snapshot()
 const funzioni=(await db.query("select pg_get_functiondef('caprera.mia_societa()'::regprocedure) a,pg_get_functiondef('caprera.vede_tutto()'::regprocedure) b")).rows[0]
 assert.match(funzioni.a,/auth.uid/);assert.match(funzioni.b,/auth.uid/)
 await db.query(schema);await db.query(sql)
 assert.deepEqual(await snapshot(),prima)
 assert.equal((await db.query('select count(*)::int n from caprera.rose_storico_shiny')).rows[0].n,3193)
 for(const role of ['anon','authenticated']) {
  assert.equal((await db.query("select has_table_privilege($1,'caprera.rose_riservate_shiny','select') ok",[role])).rows[0].ok,false)
  assert.equal((await db.query("select has_table_privilege($1,'caprera.rose_storico_shiny','insert') ok",[role])).rows[0].ok,false)
 }
 assert.equal((await db.query("select has_function_privilege('anon','public.dettagli_rosa_shiny(text)','execute') ok")).rows[0].ok,false)
 await db.query('set local role anon');assert.equal((await db.query('select count(*)::int n from public.rose_storico_shiny')).rows[0].n,3193);await db.query('reset role')
 await db.query('set local role authenticated');assert.equal((await db.query("select public.dettagli_rosa_shiny('prosecco') d")).rows[0].d,null);await db.query('reset role')
 for(const [v,n,s]of [['20261018210000','caprera_rose_storico_shiny',schema],['20261018211000','caprera_rose_storico_shiny_dati',sql]])await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[v,n,[s]])
 if(process.argv.includes('--applica')) {
  await fs.writeFile(new URL('../../caprera-dati/SUPABASE/migrazioni-dati/20261018211000_caprera_rose_storico_shiny_dati.sql',import.meta.url),sql)
  await db.query('commit')
 } else await db.query('rollback')
 console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',conteggi:Object.fromEntries(Object.entries(dati).map(([k,v])=>[k,v.length])),datiPreesistenti:'identici',dettagliPrivati:'protetti'}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1}finally{await db.end()}
