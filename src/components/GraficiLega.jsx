import { useId, useState } from 'react'
import { cifra } from '../lib/analisi'
import './GraficiLega.css'

/** SVG accessibile: legenda, valori a tastiera e tabella per ogni grafico. */
export function Linee({titolo,serie,invertito=false,asseX='Giornata',etichettaX=v=>`${v}ª`}) {
  const id=useId()
  const [attivo,setAttivo]=useState(null)
  const punti=serie.flatMap(s=>s.punti.filter(p=>p.y!=null&&Number.isFinite(p.y)))
  if(!punti.length)return <p className="ana-vuoto">Nessun dato disponibile per questo grafico.</p>
  const xs=[...new Set(punti.map(p=>p.x))].sort((a,b)=>a-b)
  const min=Math.min(0,...punti.map(p=>p.y)),max=Math.max(1,...punti.map(p=>p.y))
  const x=v=>52+(v-xs[0])/Math.max(1,xs.at(-1)-xs[0])*650
  const y=v=>invertito?24+(v-min)/(max-min)*210:234-(v-min)/(max-min)*210
  return <div className="ana-grafico">
    <svg viewBox="0 0 730 280" role="img" aria-labelledby={id}>
      <title id={id}>{titolo}. Valori disponibili anche nella tabella sottostante.</title>
      {Array.from({length:5},(_,i)=>min+(max-min)*i/4).map(v=><g key={v}><line x1="52" x2="702" y1={y(v)} y2={y(v)} className="ana-griglia"/><text x="42" y={y(v)+4} textAnchor="end">{cifra(v)}</text></g>)}
      {xs.filter((_,i)=>xs.length<13||i%Math.ceil(xs.length/10)===0||i===xs.length-1).map(v=><text key={v} x={x(v)} y="260" textAnchor="middle">{etichettaX(v)}</text>)}
      {serie.map((s,i)=>{const dati=s.punti.filter(p=>p.y!=null);const segmenti=[];let segmento=[];for(const p of s.punti){if(p.y==null||(segmento.length&&p.x-segmento.at(-1).x>1)){if(segmento.length)segmenti.push(segmento);segmento=[]}if(p.y!=null)segmento.push(p)}if(segmento.length)segmenti.push(segmento);return <g key={s.id} style={{color:s.colore}} opacity={attivo!=null&&attivo!==i ? .2 : 1}>
        {segmenti.map((segmento,k)=><polyline key={k} fill="none" stroke="currentColor" strokeWidth="2.8" points={segmento.map(p=>`${x(p.x)},${y(p.y)}`).join(' ')} />)}
        {dati.map(p=><circle key={p.x} cx={x(p.x)} cy={y(p.y)} r="4.2" fill="currentColor" tabIndex="0" aria-label={`${s.nome}, ${asseX} ${etichettaX(p.x)}: ${cifra(p.y)}`}><title>{s.nome} · {etichettaX(p.x)}: {cifra(p.y)}</title></circle>)}
      </g>})}
    </svg>
    <div className="ana-legenda">{serie.map((s,i)=><button type="button" key={s.id} onMouseEnter={()=>setAttivo(i)} onMouseLeave={()=>setAttivo(null)} onFocus={()=>setAttivo(i)} onBlur={()=>setAttivo(null)} style={{'--serie':s.colore}}><i/>{s.nome}</button>)}</div>
    <details className="ana-dati"><summary>Leggi i valori del grafico</summary><div className="ana-scroll"><table><thead><tr><th>{asseX}</th>{serie.map(s=><th key={s.id}>{s.nome}</th>)}</tr></thead><tbody>{xs.map(g=><tr key={g}><th>{etichettaX(g)}</th>{serie.map(s=><td key={s.id}>{cifra(s.punti.find(p=>p.x===g)?.y)}</td>)}</tr>)}</tbody></table></div></details>
  </div>
}

export function Barre({titolo,righe,unita=''}) {
  const max=Math.max(1,...righe.map(r=>Math.abs(r.valore??0)))
  return <div className="ana-barre" role="list" aria-label={titolo}>{righe.map(r=><div key={r.id} className="ana-barra" role="listitem"><span>{r.nome}</span><div className="ana-pista"><i style={{width:`${Math.abs(r.valore??0)/max*100}%`,background:r.colore??'var(--gold-400)'}}/></div><b>{cifra(r.valore)}{r.valore==null?'':unita}</b></div>)}</div>
}

export function Dispersione({titolo,righe,xLabel,yLabel}) {
  const id=useId(),validi=righe.filter(r=>r.x!=null&&r.y!=null)
  if(!validi.length)return <p className="ana-vuoto">Dati non disponibili.</p>
  const maxX=Math.max(1,...validi.map(r=>r.x)),maxY=Math.max(1,...validi.map(r=>r.y))
  return <div className="ana-grafico"><svg viewBox="0 0 730 300" role="img" aria-labelledby={id}><title id={id}>{titolo}</title>{[0,.25,.5,.75,1].map(v=><g key={v}><line x1="55" x2="705" y1={245-v*215} y2={245-v*215} className="ana-griglia"/><text x="44" y={250-v*215} textAnchor="end">{cifra(maxY*v)}</text><text x={55+v*650} y="265" textAnchor="middle">{cifra(maxX*v)}</text></g>)}{validi.map(r=><g key={r.id} style={{color:r.colore}}><circle cx={55+r.x/maxX*650} cy={245-r.y/maxY*215} r="7" fill="currentColor" fillOpacity=".8" tabIndex="0" aria-label={`${r.nome}: ${xLabel} ${r.x}, ${yLabel} ${r.y}`}><title>{r.nome}: {xLabel} {cifra(r.x)}, {yLabel} {cifra(r.y)}</title></circle><text x={55+r.x/maxX*650} y={232-r.y/maxY*215} textAnchor="middle" fill="currentColor">{r.nome}</text></g>)}<text x="380" y="295" textAnchor="middle">{xLabel}</text><text x="55" y="15">{yLabel}</text></svg></div>
}
