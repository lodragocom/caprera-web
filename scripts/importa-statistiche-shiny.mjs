import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import pg from 'pg'
import assert from 'node:assert/strict'
const fonte=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/statistiche-giornata-shiny.json',import.meta.url),'utf8'))
const schema=await fs.readFile(new URL('../supabase/migrations/20261018140000_caprera_statistiche_giornata.sql',import.meta.url),'utf8')
const ids={ARR:'armata-rossa',AVL:'aston-ville',DSP:'disperata',PRS:'prosecco',RMO:'real-monghi',ROB:'roburro',SAM:'sanguemisto',SMT:'smit',MGP:'sporting-mangiapreti',SUB:'subbuteo'}
const lit=v=>typeof v==='number'?String(v):`'${String(v).replaceAll("'","''")}'`
let sql='-- Dati pubblicati dalla Shiny nelle giornate 2-4, aggiornamento 18/10/2026.\n'
for(const g of fonte.giornate){assert.equal(g.righe.length,10);for(const [code,...valori]of g.righe){assert.ok(ids[code]);assert.ok(valori.every(Number.isFinite));sql+=`insert into caprera.statistiche_giornata(stagione,societa,giornata,fantapunti,valore_rosa,fair_play,panchina_oro,zdenek,fonte,aggiornato_al) values(${['2026-27',ids[code],g.giornata,...valori,fonte.fonte,fonte.aggiornato_al].map(lit).join(',')});\n`}}
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try{await db.connect();await db.query('begin');await db.query("set local lock_timeout='5s'")
 const prima=(await db.query("select count(*)::int n,md5(string_agg(md5(to_jsonb(p)::text),'' order by id)) hash from caprera.partite p")).rows
 await db.query(schema);await db.query(sql)
 assert.equal((await db.query('select count(*)::int n from caprera.statistiche_giornata')).rows[0].n,30)
 assert.deepEqual((await db.query("select count(*)::int n,md5(string_agg(md5(to_jsonb(p)::text),'' order by id)) hash from caprera.partite p")).rows,prima)
 assert.equal((await db.query("select has_table_privilege('anon','caprera.statistiche_giornata','insert') a")).rows[0].a,false)
 for(const [version,name,statements]of [['20261018140000','caprera_statistiche_giornata',schema],['20261018141000','caprera_statistiche_shiny_2026_27',sql]])await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[version,name,[statements]])
 if(process.argv.includes('--applica')){await fs.writeFile(new URL('../supabase/migrations/20261018141000_caprera_statistiche_shiny_2026_27.sql',import.meta.url),sql);await db.query('commit')}else await db.query('rollback')
 console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',righe:30,partite:'identiche',scritturaAnonima:false}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1}finally{await db.end()}
