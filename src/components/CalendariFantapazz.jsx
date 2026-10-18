import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchivio, calendariFantapazz } from '../lib/archivio'
import { getTeam } from '../lib/core'
import './CalendariFantapazz.css'
const nome=id=>getTeam(id)?.name??id
const cifra=n=>n==null?'—':Number(n).toLocaleString('it-IT')
const data=s=>new Date(`${s}T12:00:00`).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'})
export default function CalendariFantapazz({stagione,competizione=null}) {
 const stato=useArchivio(['calendariFantapazz',stagione],()=>stagione?calendariFantapazz(stagione):Promise.resolve(null),[stagione])
 const [scelta,setScelta]=useState('campionato'),[societa,setSocieta]=useState(''),[filtro,setFiltro]=useState('tutte')
 if(stato.caricamento)return <p role="status">Carico i calendari Fantapazz…</p>
 if(stato.errore)return <p role="alert">Calendari non disponibili: {stato.errore}</p>
 if(!stato.dati)return <p>Nessuna fotografia Fantapazz disponibile per questa stagione.</p>
 const {calendari,classifiche,acquisito_al}=stato.dati
 const id=competizione??scelta
 const comps=calendari.filter(c=>c.id===id),classifica=classifiche.find(c=>c.id===id)
 const opzioni=[...new Map([...calendari,...classifiche].map(c=>[c.id,c.nome])).entries()]
 const squadre=[...new Set(calendari.flatMap(c=>c.turni.flatMap(t=>t.partite.flatMap(p=>[p.casa,p.fuori]))).filter(Boolean))].sort((a,b)=>nome(a).localeCompare(nome(b)))
 const turni=comps.flatMap(c=>c.turni.map(t=>({...t,girone:c.girone,partite:t.partite.filter(p=>(!societa||[p.casa,p.fuori].includes(societa))&&(filtro==='tutte'||(filtro==='giocate'?p.giocata:!p.giocata)))}))).filter(t=>t.partite.length).sort((a,b)=>a.data.localeCompare(b.data)||(a.girone??'').localeCompare(b.girone??''))
 return <section className="calendari-fp" aria-label="Calendari e competizioni Fantapazz">
  <div className="cfp-intro"><div><p className="eyebrow">Fantapazz · {stagione}</p><h2>{opzioni.find(([k])=>k===id)?.[1]??'Calendari e competizioni'}</h2></div><span>Fotografia del {data(acquisito_al)}</span></div>
  <div className="cfp-filtri">
   {!competizione&&<label>Competizione<select aria-label="Competizione del calendario" value={id} onChange={e=>setScelta(e.target.value)}>{opzioni.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select></label>}
   {!!comps.length&&<><label>Società<select aria-label="Società del calendario" value={societa} onChange={e=>setSocieta(e.target.value)}><option value="">Tutte</option>{squadre.map(s=><option key={s} value={s}>{nome(s)}</option>)}</select></label><label>Incontri<select aria-label="Stato degli incontri" value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="tutte">Tutti</option><option value="giocate">Giocati</option><option value="prossime">In programma</option></select></label></>}
  </div>
  {classifica&&<details className="cfp-classifica" open={!comps.length}><summary>Classifica · {classifica.righe.length} società</summary><div className="cfp-scroll"><table><thead><tr><th>Pos.</th><th>Società</th>{classifica.righe[0]?.punti!=null&&<><th>Punti</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th></>}<th>{id==='fantapunti-max'?'Miglior punteggio':'Fantapunti'}</th></tr></thead><tbody>{classifica.righe.map(r=><tr key={r.societa}><td>{r.posizione}</td><th>{nome(r.societa)}</th>{r.punti!=null&&['punti','vinte','pari','perse','gol_fatti','gol_subiti'].map(k=><td key={k}>{cifra(r[k])}</td>)}<td>{cifra(r.fantapunti)}</td></tr>)}</tbody></table></div>{id.startsWith('fantapunti')&&<p>La classifica Fantapazz esclude fattore campo e modificatore del centrocampo. {id==='fantapunti-max'?'Indica il massimo di una singola giornata.':''}</p>}</details>}
  {comps.length>0&&<><p className="cfp-nota">{turni.length} {turni.length===1?'turno visualizzato':'turni visualizzati'}. Le date sono quelle del calendario Fantapazz; non indicano l’orario limite di consegna. Gli incontri senza risultato restano in programma.</p><div className="cfp-turni">{turni.map(t=><article className="cfp-turno" key={`${t.fonte}-${t.girone??''}`}><header><div><h3>{t.nome}{t.girone?` · Girone ${t.girone}`:''}</h3><p>{data(t.data)} · {t.serie_a}ª Serie A</p></div><a href={t.fonte} target="_blank" rel="noreferrer">Fonte ↗</a></header><ul>{t.partite.map(p=><li key={p.ordine}>
   {p.tipo==='riposo'?<div className="cfp-riposo">Riposa: <strong>{nome(p.casa??p.fuori)}</strong></div>:<><div className="cfp-sfida"><span>{p.casa?nome(p.casa):'Da definire'}</span><strong>{p.giocata?`${p.gol_casa} – ${p.gol_fuori}`:'–'}</strong><span>{p.fuori?nome(p.fuori):'Da definire'}</span></div><div className="cfp-dettaglio">{p.etichetta&&<span>{p.etichetta}</span>}{p.giocata&&<span>FP {cifra(p.fp_casa)} · {cifra(p.fp_fuori)}</span>}{p.partita&&<Link to={`/partita/${p.partita}`}>{p.formazioni?'Formazioni e tabellino':'Apri partita'}</Link>}</div></>}
  </li>)}</ul></article>)}</div>{!turni.length&&<p>Nessun incontro corrisponde ai filtri.</p>}</>}
 </section>
}
