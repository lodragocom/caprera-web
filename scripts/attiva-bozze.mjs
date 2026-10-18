import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const sql=await fs.readFile(new URL('../supabase/migrations/20261018100000_caprera_bozze_formazione.sql',import.meta.url),'utf8')
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect()
  await db.query('begin')
  await db.query("set local lock_timeout='5s'")
  assert.equal((await db.query("select to_regclass('caprera.bozze_formazione') t")).rows[0].t,null)
  await db.query(sql.replace(/^begin;$/m,'').replace(/^commit;$/m,''))
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements)
    values ('20261018100000','caprera_bozze_formazione',$1)`,[[sql]])
  if(process.argv.includes('--applica')) {
    await db.query('commit')
    console.log('Bozze attivate. Nessuna consegna ufficiale creata, nessuna scadenza inventata.')
  } else {
    await db.query('rollback')
    console.log('Migrazione verificata e annullata.')
  }
} catch(e) {
  await db.query('rollback').catch(()=>{})
  console.error(e.message)
  process.exitCode=1
} finally { await db.end() }
