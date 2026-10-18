/** Allinea solo spesi 2026-27 ai costi dell'export verificato. Default rollback. */
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const sql=await fs.readFile(new URL('../../caprera-dati/SUPABASE/migrazioni-dati/20261018120000_caprera_costi_rose_correnti.sql',import.meta.url),'utf8')
const fonte=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/rose-correnti-import.json',import.meta.url),'utf8'))
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect(); await db.query('begin')
  await db.query("set local lock_timeout='5s'")
  await db.query("select pg_advisory_xact_lock(hashtext('caprera-costi-2026-27'))")
  const prima=(await db.query('select * from caprera.finanze order by stagione,societa for update')).rows
  const rose=(await db.query("select societa,nome,ruolo,club,costo from caprera.rose where stagione='2026-27' and momento='corrente'")).rows
  const normalizza=rs=>rs.map(r=>JSON.stringify([r.societa,r.nome,r.ruolo,r.club,Number(r.costo)])).sort()
  assert.deepEqual(normalizza(rose),normalizza(fonte.rose))
  assert.equal(prima.filter(r=>r.stagione==='2026-27').length,10)
  for(const r of prima.filter(r=>r.stagione==='2026-27')) {
    const totale=rose.filter(p=>p.societa===r.societa).reduce((n,p)=>n+Number(p.costo),0)
    assert.ok(r.spesi==null || r.spesi===totale,'Costo già valorizzato e differente: verificare prima di sovrascrivere')
  }
  await db.query(sql)
  const dopo=(await db.query('select * from caprera.finanze order by stagione,societa')).rows
  const atteso=prima.map(r=>r.stagione==='2026-27'?{...r,spesi:rose.filter(p=>p.societa===r.societa).reduce((n,p)=>n+Number(p.costo),0)}:r)
  assert.deepEqual(dopo,atteso,'Devono cambiare solo i costi correnti')
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements)
    values('20261018120000','caprera_costi_rose_correnti',$1) on conflict(version) do nothing`,[[sql]])
  await db.query(process.argv.includes('--applica')?'commit':'rollback')
  console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',societa:10,giocatori:310,creditiTotali:rose.reduce((n,r)=>n+Number(r.costo),0),storico:'identico',altriCampiFinanze:'identici'}))
} catch(e) {await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1} finally {await db.end()}
