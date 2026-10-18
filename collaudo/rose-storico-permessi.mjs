// Solo lettura: simula le identità in una transazione sempre annullata.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import pg from 'pg'
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
 await db.connect();await db.query('begin read only')
 const utenti=(await db.query('select utente,societa from caprera.misteri where utente is not null')).rows
 let propri=0,altriNegati=0,governo=0
 for(const u of utenti) {
  await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:u.utente,role:'authenticated'})])
  await db.query('set local role authenticated')
  const puo=(await db.query('select caprera.vede_tutto() ok')).rows[0].ok
  const suo=(await db.query('select public.dettagli_rosa_shiny($1) d',[u.societa])).rows[0].d
  if(u.societa){assert.equal(suo?.societa,u.societa);propri++}
  const altro=u.societa==='prosecco'?'roburro':'prosecco'
  const visibile=(await db.query('select public.dettagli_rosa_shiny($1) d',[altro])).rows[0].d
  if(puo){assert.equal(visibile?.societa,altro);governo++}else{assert.equal(visibile,null);altriNegati++}
  await db.query('reset role')
 }
 await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:'00000000-0000-0000-0000-000000000001',role:'authenticated'})])
 await db.query('set local role authenticated')
 assert.equal((await db.query("select public.dettagli_rosa_shiny('prosecco') d")).rows[0].d,null)
 await db.query('reset role')
 assert.equal((await db.query("select has_function_privilege('anon','public.dettagli_rosa_shiny(text)','execute') ok")).rows[0].ok,false)
 assert.equal((await db.query("select has_table_privilege('authenticated','caprera.rose_riservate_shiny','select') ok")).rows[0].ok,false)
 console.log(JSON.stringify({propri,altriNegati,governo,utenteSenzaTessera:'negato',anonimo:'negato',accessoDiretto:'negato'}))
}finally{await db.query('rollback').catch(()=>{});await db.end()}
