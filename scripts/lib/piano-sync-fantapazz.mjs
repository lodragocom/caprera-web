import assert from 'node:assert/strict'
import { isDeepStrictEqual as equal } from 'node:util'

const finite = v => typeof v === 'number' && Number.isFinite(v)
const unique = (rows, key) => {
  const map = new Map()
  for (const row of rows) { const k = key(row); assert.ok(!map.has(k), `Chiave duplicata: ${k}`); map.set(k, row) }
  return map
}
export const calendarKey = c => `${c.id}|${c.girone ?? ''}`
export const matchKey = p => `${p.competizione}|${p.ordine}|${p.casa}|${p.fuori}`
export const formationKey = f => `${f.fonte}|${f.casa}|${f.fuori}|${f.societa}`
export const result = p => Object.fromEntries(['gol_casa','gol_fuori','fp_casa','fp_fuori','giocata'].map(k => [k,p[k]]))
export const playerKey = p => `${p.titolare}|${p.ordine}`

export function indexSource(source, bonuses) {
  assert.match(source.stagione, /^\d{4}-\d{2}$/)
  assert.match(source.sha256, /^[a-f0-9]{64}$/)
  assert.ok(Number.isFinite(Date.parse(source.acquisito_al)), 'Data fonte invalida')
  assert.ok(source.calendari.length && source.classifiche.length, 'Fonte completa richiesta')
  const calendars = unique(source.calendari, calendarKey), matches = new Map(), bySource = new Map()
  const teams = new Set()
  for (const c of calendars.values()) {
    assert.ok(c.id && (c.girone == null || ['A','B'].includes(c.girone)))
    assert.ok(c.turni.length)
    unique(c.turni, t => t.ordine)
    for (const t of c.turni) {
      assert.ok(Number.isInteger(t.ordine) && t.ordine > 0 && t.nome)
      assert.match(t.data, /^\d{4}-\d{2}-\d{2}$/)
      assert.ok(Number.isFinite(Date.parse(t.data)))
      assert.ok(Number.isInteger(t.serie_a) && t.serie_a > 0)
      assert.match(t.fonte, /^https:\/\/www\.fantapazz\.com\/fantacalcio\/formazioni-in-campo-lega\/\d+\/\d+\/342460$/)
      assert.ok(t.partite.length)
      unique(t.partite, p => p.ordine)
      const roundTeams = new Set()
      for (const p of t.partite) {
        assert.ok(['partita','riposo','da-definire'].includes(p.tipo))
        for (const team of [p.casa,p.fuori].filter(Boolean)) {
          assert.ok(!roundTeams.has(team), 'Società duplicata nel turno'); roundTeams.add(team); teams.add(team)
        }
        assert.equal(p.tipo, p.casa && p.fuori ? 'partita' : p.casa || p.fuori ? 'riposo' : 'da-definire')
        assert.equal(typeof p.giocata, 'boolean')
        if (p.giocata) {
          assert.equal(p.tipo, 'partita')
          for (const k of ['gol_casa','gol_fuori']) assert.ok(Number.isInteger(p[k]) && p[k] >= 0)
          for (const k of ['fp_casa','fp_fuori']) assert.ok(finite(p[k]))
        } else for (const k of ['gol_casa','gol_fuori','fp_casa','fp_fuori']) assert.equal(p[k], null, 'Risultato provvisorio non ammesso')
        if (p.tipo !== 'partita') continue
        const row = {...p, competizione:c.id, ordine:c.girone ? (t.ordine-1)*2+(c.girone==='A'?1:2) : t.ordine,
          nome_turno:t.nome+(c.girone?` · Girone ${c.girone}`:''), fonte:t.fonte, data:t.data, serie_a:t.serie_a}
        const key = matchKey(row), fk = `${t.fonte}|${p.casa}|${p.fuori}`
        assert.ok(!matches.has(key) && !bySource.has(fk), 'Partita duplicata')
        matches.set(key,row); bySource.set(fk,row)
      }
    }
  }
  const formations = unique(source.formazioni, formationKey)
  for (const f of formations.values()) {
    const p = bySource.get(`${f.fonte}|${f.casa}|${f.fuori}`)
    assert.ok(p && [p.casa,p.fuori].includes(f.societa), 'Formazione senza incontro')
    assert.equal(f.competizione,p.competizione)
    assert.equal(f.serie_a,p.serie_a)
    assert.equal(f.stato,p.giocata?'concluso':'provvisorio')
    const starters=f.giocatori.filter(g=>g.titolare)
    assert.equal(starters.length,11); assert.equal(starters.filter(g=>g.ruolo==='P').length,1)
    assert.equal(f.modulo, ['D','C','A'].map(r=>starters.filter(g=>g.ruolo===r).length).join('-'))
    unique(f.giocatori,playerKey); unique(f.giocatori,g=>g.fantapazz_id)
    for (const titolare of [true,false]) {
      const list=f.giocatori.filter(g=>g.titolare===titolare)
      assert.deepEqual(list.map(g=>g.ordine),list.map((_,i)=>i+1),'Ordine giocatori non valido')
    }
    for (const g of f.giocatori) {
      assert.ok(Number.isInteger(g.fantapazz_id) && g.fantapazz_id>0 && g.nome)
      assert.ok(['P','D','C','A'].includes(g.ruolo)); assert.equal(typeof g.titolare,'boolean'); assert.equal(typeof g.entrato,'boolean')
      assert.ok([null,'C','VC'].includes(g.fascia))
      assert.ok(g.voto===null || finite(g.voto))
      for (const b of g.bonus) assert.ok(bonuses.has(b) && finite(bonuses.get(b)),`Bonus ignoto: ${b}`)
      if (!p.giocata) {assert.equal(g.voto,null); assert.equal(g.entrato,false); assert.deepEqual(g.bonus,[])}
    }
    unique(f.modificatori,m=>m.nome)
    for (const m of f.modificatori) assert.ok(m.nome && finite(m.valore),'Modificatore finale senza valore')
    if (!p.giocata) assert.deepEqual(f.modificatori,[])
    else {
      const active=f.giocatori.filter(g=>(g.titolare||g.entrato)&&g.voto!==null)
      assert.ok(active.length>0 && active.length<=11,'Giocatori a voto non validi')
      const sum=active.reduce((s,g)=>s+g.voto+g.bonus.reduce((v,b)=>v+bonuses.get(b),0),0)+f.modificatori.reduce((s,m)=>s+m.valore,0)
      assert.ok(Math.abs(sum-p[f.societa===p.casa?'fp_casa':'fp_fuori'])<0.000001,`Totale non coincidente: ${f.societa} ${f.fonte}`)
    }
  }
  const rankings=unique(source.classifiche,c=>c.id)
  for (const r of rankings.values()) {
    assert.equal(r.righe.length,teams.size,'Classifica incompleta')
    unique(r.righe,x=>x.societa)
    for (const row of r.righe) {
      assert.ok(teams.has(row.societa)); assert.ok(Number.isInteger(row.posizione)&&row.posizione>0)
      for (const [key,value] of Object.entries(row)) if (key!=='societa') assert.ok(finite(value))
    }
  }
  // Rankings must describe the same published matches, including assigned G1 draws.
  for (const comp of ['campionato','mondiale-per-club']) {
    const ranking=rankings.get(comp)
    if (!ranking) continue
    const sums=new Map([...teams].map(t=>[t,{punti:0,vinte:0,pari:0,perse:0,gol_fatti:0,gol_subiti:0,fantapunti:0,fp_subiti:0}]))
    for (const p of matches.values()) if (p.competizione===comp&&p.giocata) {
      for (const [side,other] of [['casa','fuori'],['fuori','casa']]) {
        const s=sums.get(p[side]),a=p[`gol_${side}`],b=p[`gol_${other}`]
        s.punti+=a>b?3:a===b?1:0; s.vinte+=a>b?1:0;s.pari+=a===b?1:0;s.perse+=a<b?1:0
        s.gol_fatti+=a;s.gol_subiti+=b;s.fantapunti+=p[`fp_${side}`];s.fp_subiti+=p[`fp_${other}`]
      }
    }
    for (const r of ranking.righe) {
      const s=sums.get(r.societa)
      for (const [k,v] of Object.entries(s)) assert.equal(r[k],v,`Classifica incoerente: ${comp} ${r.societa} ${k}`)
      if ('differenza_gol' in r) assert.equal(r.differenza_gol,s.gol_fatti-s.gol_subiti,'Differenza gol incoerente')
      if ('differenza_fp' in r) assert.equal(r.differenza_fp,s.fantapunti-s.fp_subiti,'Differenza fantapunti incoerente')
    }
  }
  return {calendars,matches,bySource,formations,rankings}
}

export function planSync(before,after,bonuses) {
  assert.equal(after.stagione,before.stagione,'Cambio stagione non automatico')
  assert.ok(Date.parse(after.acquisito_al)>=Date.parse(before.acquisito_al),'Fonte arretrata')
  const old=indexSource(before,bonuses),next=indexSource(after,bonuses)
  if (before.sha256===after.sha256) assert.deepEqual(after,before,'Fonte modificata con impronta invariata')
  for (const type of ['calendars','matches','rankings']) assert.deepEqual([...old[type].keys()].sort(),[...next[type].keys()].sort(),`Copertura ${type} cambiata: serve riconciliazione esplicita`)
  for (const key of old.formations.keys()) assert.ok(next.formations.has(key),'Formazione preesistente scomparsa')
  const changedMatches=[...next.matches].filter(([key,p])=>!equal(p,old.matches.get(key)))
  const changedFormations=[...next.formations].filter(([key,f])=>!equal(f,old.formations.get(key)))
  for (const [,p] of changedMatches) if (p.giocata) {
    for (const team of [p.casa,p.fuori]) assert.ok(next.formations.has(`${p.fonte}|${p.casa}|${p.fuori}|${team}`),'Risultato modificato senza entrambe le formazioni')
  }
  const corrections=changedMatches.filter(([key,p])=>old.matches.get(key).giocata&&!equal(result(p),result(old.matches.get(key)))).map(([key])=>key)
  return {old,next,changedMatches,changedFormations,corrections,
    changed:!equal(before.calendari,after.calendari)||!equal(before.classifiche,after.classifiche)||changedFormations.length>0}
}
