import assert from 'node:assert/strict'
import { isDeepStrictEqual as equal } from 'node:util'
import { matchKey, playerKey, result, planSync } from './piano-sync-fantapazz.mjs'

const numeric = v => v == null ? null : Number(v)
const pick = (o, keys) => Object.fromEntries(keys.map(k => [k, o[k]]))
const fields = ['titolare','ordine','nome','ruolo','sfida','voto','fascia','entrato']
const sorted = rows => rows.toSorted((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))

async function readState(db, season) {
  const matches = (await db.query(`select p.*,coalesce(p.giornata,t.ordine) ordine,t.nome nome_turno
    from caprera.partite p left join caprera.turni t on t.id=p.turno where p.stagione=$1`,[season])).rows
  const forms = (await db.query(`select f.* from caprera.formazioni f join caprera.partite p on p.id=f.partita where p.stagione=$1`,[season])).rows
  const players = (await db.query(`select g.* from caprera.formazione_giocatori g join caprera.formazioni f on f.id=g.formazione
    join caprera.partite p on p.id=f.partita where p.stagione=$1`,[season])).rows
  const bonuses = (await db.query(`select b.* from caprera.formazione_bonus b join caprera.formazione_giocatori g on g.id=b.giocatore
    join caprera.formazioni f on f.id=g.formazione join caprera.partite p on p.id=f.partita where p.stagione=$1`,[season])).rows
  const mods = (await db.query(`select m.* from caprera.formazione_modificatori m join caprera.formazioni f on f.id=m.formazione
    join caprera.partite p on p.id=f.partita where p.stagione=$1`,[season])).rows
  return {matches,forms,players,bonuses,mods}
}

function verifyState(state, index) {
  assert.equal(state.matches.length,index.matches.size,'Numero incontri DB diverso dalla fonte attesa')
  const matches = new Map(state.matches.map(p=>[matchKey(p),p]))
  assert.equal(matches.size,state.matches.length,'Incontri DB duplicati')
  for (const [key,p] of index.matches) {
    const row=matches.get(key); assert.ok(row,`Incontro DB mancante: ${key}`)
    assert.deepEqual({...result(row),fp_casa:numeric(row.fp_casa),fp_fuori:numeric(row.fp_fuori)},result(p),`Risultato DB divergente: ${key}`)
    if (p.competizione!=='campionato') assert.equal(row.nome_turno,p.nome_turno,'Nome turno DB divergente')
  }
  assert.equal(state.forms.length,index.formations.size,'Formazioni DB diverse dalla fonte attesa')
  const forms = new Map()
  for (const [key,f] of index.formations) {
    const p=index.bySource.get(`${f.fonte}|${f.casa}|${f.fuori}`),id=matches.get(matchKey(p)).id
    const row=state.forms.find(x=>x.partita===id&&x.societa===f.societa)
    assert.ok(row,`Formazione DB mancante: ${key}`); forms.set(key,row)
    for (const k of ['modulo','inviata']) assert.equal(row[k],f[k],`Formazione DB divergente: ${key} ${k}`)
    const gs=state.players.filter(g=>g.formazione===row.id)
    assert.equal(gs.length,f.giocatori.length,`Giocatori DB divergenti: ${key}`)
    for (const g of f.giocatori) {
      const stored=gs.find(x=>playerKey(x)===playerKey(g)); assert.ok(stored,'Posizione giocatore DB assente')
      assert.deepEqual({...pick(stored,fields),voto:numeric(stored.voto)},pick(g,fields),`Giocatore DB divergente: ${key} ${playerKey(g)}`)
      // The historical archive intentionally leaves unknown/ambiguous ids unlinked.
      if (stored.calciatore!==null) assert.equal(stored.calciatore,g.fantapazz_id,'Identità giocatore DB divergente')
      const bs=state.bonuses.filter(b=>b.giocatore===stored.id).flatMap(b=>Array(b.quante).fill(b.bonus))
      assert.deepEqual(bs.sort(),g.bonus.toSorted(),'Bonus DB divergenti')
    }
    const ms=state.mods.filter(m=>m.formazione===row.id).map(m=>({nome:m.nome,valore:numeric(m.valore)}))
    assert.deepEqual(sorted(ms),sorted(f.modificatori),'Modificatori DB divergenti')
  }
  return {matches,forms}
}

export async function protectedFingerprint(db, season) {
  const out={}
  // Include sports history and all economic data; never print or export their contents.
  const scopes={rose:'true',listone:'true',contratti:'true',finanze:'true',
    partite:'t.stagione<>$1',
    formazioni:'exists(select 1 from caprera.partite p where p.id=t.partita and p.stagione<>$1)',
    formazione_giocatori:'exists(select 1 from caprera.formazioni f join caprera.partite p on p.id=f.partita where f.id=t.formazione and p.stagione<>$1)',
    formazione_modificatori:'exists(select 1 from caprera.formazioni f join caprera.partite p on p.id=f.partita where f.id=t.formazione and p.stagione<>$1)',
    formazione_bonus:'exists(select 1 from caprera.formazione_giocatori g join caprera.formazioni f on f.id=g.formazione join caprera.partite p on p.id=f.partita where g.id=t.giocatore and p.stagione<>$1)'}
  for (const [table,where] of Object.entries(scopes)) out[table]=(await db.query(`select count(*)::int n,
    md5(string_agg(to_jsonb(t)::text,'' order by to_jsonb(t)::text)) hash from caprera.${table} t where ${where}`,where==='true'?[]:[season])).rows[0]
  return out
}

// Caller owns BEGIN / COMMIT / ROLLBACK. Never opens a connection or commits here.
export async function synchronize(db, before, after, {acceptCorrections=false}={}) {
  await db.query("set local lock_timeout='5s'")
  await db.query("set local statement_timeout='60s'")
  await db.query('lock table caprera.partite,caprera.edizioni,caprera.turni,caprera.formazioni,caprera.formazione_giocatori,caprera.formazione_bonus,caprera.formazione_modificatori,caprera.calendari_fantapazz,caprera.bonus_tipi,caprera.calciatori in share row exclusive mode')
  const bonuses=new Map((await db.query('select id,valore from caprera.bonus_tipi')).rows.map(b=>[b.id,numeric(b.valore)]))
  const plan=planSync(before,after,bonuses)
  const snapshot=(await db.query('select acquisito_al::text,fonte_sha256,calendari,classifiche from caprera.calendari_fantapazz where stagione=$1 for update',[before.stagione])).rows[0]
  assert.ok(snapshot,'Fotografia DB non inizializzata')
  const current=await readState(db,before.stagione)
  if (snapshot.fonte_sha256===after.sha256) {
    assert.deepEqual(snapshot.calendari,after.calendari,'Hash già applicato con calendari diversi')
    assert.deepEqual(snapshot.classifiche,after.classifiche,'Hash già applicato con classifiche diverse')
    verifyState(current,plan.next)
    return {stato:'gia_allineato',partite:plan.next.matches.size,formazioni:plan.next.formations.size,modifiche:0}
  }
  assert.equal(snapshot.fonte_sha256,before.sha256,'Fonte DB cambiata: acquisire la nuova base prima di procedere')
  assert.deepEqual(snapshot.calendari,before.calendari,'Calendari DB modificati dopo acquisizione')
  assert.deepEqual(snapshot.classifiche,before.classifiche,'Classifiche DB modificate dopo acquisizione')
  const ids=verifyState(current,plan.old)
  assert.ok(!plan.corrections.length||acceptCorrections,'Rettifiche a risultati pubblicati: richiesto --accetta-rettifiche dopo revisione')
  assert.notEqual(before.sha256,after.sha256,'Fonte modificata con impronta invariata')
  const protectedBefore=await protectedFingerprint(db,before.stagione)
  const known=new Map((await db.query('select id,nome,ruolo from caprera.calciatori')).rows.map(c=>[c.id,c]))
  for (const [key,p] of plan.changedMatches) {
    const old=plan.old.matches.get(key)
    assert.equal(p.nome_turno,old.nome_turno,'Rinomina turno richiede riconciliazione esplicita')
    await db.query('update caprera.partite set gol_casa=$2,gol_fuori=$3,fp_casa=$4,fp_fuori=$5,giocata=$6 where id=$1',
      [ids.matches.get(key).id,p.gol_casa,p.gol_fuori,p.fp_casa,p.fp_fuori,p.giocata])
  }
  for (const [key,f] of plan.changedFormations) {
    const p=plan.next.bySource.get(`${f.fonte}|${f.casa}|${f.fuori}`)
    let id=ids.forms.get(key)?.id
    if (id) await db.query('update caprera.formazioni set modulo=$2,inviata=$3 where id=$1',[id,f.modulo,f.inviata])
    else id=(await db.query('insert into caprera.formazioni(partita,societa,modulo,inviata) values($1,$2,$3,$4) returning id',[ids.matches.get(matchKey(p)).id,f.societa,f.modulo,f.inviata])).rows[0].id
    const retained=[]
    for (const g of f.giocatori) {
      const c=known.get(g.fantapazz_id),linked=c?.nome.toLowerCase()===g.nome.toLowerCase()&&c?.ruolo===g.ruolo?c.id:null
      const existing=current.players.find(x=>x.formazione===id&&playerKey(x)===playerKey(g))
      // Keep an already verified identity when source name/role still match the same player.
      const keep=existing?.calciatore===g.fantapazz_id&&existing.nome===g.nome&&existing.ruolo===g.ruolo
      const gid=(await db.query(`insert into caprera.formazione_giocatori(formazione,titolare,ordine,calciatore,nome,ruolo,sfida,voto,fascia,entrato)
        values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict(formazione,titolare,ordine) do update set
        calciatore=excluded.calciatore,nome=excluded.nome,ruolo=excluded.ruolo,sfida=excluded.sfida,voto=excluded.voto,fascia=excluded.fascia,entrato=excluded.entrato returning id`,
      [id,g.titolare,g.ordine,keep?existing.calciatore:linked,g.nome,g.ruolo,g.sfida,g.voto,g.fascia,g.entrato])).rows[0].id
      retained.push(gid)
      await db.query('delete from caprera.formazione_bonus where giocatore=$1',[gid])
      for (const b of new Set(g.bonus)) await db.query('insert into caprera.formazione_bonus(giocatore,bonus,quante) values($1,$2,$3)',[gid,b,g.bonus.filter(x=>x===b).length])
    }
    await db.query('delete from caprera.formazione_giocatori where formazione=$1 and not(id=any($2::bigint[]))',[id,retained])
    await db.query('delete from caprera.formazione_modificatori where formazione=$1',[id])
    for (const m of f.modificatori) await db.query('insert into caprera.formazione_modificatori(formazione,nome,valore) values($1,$2,$3)',[id,m.nome,m.valore])
  }
  await db.query(`update caprera.calendari_fantapazz set acquisito_al=$2,fonte_sha256=$3,calendari=$4::jsonb,classifiche=$5::jsonb where stagione=$1`,
    [after.stagione,after.acquisito_al,after.sha256,JSON.stringify(after.calendari),JSON.stringify(after.classifiche)])
  const resulting=await readState(db,after.stagione)
  verifyState(resulting,plan.next)
  assert.deepEqual(await protectedFingerprint(db,after.stagione),protectedBefore,'Archivio protetto modificato')
  // Unchanged formations retain every original column, including internal ids and annotations.
  const changedIds=new Set(plan.changedFormations.map(([key])=>ids.forms.get(key)?.id).filter(Boolean))
  for (const f of current.forms) {
    const now=resulting.forms.find(x=>x.id===f.id); assert.ok(now)
    assert.equal(now.mister,f.mister); assert.equal(now.avviso,f.avviso)
    if (!changedIds.has(f.id)) assert.ok(equal(now,f),'Formazione fuori ambito modificata')
  }
  const report={stato:'verificato',partite:plan.next.matches.size,formazioni:plan.next.formations.size,
    incontri_modificati:plan.changedMatches.length,formazioni_modificate:plan.changedFormations.length,
    rettifiche:plan.corrections,archivio_protetto:'identico'}
  await db.query(`insert into caprera.sync_fantapazz_audit(stagione,fonte_sha256,precedente_sha256,acquisito_al,prima,dopo,rapporto)
    values($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb)`,
    [after.stagione,after.sha256,before.sha256,after.acquisito_al,JSON.stringify({fonte:before,db:current}),JSON.stringify({fonte:after,db:resulting}),JSON.stringify(report)])
  return report
}
