export const cifra = v => v == null ? '—' : Number(v).toLocaleString('it-IT', { maximumFractionDigits: 2 })

/** Serie del campionato: i fantapunti di classifica escludono il +1 in casa. */
export function gareSocieta(partite = []) {
  return partite.filter(p => p.giocata && p.giornata != null).flatMap(p => [true, false].map(casa => {
    const gf = casa ? p.gol_casa : p.gol_fuori
    const gs = casa ? p.gol_fuori : p.gol_casa
    const fp = casa ? p.fp_casa : p.fp_fuori
    return {id:p.id, giornata:p.giornata, societa:casa?p.casa:p.fuori, avversario:casa?p.fuori:p.casa,
      casa, gf, gs, punti:gf==null||gs==null?null:gf>gs?3:gf===gs?1:0,
      fantapunti:fp==null?null:Number(fp)-(casa?1:0)}
  })).sort((a,b)=>a.giornata-b.giornata)
}

export function aggregaCampionato(gare, {da=1,a=Infinity,campo='tutte'}={}) {
  const m = new Map()
  for (const g of gare.filter(g=>g.giornata>=da&&g.giornata<=a&&(campo==='tutte'||g.casa===(campo==='casa')))) {
    const r=m.get(g.societa)??{societa:g.societa,giocate:0,punti:0,fantapunti:0,gol_fatti:0,gol_subiti:0,vinte:0,pari:0,perse:0,fpDisponibili:0}
    r.giocate++;r.punti+=g.punti??0;r.gol_fatti+=g.gf??0;r.gol_subiti+=g.gs??0
    if(g.fantapunti!=null){r.fantapunti+=g.fantapunti;r.fpDisponibili++}
    if(g.punti===3)r.vinte++;if(g.punti===1)r.pari++;if(g.punti===0)r.perse++
    m.set(g.societa,r)
  }
  return [...m.values()].map(r=>({...r,fantapunti:r.fpDisponibili?r.fantapunti:null,dr:r.gol_fatti-r.gol_subiti}))
    .sort((x,y)=>y.punti-x.punti||(y.fantapunti??-Infinity)-(x.fantapunti??-Infinity)||y.dr-x.dr||x.societa.localeCompare(y.societa))
}

export function serieCampionato(gare, societa, metrica, {da=1,a=Infinity,campo='tutte',cumulata=true}={}) {
  let totale=0
  return gare.filter(g=>g.societa===societa&&g.giornata>=da&&g.giornata<=a&&(campo==='tutte'||g.casa===(campo==='casa')))
    .map(g=>{const v=g[metrica];if(v!=null)totale+=v;return{x:g.giornata,y:v==null?null:cumulata?totale:v}})
}

export function seriePremio(righe, societa, metrica, {da=1,a=Infinity,cumulata=true}={}) {
  let totale=0
  return righe.filter(r=>r.societa===societa&&r.giornata>=da&&r.giornata<=a).sort((x,y)=>x.giornata-y.giornata)
    .map(r=>{const v=r[metrica]==null?null:Number(r[metrica]);if(v!=null)totale+=v;return{x:r.giornata,y:v==null?null:metrica==='valore_rosa'||!cumulata?v:totale}})
}

export function quotazioniRose(rose=[], listone=[]) {
  const indice=new Map(listone.map(r=>[`${r.nome}|${r.ruolo}|${r.club??''}`,r.prezzo]))
  const m=new Map()
  for(const r of rose){const v=indice.get(`${r.nome}|${r.ruolo}|${r.club??''}`)
    const s=m.get(r.societa)??{societa:r.societa,giocatori:0,costo:0,costi:0,valore:0,quotati:0}
    s.giocatori++;if(r.costo!=null){s.costo+=Number(r.costo);s.costi++}if(v!=null){s.valore+=Number(v);s.quotati++}m.set(r.societa,s)}
  return [...m.values()].map(s=>({...s,valore:s.quotati===s.giocatori?s.valore:null,costo:s.costi===s.giocatori?s.costo:null}))
}

export function unisciGiocatori(rose=[],listone=[]) {
  const perNome=new Map(rose.map(r=>[`${r.nome}|${r.ruolo}|${r.club??''}`,r]))
  return listone.map(q=>{const r=perNome.get(`${q.nome}|${q.ruolo}|${q.club??''}`);return{...q,societa:r?.societa??null,costo:r?.costo??null,calciatore:r?.calciatore??null,presenze:r?.presenze??null,mv:r?.mv??null,fm:r?.fm??null}})
}
