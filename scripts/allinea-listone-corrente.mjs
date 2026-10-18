import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const fonte=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/listone-corrente-import.json',import.meta.url),'utf8'))
assert.equal(fonte.righe.length,616)
assert.equal(fonte.stagione,'2026-27')
assert.equal(fonte.momento,'fine')
const lit=v=>v==null?'null':typeof v==='number'?String(v):`'${String(v).replaceAll("'","''")}'`
let sql=`-- Quotazioni Shiny aggiornate al ${fonte.aggiornato_al}, 310 tesserati + 306 svincolati.\n-- 'fine' = quotazione a stagione in corso, secondo la convenzione del database.\n`
for(const r of fonte.righe) sql+=`insert into caprera.listone(stagione,momento,nome,ruolo,club,prezzo) values(${[fonte.stagione,fonte.momento,r.nome,r.ruolo,r.club,r.prezzo].map(lit).join(',')});\n`
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect(); await db.query('begin');await db.query("set local lock_timeout='5s'")
  await db.query("select pg_advisory_xact_lock(hashtext('caprera-listone-2026-27'))")
  const prima=(await db.query('select * from caprera.listone order by id for update')).rows
  assert.equal(prima.filter(r=>r.stagione==='2026-27'&&r.momento==='fine').length,0,'Quotazioni correnti già presenti: confrontarle prima di sostituire')
  await db.query(sql)
  const dopo=(await db.query('select * from caprera.listone order by id')).rows
  assert.deepEqual(dopo.filter(r=>prima.some(p=>p.id===r.id)),prima)
  const attuale=dopo.filter(r=>r.stagione==='2026-27'&&r.momento==='fine')
  const normalizza=rs=>rs.map(r=>JSON.stringify([r.nome,r.ruolo,r.club,r.prezzo])).sort()
  assert.deepEqual(normalizza(attuale),normalizza(fonte.righe))
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements) values('20261018130000','caprera_listone_corrente_2026_27',$1)`,[[sql]])
  if(process.argv.includes('--applica')){
    await fs.writeFile(new URL('../supabase/migrations/20261018130000_caprera_listone_corrente_2026_27.sql',import.meta.url),sql)
    await db.query('commit')
  }else await db.query('rollback')
  console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',quotazioni:616,listoniPreesistenti:'identici',prosecco:fonte.righe.filter(r=>['Thuram','Esposito Pio'].includes(r.nome))}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1}finally{await db.end()}
