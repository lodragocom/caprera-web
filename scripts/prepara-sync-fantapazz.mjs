// Installs only the private audit table; never imports sports or financial data.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { parseArgs } from 'node:util'
import pg from 'pg'

const {values}=parseArgs({options:{applica:{type:'boolean'}}})
const version='20261018230000',name='caprera_sync_fantapazz_audit'
const sql=await fs.readFile(new URL(`../supabase/migrations/${version}_${name}.sql`,import.meta.url),'utf8')
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect();await db.query('begin')
  await db.query("set local lock_timeout='5s'")
  await db.query('select pg_advisory_xact_lock($1)',[18230000])
  const old=(await db.query('select statements from supabase_migrations.schema_migrations where version=$1',[version])).rows[0]
  if (old) assert.deepEqual(old.statements,[sql],'Migrazione registrata con contenuto diverso')
  else {
    await db.query(sql)
    await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[version,name,[sql]])
  }
  for (const role of ['anon','authenticated']) for (const permission of ['select','insert','update','delete'])
    assert.equal((await db.query("select has_table_privilege($1,'caprera.sync_fantapazz_audit',$2) ok",[role,permission])).rows[0].ok,false)
  assert.equal((await db.query("select relrowsecurity rls from pg_class where oid='caprera.sync_fantapazz_audit'::regclass")).rows[0].rls,true)
  await db.query(values.applica?'commit':'rollback')
  console.log(JSON.stringify({stato:old?'gia_installato':values.applica?'installato':'verificato_rollback',versione:version,sola_tabella_audit:true}))
} catch(e) {await db.query('rollback').catch(()=>{});console.error({errore:e.code??e.name,motivo:String(e.message).split('\n')[0]});process.exitCode=1}
finally {await db.end()}
