import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import pg from 'pg'
const source=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/performance-shiny.json',import.meta.url),'utf8'))
const ids={ARR:'armata-rossa',AVL:'aston-ville',DSP:'disperata',PRS:'prosecco',RMO:'real-monghi',ROB:'roburro',SAM:'sanguemisto',SMT:'smit',MGP:'sporting-mangiapreti',SUB:'subbuteo',NA:null}
const metriche=['voto','fpstat','voto_round','fm','fm_round']
const medieCol=['valore_fp',...['mean','min','max'].flatMap(op=>metriche.map(k=>`${k}_${op}`))]
const numerico=s=>s===''?null:Number(s)
const giornate=source.righe.map(r=>{assert.equal(r.length,11);assert.ok(r[2] in ids);assert.match(r[4],/^\d+a$/);return [source.stagione,r[0],r[1],ids[r[2]],r[3]||null,parseInt(r[4]),...r.slice(5).map(numerico),source.aggiornato_al]})
const medie=source.medie.map(r=>{assert.equal(r.length,20);assert.ok(r[2] in ids);return[source.stagione,r[0],r[1],ids[r[2]],r[3]||null,...r.slice(4).map(numerico),source.aggiornato_al]})
assert.equal(giornate.length,3255);assert.equal(medie.length,465)
assert.equal(new Set(giornate.map(r=>`${r[1]}|${r[2]}|${r[5]}`)).size,3255)
for(const r of giornate)assert.ok(r.slice(5,-1).every(v=>v===null||Number.isFinite(v)))
let schema=`-- Rendimenti sportivi pubblicati in Lega > Giocatori > Performance nella Shiny.\ncreate table caprera.performance_giocatori (\n stagione text not null references caprera.stagioni, nome text not null, ruolo char(1) not null check(ruolo in ('P','D','C','A')), societa text references caprera.societa, club text, giornata_serie_a int not null check(giornata_serie_a between 1 and 38),\n ${[...metriche,'valore_fp'].map(k=>`${k} numeric`).join(', ')}, aggiornato_al date not null, primary key(stagione,nome,ruolo,giornata_serie_a));\ncreate table caprera.performance_medie (\n stagione text not null references caprera.stagioni, nome text not null, ruolo char(1) not null check(ruolo in ('P','D','C','A')), societa text references caprera.societa, club text,\n ${medieCol.map(k=>`${k} numeric`).join(', ')}, aggiornato_al date not null, primary key(stagione,nome,ruolo));\n`
for(const table of ['performance_giocatori','performance_medie'])schema+=`alter table caprera.${table} enable row level security;\nrevoke all on caprera.${table} from anon,authenticated;\ngrant select on caprera.${table} to anon,authenticated;\ncreate policy lettura_sportiva on caprera.${table} for select to anon,authenticated using (true);\ncreate view public.${table} with (security_invoker=true) as select * from caprera.${table};\ngrant select on public.${table} to anon,authenticated;\ncomment on table caprera.${table} is 'Fonte: https://caprera.shinyapps.io/caprera/ > Lega > Giocatori > Performance. Snapshot, non dati delle formazioni consegnate.';\n`
const lit=v=>v==null?'null':typeof v==='number'?String(v):`'${v.replaceAll("'","''")}'`
const sql=`-- Snapshot Shiny ${source.aggiornato_al}. I null delle medie della fonte sono preservati.\ninsert into caprera.performance_giocatori values\n${giornate.map(r=>`(${r.map(lit).join(',')})`).join(',\n')};\ninsert into caprera.performance_medie values\n${medie.map(r=>`(${r.map(lit).join(',')})`).join(',\n')};\n`
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try{await db.connect();await db.query('begin');await db.query("set local lock_timeout='5s'")
 const snap=async()=>{const out={};for(const t of ['partite','formazioni','formazione_giocatori','rose','listone'])out[t]=(await db.query(`select count(*)::int n,md5(string_agg(to_jsonb(t)::text,'' order by to_jsonb(t)::text)) hash from caprera.${t} t`)).rows[0];return out}
 const prima=await snap();await db.query(schema);await db.query(sql);assert.deepEqual(await snap(),prima)
 for(const [table,n]of [['performance_giocatori',3255],['performance_medie',465]]){assert.equal((await db.query(`select count(*)::int n from caprera.${table}`)).rows[0].n,n);assert.equal((await db.query(`select has_table_privilege('anon','caprera.${table}','insert') ok`)).rows[0].ok,false)}
 for(const [v,n,s]of [['20261018180000','caprera_performance_giocatori',schema],['20261018181000','caprera_performance_shiny_2026_27',sql]])await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[v,n,[s]])
 await db.query('set local role anon');assert.equal((await db.query('select count(*)::int n from public.performance_giocatori')).rows[0].n,3255);await db.query('reset role')
 if(process.argv.includes('--applica')){await fs.writeFile(new URL('../supabase/migrations/20261018180000_caprera_performance_giocatori.sql',import.meta.url),schema);await fs.writeFile(new URL('../../caprera-dati/SUPABASE/migrazioni-dati/20261018181000_caprera_performance_shiny_2026_27.sql',import.meta.url),sql);await db.query('commit')}else await db.query('rollback')
 console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',righe:3255,riepiloghi:465,giornateSerieA:'1-7',datiPreesistenti:'identici',scritturaAnonima:false}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.message);process.exitCode=1}finally{await db.end()}
