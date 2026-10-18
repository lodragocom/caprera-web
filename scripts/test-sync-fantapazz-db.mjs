// Opt-in integration check against an already imported private snapshot.
// Every scenario is rolled back; there is deliberately no --applica switch.
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import assert from 'node:assert/strict'
import { parseArgs } from 'node:util'
import pg from 'pg'
import { synchronize, protectedFingerprint } from './lib/import-sync-fantapazz.mjs'

const {values}=parseArgs({options:{fonte:{type:'string'}}})
assert.ok(values.fonte,'Richiesta --fonte con fotografia completa già importata')
const source=JSON.parse(await fs.readFile(values.fonte))
const db=new pg.Client({connectionString:(await fs.readFile(path.join(os.homedir(),'.caprera-dsn'),'utf8')).trim(),connectionTimeoutMillis:10000})
const passed=[]
try {
  await db.connect();await db.query('begin')
  const protectedBefore=await protectedFingerprint(db,source.stagione)
  if (!(await db.query("select to_regclass('caprera.sync_fantapazz_audit') t")).rows[0].t)
    await db.query(await fs.readFile(new URL('../supabase/migrations/20261018230000_caprera_sync_fantapazz_audit.sql',import.meta.url),'utf8'))
  for (const role of ['anon','authenticated']) assert.equal((await db.query("select has_table_privilege($1,'caprera.sync_fantapazz_audit','select') ok",[role])).rows[0].ok,false)
  passed.push('audit_riservato')
  assert.equal((await synchronize(db,source,source)).stato,'gia_allineato');passed.push('base_completa')
  const candidate=structuredClone(source);candidate.sha256='1'.repeat(64)
  const form=candidate.formazioni.find(f=>f.stato==='provvisorio')
  const capt=form.giocatori.find(g=>g.fascia==='C'),other=form.giocatori.find(g=>g.titolare&&g.fascia===null)
  assert.ok(capt&&other);capt.fascia=null;other.fascia='C'
  await db.query('savepoint scenario')
  const report=await synchronize(db,source,candidate)
  assert.equal(report.formazioni_modificate,1)
  assert.equal((await synchronize(db,source,candidate)).stato,'gia_allineato');passed.push('aggiornamento_e_ripetizione')
  assert.equal((await db.query('select count(*)::int n from caprera.sync_fantapazz_audit where fonte_sha256=$1',[candidate.sha256])).rows[0].n,1);passed.push('audit_unico')
  await db.query('rollback to savepoint scenario')
  await db.query("update caprera.calendari_fantapazz set fonte_sha256=repeat('2',64) where stagione=$1",[source.stagione])
  await assert.rejects(()=>synchronize(db,source,candidate),/Fonte DB cambiata/);passed.push('concorrenza_bloccata')
  await db.query('rollback to savepoint scenario')
  await db.query("update caprera.partite set fp_casa=fp_casa+1 where id=(select id from caprera.partite where stagione=$1 and giocata limit 1)",[source.stagione])
  await assert.rejects(()=>synchronize(db,source,candidate),/Risultato DB divergente/);passed.push('modifica_esterna_bloccata')
  await db.query('rollback to savepoint scenario')
  const extra=structuredClone(source);extra.sha256='3'.repeat(64)
  const future=extra.calendari.find(c=>c.id==='campionato').turni.find(t=>!extra.formazioni.some(f=>f.fonte===t.fonte)&&t.ordine>5)
  const match=future.partite[0]
  for (const society of [match.casa,match.fuori]) {
    const f=structuredClone(source.formazioni.find(f=>f.societa===society&&f.stato==='provvisorio'))
    Object.assign(f,{fonte:future.fonte,turno:future.nome,giornata:future.ordine,serie_a:future.serie_a,casa:match.casa,fuori:match.fuori})
    extra.formazioni.push(f)
  }
  assert.equal((await synchronize(db,source,extra)).formazioni_modificate,2);passed.push('nuove_formazioni')
  await db.query('rollback to savepoint scenario')
  const corrected=structuredClone(source);corrected.sha256='4'.repeat(64)
  const final=corrected.formazioni.find(f=>f.competizione==='campionato'&&f.stato==='concluso'&&f.societa===f.casa)
  const round=corrected.calendari.find(c=>c.id==='campionato').turni.find(t=>t.fonte===final.fonte)
  const game=round.partite.find(p=>p.casa===final.casa&&p.fuori===final.fuori)
  final.giocatori.find(g=>(g.titolare||g.entrato)&&g.voto!==null).voto+=1;game.fp_casa+=1
  const ranks=corrected.classifiche.find(c=>c.id==='campionato').righe
  const home=ranks.find(r=>r.societa===final.casa),away=ranks.find(r=>r.societa===final.fuori)
  home.fantapunti+=1;home.differenza_fp+=1;away.fp_subiti+=1;away.differenza_fp-=1
  await assert.rejects(()=>synchronize(db,source,corrected),/Rettifiche a risultati pubblicati/);passed.push('rettifica_non_autorizzata_bloccata')
  const fixed=await synchronize(db,source,corrected,{acceptCorrections:true})
  assert.equal(fixed.rettifiche.length,1);assert.equal(fixed.incontri_modificati,1);passed.push('rettifica_quadrata')
  await db.query('rollback to savepoint scenario')
  // Force a late SQL error, after writes, to exercise full transaction recovery.
  await db.query(`insert into caprera.sync_fantapazz_audit(stagione,fonte_sha256,precedente_sha256,acquisito_al,prima,dopo,rapporto)
    values($1,$2,$3,$4,'{}','{}','{}')`,[source.stagione,candidate.sha256,source.sha256,source.acquisito_al])
  await assert.rejects(()=>synchronize(db,source,candidate),{code:'23505'})
  await db.query('rollback to savepoint scenario');passed.push('errore_tardivo_annullato')
  assert.equal((await synchronize(db,source,source)).stato,'gia_allineato')
  assert.deepEqual(await protectedFingerprint(db,source.stagione),protectedBefore);passed.push('dati_ripristinati')
  await db.query('rollback')
  console.log(JSON.stringify({stato:'verificato_rollback',casi:passed.length,verifiche:passed}))
} catch (e) {await db.query('rollback').catch(()=>{});console.error({stato:'fallito_rollback',errore:e.message});process.exitCode=1}
finally {await db.end()}
