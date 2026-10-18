/** Completa gli accoppiamenti mancanti, senza aggiornare gare già presenti. */
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const fonte=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/calendario-shiny.json',import.meta.url),'utf8'))
const codici={SMT:'smit',PRS:'prosecco',MGP:'sporting-mangiapreti',ARR:'armata-rossa',SUB:'subbuteo',RMO:'real-monghi',DSP:'disperata',SAM:'sanguemisto',AVL:'aston-ville',ROB:'roburro'}
const gare=Array.from({length:36},(_,i)=>fonte.giornate[i%18].map(p=>({giornata:i+1,casa:codici[p.split('-')[0]],fuori:codici[p.split('-')[1]]}))).flat()
assert.equal(gare.length,180)
for(let g=1;g<=36;g++) assert.equal(new Set(gare.filter(p=>p.giornata===g).flatMap(p=>[p.casa,p.fuori])).size,10)
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try {
  await db.connect(); await db.query('begin');await db.query("set local lock_timeout='5s'")
  await db.query("select pg_advisory_xact_lock(hashtext('caprera-calendario-2026-27'))")
  const prima=(await db.query('select * from caprera.partite order by id for update')).rows
  const presenti=prima.filter(p=>p.stagione==='2026-27'&&p.giornata!=null)
  assert.equal(presenti.length,25)
  const comp=presenti[0].competizione
  let sql='-- Calendario Shiny aggiornato al 18/10/2026: accoppiamenti dalla giornata 6 alla 36.\n'
  let aggiunte=0
  for(const gara of gare) {
    const p=presenti.find(p=>p.giornata===gara.giornata&&p.casa===gara.casa)
    if(p){assert.equal(p.fuori,gara.fuori);assert.equal(p.competizione,comp);continue}
    assert.ok(gara.giornata>5)
    const valori=['2026-27',comp,gara.giornata,gara.casa,gara.fuori]
    await db.query('insert into caprera.partite(stagione,competizione,giornata,casa,fuori,giocata) values($1,$2,$3,$4,$5,false)',valori)
    const lit=v=>typeof v==='number'?String(v):`'${String(v).replaceAll("'","''")}'`
    sql+=`insert into caprera.partite(stagione,competizione,giornata,casa,fuori,giocata) values(${valori.map(lit).join(',')},false);\n`;aggiunte++
  }
  const dopo=(await db.query('select * from caprera.partite order by id')).rows
  assert.deepEqual(dopo.filter(p=>prima.some(r=>r.id===p.id)),prima,'Tutte le partite già presenti devono rimanere identiche')
  assert.equal(dopo.filter(p=>p.stagione==='2026-27'&&p.giornata!=null).length,180)
  await db.query(`insert into supabase_migrations.schema_migrations(version,name,statements) values('20261018123000','caprera_calendario_completo_2026_27',$1)`,[[sql]])
  if(process.argv.includes('--applica')) {
    await fs.writeFile(new URL('../supabase/migrations/20261018123000_caprera_calendario_completo_2026_27.sql',import.meta.url),sql)
    await db.query('commit')
  } else await db.query('rollback')
  console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',aggiunte,giornate:36,partite:180,partitePreesistenti:'identiche',scadenze:'nessuna inventata'}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1}finally{await db.end()}
