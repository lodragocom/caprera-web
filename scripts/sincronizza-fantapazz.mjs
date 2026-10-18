import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { parseArgs } from 'node:util'
import assert from 'node:assert/strict'
import pg from 'pg'
import { synchronize } from './lib/import-sync-fantapazz.mjs'

// Normalized full snapshots only. Partial pilot acquisitions are not DB input.
const {values:args}=parseArgs({options:{precedente:{type:'string'},nuova:{type:'string'},applica:{type:'boolean'},
  'conferma-sha256':{type:'string'},'accetta-rettifiche':{type:'boolean'},rapporto:{type:'string'}}})
let db,reportHandle
try {
  assert.ok(args.precedente&&args.nuova,'Uso: node scripts/sincronizza-fantapazz.mjs --precedente FILE --nuova FILE [--rapporto FILE] [--applica --conferma-sha256 SHA256]')
  const read=async file=>{const bytes=await fs.readFile(file);assert.ok(bytes.length<16*1024*1024,'Fonte troppo grande');assert.ok(!bytes.includes('[MaxDepth]'),'Fonte troncata');return {source:JSON.parse(bytes),hash:createHash('sha256').update(bytes).digest('hex')}}
  const before=await read(args.precedente),after=await read(args.nuova)
  if (args.applica) assert.equal(args['conferma-sha256'],after.hash,'Confermare SHA256 del file normalizzato esaminato')
  // Reserve the report before touching DB; never overwrite an existing report/source.
  if (args.rapporto) reportHandle=await fs.open(args.rapporto,'wx',0o600)
  db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
  await db.connect(); await db.query('begin')
  const report=await synchronize(db,before.source,after.source,{acceptCorrections:!!args['accetta-rettifiche']})
  const output={...report,transazione:args.applica?'commit':'rollback',file_precedente_sha256:before.hash,file_nuovo_sha256:after.hash}
  // Persist the planned report before commit; append the actual outcome afterwards.
  if (reportHandle) {await reportHandle.writeFile(JSON.stringify({...output,transazione:'in_attesa'})+'\n');await reportHandle.sync()}
  await db.query(args.applica?'commit':'rollback')
  if (reportHandle) {await reportHandle.writeFile(JSON.stringify(output)+'\n');await reportHandle.sync()}
  console.log(JSON.stringify(output))
} catch (error) {
  await db?.query('rollback').catch(()=>{})
  // No stack, DSN, SQL parameters, or source values in operational logs.
  const failure={stato:'bloccato',errore:error.code??error.name,motivo:String(error.message).split('\n')[0]}
  console.error(JSON.stringify(failure))
  if (reportHandle) await reportHandle.writeFile(JSON.stringify(failure)+'\n').catch(()=>{})
  process.exitCode=1
} finally {await reportHandle?.close();await db?.end()}
