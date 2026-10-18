import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import pg from 'pg'
const source=JSON.parse(await fs.readFile(new URL('../../caprera-dati/FONTI/2026-27/lega-fantapazz-normalizzata.json',import.meta.url)))
const schema=await fs.readFile(new URL('../supabase/migrations/20261018220000_caprera_calendari_fantapazz.sql',import.meta.url),'utf8')
const lit=v=>v==null?'null':typeof v==='number'||typeof v==='boolean'?String(v):`'${v.replaceAll("'","''")}'`
const season=lit(source.stagione)
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
try{
 await db.connect(); await db.query('begin'); await db.query("set local lock_timeout='5s'")
 await db.query('lock table caprera.partite,caprera.edizioni,caprera.turni,caprera.formazioni,caprera.formazione_giocatori,caprera.formazione_bonus,caprera.formazione_modificatori in share row exclusive mode')
 const lim={};for(const t of ['partite','edizioni','turni','formazioni','formazione_giocatori'])lim[t]=(await db.query(`select coalesce(max(id),0) n from caprera.${t}`)).rows[0].n
 const snapshot=async()=>{const out={};for(const t of ['partite','edizioni','turni','formazioni','formazione_giocatori','formazione_bonus','formazione_modificatori','rose','listone','contratti','finanze']){
 const where=lim[t]!=null?`id<=${lim[t]}`:t==='formazione_bonus'?`giocatore<=${lim.formazione_giocatori}`:t==='formazione_modificatori'?`formazione<=${lim.formazioni}`:'true'
 out[t]=(await db.query(`select count(*)::int n,md5(string_agg(to_jsonb(t)::text,'' order by to_jsonb(t)::text)) hash from caprera.${t} t where ${where}`)).rows[0] }return out}
 const prima=await snapshot();await db.query(schema)
 let sql=`-- Fantapazz lega 342460, fotografia ${source.acquisito_al}, SHA256 ${source.sha256}.\n-- Append only; G5 senza voti provvisori nei risultati ufficiali.\n`
 const run=async q=>{await db.query(q);sql+=q+';\n'}
 const pMap=new Map();let nuovePartite=0
 for(const c of source.calendari){
  const comp=lit(c.id), camp=c.id==='campionato'
  const edSQL=`(select id from caprera.edizioni where stagione=${season} and competizione=${comp})`
  if(!camp)await run(`insert into caprera.edizioni(stagione,competizione) values(${season},${comp}) on conflict(stagione,competizione) do nothing`)
  for(const t of c.turni){
   const ordine=c.girone?(t.ordine-1)*2+(c.girone==='A'?1:2):t.ordine
   const titolo=t.nome+(c.girone?` · Girone ${c.girone}`:'')
   const tSQL=`(select id from caprera.turni where edizione=${edSQL} and ordine=${ordine})`
   if(!camp)await run(`insert into caprera.turni(edizione,ordine,nome) values(${edSQL},${ordine},${lit(titolo)})`)
   for(const p of t.partite){
    if(p.tipo!=='partita')continue
    const where=`stagione=${season} and competizione=${comp} and ${camp?`giornata=${t.ordine}`:`turno=${tSQL}`} and casa=${lit(p.casa)} and fuori=${lit(p.fuori)}`
    const pSQL=`(select id from caprera.partite where ${where})`
    const old=(await db.query(`select * from caprera.partite where ${where}`)).rows
    if(camp){assert.equal(old.length,1);for(const k of ['gol_casa','gol_fuori','fp_casa','fp_fuori'])assert.equal(old[0][k]==null?null:Number(old[0][k]),p[k],`${k}: ${t.nome} ${p.casa}`);assert.equal(old[0].giocata,p.giocata)}
    else{assert.equal(old.length,0);await run(`insert into caprera.partite(stagione,competizione,turno,casa,fuori,gol_casa,gol_fuori,fp_casa,fp_fuori,giocata) values(${season},${comp},${tSQL},${[p.casa,p.fuori,p.gol_casa,p.gol_fuori,p.fp_casa,p.fp_fuori,p.giocata].map(lit).join(',')})`);nuovePartite++}
    p.partita=(await db.query(`select id from caprera.partite where ${where}`)).rows[0].id
    pMap.set(`${t.fonte}|${p.casa}|${p.fuori}`,{...p,pSQL})
   }
  }
 }
 assert.equal(nuovePartite,132)
 const calciatori=(await db.query('select id,nome,ruolo from caprera.calciatori')).rows
 const bonus=new Map((await db.query('select id,valore from caprera.bonus_tipi')).rows.map(b=>[b.id,Number(b.valore)]))
 let nf=0,ng=0,verificati=0
 for(const f of source.formazioni){
  const p=pMap.get(`${f.fonte}|${f.casa}|${f.fuori}`);assert.ok(p)
  const fine=f.stato==='concluso'
  if(fine){const attivi=f.giocatori.filter(g=>(g.titolare||g.entrato)&&g.voto!=null);assert.ok(attivi.length>0&&attivi.length<=11)
   const total=attivi.reduce((s,g)=>s+g.voto+g.bonus.reduce((s,b)=>{assert.ok(bonus.has(b));return s+bonus.get(b)},0),0)+f.modificatori.reduce((s,m)=>s+(m.valore??0),0)
   assert.equal(total,p[f.societa===p.casa?'fp_casa':'fp_fuori'],`Punteggio ${f.competizione} ${f.giornata} ${f.societa}`);verificati++
  }else{assert.equal(p.giocata,false);assert.ok(f.giocatori.every(g=>g.voto===null&&!g.entrato&&!g.bonus.length));assert.equal(f.modificatori.length,0)}
  if(f.competizione==='campionato'&&fine)continue // già confrontate integralmente con la fonte precedente dal normalizzatore
  assert.equal((await db.query(`select id from caprera.formazioni where partita=${p.pSQL} and societa=${lit(f.societa)}`)).rowCount,0)
  await run(`insert into caprera.formazioni(partita,societa,modulo,inviata) values(${p.pSQL},${[f.societa,f.modulo,f.inviata].map(lit).join(',')})`);nf++
  const fSQL=`(select id from caprera.formazioni where partita=${p.pSQL} and societa=${lit(f.societa)})`
  for(const g of f.giocatori){const noto=calciatori.find(c=>c.id===g.fantapazz_id&&c.nome.toLowerCase()===g.nome.toLowerCase()&&c.ruolo===g.ruolo)
   await run(`insert into caprera.formazione_giocatori(formazione,titolare,ordine,calciatore,nome,ruolo,sfida,voto,fascia,entrato) values(${fSQL},${[g.titolare,g.ordine,noto?.id??null,g.nome,g.ruolo,g.sfida,g.voto,g.fascia,g.entrato].map(lit).join(',')})`);ng++
   const gSQL=`(select id from caprera.formazione_giocatori where formazione=${fSQL} and titolare=${lit(g.titolare)} and ordine=${g.ordine})`
   for(const b of new Set(g.bonus))await run(`insert into caprera.formazione_bonus(giocatore,bonus,quante) values(${gSQL},${lit(b)},${g.bonus.filter(x=>x===b).length})`)
  }
  for(const m of f.modificatori)await run(`insert into caprera.formazione_modificatori(formazione,nome,valore) values(${fSQL},${lit(m.nome)},${lit(m.valore)})`)
 }
 assert.equal(nf,34);assert.equal(ng,852);assert.equal(verificati,54)
 // Keep replay independent of sequence values: resolve canonical ids by natural keys.
 const calendars=structuredClone(source.calendari)
 for(const c of calendars)for(const t of c.turni)for(const p of t.partite)delete p.partita
 await run(`insert into caprera.calendari_fantapazz(stagione,acquisito_al,fonte_sha256,calendari,classifiche) values(${season},${lit(source.acquisito_al)},${lit(source.sha256)},${lit(JSON.stringify(calendars))}::jsonb,${lit(JSON.stringify(source.classifiche))}::jsonb)`)
 assert.deepEqual(await snapshot(),prima,'Archivio preesistente modificato')
 await db.query('set local role anon');assert.equal((await db.query(`select count(*)::int n from public.calendari_fantapazz where stagione=${season}`)).rows[0].n,1);await db.query('reset role')
 assert.equal((await db.query("select has_table_privilege('anon','caprera.calendari_fantapazz','insert') ok")).rows[0].ok,false)
 for(const [v,n,s]of [['20261018220000','caprera_calendari_fantapazz',schema],['20261018221000','caprera_lega_fantapazz_dati',sql]])await db.query('insert into supabase_migrations.schema_migrations(version,name,statements) values($1,$2,$3)',[v,n,[s]])
 if(process.argv.includes('--applica')){await fs.writeFile(new URL('../../caprera-dati/SUPABASE/migrazioni-dati/20261018221000_caprera_lega_fantapazz_dati.sql',import.meta.url),sql);await db.query('commit')}else await db.query('rollback')
 console.log(JSON.stringify({stato:process.argv.includes('--applica')?'applicato':'verificato_rollback',nuovePartite,formazioni:nf,giocatori:ng,punteggiVerificati:verificati,preesistenti:'identici'}))
}catch(e){await db.query('rollback').catch(()=>{});console.error(e.stack);process.exitCode=1}finally{await db.end()}
