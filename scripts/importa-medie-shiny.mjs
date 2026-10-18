import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import pg from 'pg'
const base=new URL('../../caprera-dati/FONTI/2026-27/',import.meta.url)
const medie=JSON.parse(await fs.readFile(new URL('medie-rose-shiny.json',base),'utf8'))
const quote=JSON.parse(await fs.readFile(new URL('quotazioni-rose-shiny.json',base),'utf8'))
const righe=quote.rose.flatMap(s=>{assert.equal(medie.rose[s.societa].length,s.righe.length);return s.righe.map(([nome],i)=>({societa:s.societa,nome,presenze:medie.rose[s.societa][i][0],mv:medie.rose[s.societa][i][1],fm:medie.rose[s.societa][i][2]}))})
assert.equal(righe.length,310)
const lit=v=>v==null?'null':typeof v==='number'?String(v):`'${v.replaceAll("'","''")}'`
const sql='-- Medie attuali pubblicate dalla Shiny il 18/10/2026: Presenze, MV FP, FM FP.\n'+righe.map(r=>`update caprera.rose set presenze=${lit(r.presenze)},mv=${lit(r.mv)},fm=${lit(r.fm)} where stagione='2026-27' and momento='corrente' and societa=${lit(r.societa)} and nome=${lit(r.nome)};`).join('\n')+'\n'
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try{await db.connect();await db.query('begin');await db.query("set local lock_timeout='5s'")
 const prima=(await db.query('select * from caprera.rose order by id for update')).rows
 const correnti=prima.filter(r=>r.stagione==='2026-27'&&r.momento==='corrente');assert.equal(correnti.length,310)
 for(const r of righe){const p=correnti.filter(p=>p.nome===r.nome&&p.societa===r.societa);assert.equal(p.length,1);assert.equal(p[0].fm,null,'Medie già caricate: confrontare prima di sostituire')}
 const risultato=await db.query(sql);assert.equal(risultato.length,310);assert.ok(risultato.every(r=>r.rowCount===1))
 const dopo=(await db.query('select * from caprera.rose order by id')).rows
 const senzaMedie=rs=>rs.map(({presenze:_presenze,mv:_mv,fm:_fm,...r})=>r)
 assert.deepEqual(senzaMedie(dopo),senzaMedie(prima),'Identità, costi e fonte delle rose invariati')
 assert.deepEqual(dopo.filter(r=>r.stagione!=='2026-27'),prima.filter(r=>r.stagione!=='2026-27'))
 for(const r of righe){const p=dopo.find(p=>p.stagione==='2026-27'&&p.momento==='corrente'&&p.nome===r.nome&&p.societa===r.societa);assert.deepEqual([p.presenze,p.mv==null?null:Number(p.mv),p.fm==null?null:Number(p.fm)],[r.presenze,r.mv,r.fm])}
 await db.query("insert into supabase_migrations.schema_migrations(version,name,statements) values('20261018143000','caprera_medie_shiny_2026_27',$1)",[[sql]])
 if(process.argv.includes('--applica')){await fs.writeFile(new URL('../supabase/migrations/20261018143000_caprera_medie_shiny_2026_27.sql',import.meta.url),sql);await db.query('commit')}else await db.query('rollback')
 console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',rose:310,conMedie:righe.filter(r=>r.fm!=null).length,costi:'identici',storico:'identico'}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1}finally{await db.end()}
