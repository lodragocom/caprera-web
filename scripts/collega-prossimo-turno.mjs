import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const sql=await fs.readFile(new URL('../supabase/migrations/20261018103000_caprera_prossimo_turno_shiny.sql',import.meta.url),'utf8')
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect()
  await db.query('begin')
  await db.query("set local lock_timeout='5s'")
  const storico=(await db.query(`select md5(string_agg(md5(to_jsonb(p)::text),'' order by id)) h
    from caprera.partite p where stagione <> '2026-27'`)).rows[0].h
  assert.equal((await db.query("select count(*)::int n from caprera.partite where stagione='2026-27' and competizione='campionato' and giornata=5")).rows[0].n,0)
  await db.query(sql)
  assert.equal((await db.query(`select md5(string_agg(md5(to_jsonb(p)::text),'' order by id)) h
    from caprera.partite p where stagione <> '2026-27'`)).rows[0].h,storico)
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements)
    values ('20261018103000','caprera_prossimo_turno_shiny',$1)`,[[sql]])
  if(process.argv.includes('--applica')) {
    await db.query('commit')
    console.log('Collegati i cinque incontri della prossima giornata (5ª) letti dalla Shiny. Storico identico.')
  } else {
    await db.query('rollback')
    console.log('Verifica superata e annullata.')
  }
  // Rilegge il contesto con i permessi di un mister reale, senza usare credenziali
  // o effettuare accessi browser. La bozza di prova resta nella transazione annullata.
  await db.query('begin')
  const u=(await db.query("select utente from caprera.misteri where societa='prosecco' order by dal limit 1")).rows[0]
  assert.ok(u,'Manca la tessera di Prosecco.')
  await db.query('select set_config($1,$2,true)',['request.jwt.claim.sub',u.utente])
  await db.query('set local role authenticated')
  const d=(await db.query('select public.la_mia_consegna() d')).rows[0].d
  assert.equal(d.stagione,'2026-27')
  assert.equal(d.rosa.length,31)
  assert.equal(d.turno,null)
  const titolari=['P','D','C','A'].flatMap((r,i)=>d.rosa.filter(g=>g.ruolo===r).slice(0,[1,3,4,3][i]).map(g=>g.id))
  const panchina=d.rosa.filter(g=>!titolari.includes(g.id)).slice(0,15).map(g=>g.id)
  const b=(await db.query('select public.salva_la_mia_bozza($1,$2,$3,$4,$5) d',
    [d.stagione,'3-4-3',titolari,panchina,d.bozza?.revisione??0])).rows[0].d
  assert.equal(b.titolari.length,11)
  assert.deepEqual((await db.query('select public.la_mia_consegna() d')).rows[0].d.bozza.titolari,titolari)
  await db.query('rollback')
  console.log('Verifica reale: 31 giocatori Prosecco leggibili e bozza salvabile con permessi del mister; bozza di prova annullata.')
} catch(e) {
  await db.query('rollback').catch(()=>{})
  console.error(e.message)
  process.exitCode=1
} finally { await db.end() }
