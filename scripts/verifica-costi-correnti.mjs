import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'

const fonte = JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/rose-correnti-import.json', import.meta.url), 'utf8'))
const db = new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect()
  const rows=(await db.query("select societa,nome,ruolo,club,costo from caprera.rose where stagione='2026-27' and momento='corrente' order by societa,nome")).rows
  const sort = rs => rs.map(r=>JSON.stringify([r.societa,r.nome,r.ruolo,r.club,Number(r.costo)])).sort()
  assert.deepEqual(sort(rows),sort(fonte.rose),'Costi/rose diversi dalla fonte Fantapazz')
  console.log(JSON.stringify({rose:rows.length,costi:'identici al file ufficiale',totali:Object.fromEntries([...new Set(rows.map(r=>r.societa))].map(s=>[s,rows.filter(r=>r.societa===s).reduce((n,r)=>n+Number(r.costo),0)]))}))
  console.log(JSON.stringify({finanze:(await db.query("select * from caprera.finanze where stagione='2026-27' order by societa")).rows}))
  console.log(JSON.stringify({vincoli:(await db.query("select conname,pg_get_constraintdef(oid) def from pg_constraint where conrelid='caprera.finanze'::regclass")).rows,trigger:(await db.query("select tgname,pg_get_triggerdef(oid) def from pg_trigger where tgrelid='caprera.finanze'::regclass and not tgisinternal")).rows}))
} catch(e) {console.error(e.message);process.exitCode=1} finally {await db.end()}
