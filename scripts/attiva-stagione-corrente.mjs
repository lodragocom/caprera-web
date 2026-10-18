import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const sql=await fs.readFile(new URL('../supabase/migrations/20261018110000_caprera_stagione_corrente_shiny.sql',import.meta.url),'utf8')
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
async function impronta() {
  return (await db.query(`select 'partite' t,count(*)::int n,md5(string_agg(md5(to_jsonb(p)::text),'' order by id)) h
    from caprera.partite p where stagione<>'2026-27'
    union all select 'classifiche',count(*)::int,md5(string_agg(md5(to_jsonb(c)::text),'' order by stagione,societa))
    from caprera.classifiche c where stagione<>'2026-27' order by t`)).rows
}
try {
  await db.connect(); await db.query('begin')
  await db.query("set local lock_timeout='5s'")
  const prima=await impronta()
  assert.equal((await db.query("select conclusa from caprera.stagioni where id='2026-27'")).rows[0].conclusa,false)
  assert.equal((await db.query("select count(*)::int n from caprera.partite where stagione='2026-27' and giornata<=4")).rows[0].n,0)
  assert.equal((await db.query("select count(*)::int n from caprera.classifiche where stagione='2026-27'")).rows[0].n,0)
  await db.query(sql)
  const difetti=await db.query(`with gare as (
    select casa societa,gol_casa gf,gol_fuori gs from caprera.partite where stagione='2026-27' and giocata
    union all select fuori,gol_fuori,gol_casa from caprera.partite where stagione='2026-27' and giocata
  ), somme as (select societa,count(*) g,sum(gf) gf,sum(gs) gs,
    count(*) filter(where gf>gs) v,count(*) filter(where gf=gs) n,count(*) filter(where gf<gs) p,
    sum(case when gf>gs then 3 when gf=gs then 1 else 0 end) punti from gare group by societa)
  select c.societa from caprera.classifiche c left join somme s using(societa)
  where c.stagione='2026-27' and (s.societa is null or
    (c.giocate,c.gol_fatti,c.gol_subiti,c.vinte,c.pari,c.perse,c.punti) is distinct from (s.g,s.gf,s.gs,s.v,s.n,s.p,s.punti))`)
  assert.equal(difetti.rowCount,0,'Classifica e risultati devono coincidere su punti, gol e bilanci.')
  assert.deepEqual(await impronta(),prima)
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements)
    values('20261018110000','caprera_stagione_corrente_shiny',$1)`,[[sql]])
  if(process.argv.includes('--applica')) {
    await db.query('commit')
    console.log('2026-27: 20 risultati e 10 righe di classifica dalla Shiny; punti/gol/bilanci verificati. Storico identico.')
  } else { await db.query('rollback'); console.log('Verifica superata; transazione annullata.') }
} catch(e) { await db.query('rollback').catch(()=>{}); console.error(e.message);process.exitCode=1 }
finally { await db.end() }
