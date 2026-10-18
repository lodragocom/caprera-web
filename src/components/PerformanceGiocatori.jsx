import { useMemo, useState } from 'react'
import { useArchivio, performanceGiocatori, performanceMedie } from '../lib/archivio'
import { getTeam } from '../lib/core'
import { cifra } from '../lib/analisi'
import { Linee, Barre } from './GraficiLega'

const metriche={voto:'Voto FP',fpstat:'Voto statistico',voto_round:'Voto FP arrotondato',fm:'Fantavoto',fm_round:'Fantavoto arrotondato',valore_fp:'Valore FP'}
const chiave=r=>`${r.nome}|${r.ruolo}`
const numero=v=>v==null?null:Number(v)
const societaNome=id=>id?(getTeam(id)?.name??id):'Non assegnato'
const vuote=[]

function Tabella({titolo,righe,colonne}) {
  const [pagina,setPagina]=useState(0)
  const pag=Math.min(pagina,Math.max(0,Math.ceil(righe.length/25)-1))
  return <section className="ana-pannello ana-largo"><h2>{titolo}</h2><p className="ana-nota">{righe.length} righe · i valori mancanti sono indicati con —.</p><div className="ana-scroll"><table><thead><tr>{colonne.map(c=><th key={c.id}>{c.nome}</th>)}</tr></thead><tbody>{righe.slice(pag*25,pag*25+25).map(r=><tr key={`${chiave(r)}|${r.giornata_serie_a??''}`}>{colonne.map((c,i)=>i===0?<th key={c.id}>{c.leggi(r)}</th>:<td key={c.id}>{c.leggi(r)}</td>)}</tr>)}</tbody></table></div>{!righe.length&&<p>Nessun risultato con questi filtri.</p>}<div className="ana-pagine"><button onClick={()=>setPagina(pag-1)} disabled={!pag} aria-label={`Pagina precedente: ${titolo}`}>Precedenti</button><span>{righe.length?pag+1:0} / {Math.ceil(righe.length/25)}</span><button onClick={()=>setPagina(pag+1)} disabled={(pag+1)*25>=righe.length} aria-label={`Pagina successiva: ${titolo}`}>Successivi</button></div></section>
}
const anagrafica=[{id:'nome',nome:'Calciatore',leggi:r=>r.nome},{id:'ruolo',nome:'Ruolo',leggi:r=>r.ruolo},{id:'club',nome:'Club',leggi:r=>r.club??'—'},{id:'societa',nome:'Società',leggi:r=>societaNome(r.societa)}]
const colNumero=(id,nome)=>({id,nome,leggi:r=>cifra(r[id])})

export default function PerformanceGiocatori({stagione,societaIniziale}) {
  const fonte=useArchivio(['performanceGiocatori',stagione],()=>stagione?performanceGiocatori(stagione):Promise.resolve([]),[stagione])
  const sintesi=useArchivio(['performanceMedie',stagione],()=>stagione?performanceMedie(stagione):Promise.resolve([]),[stagione])
  const righe=fonte.dati??vuote,medie=sintesi.dati??vuote
  const [cerca,setCerca]=useState(''),[ruolo,setRuolo]=useState(''),[societa,setSocieta]=useState(''),[club,setClub]=useState('')
  const [da,setDa]=useState(1),[fino,setFino]=useState(null),[metrica,setMetrica]=useState('fm'),[scelti,setScelti]=useState(null)
  const [modulo,setModulo]=useState('3-4-3'),[criterio,setCriterio]=useState('valore_fp')
  const ultima=Math.max(1,...righe.map(r=>r.giornata_serie_a)),a=Math.min(fino??ultima,ultima),inizio=Math.min(da,a)
  const cercaNorm=cerca.trim().toLocaleLowerCase('it')
  const filtro=r=>(!cercaNorm||r.nome.toLocaleLowerCase('it').includes(cercaNorm))&&(!ruolo||r.ruolo===ruolo)&&(!club||r.club===club)&&(!societa||(societa==='liberi'?!r.societa:r.societa===societa))
  const giornaliere=righe.filter(r=>filtro(r)&&r.giornata_serie_a>=inizio&&r.giornata_serie_a<=a)
  const riepiloghi=medie.filter(filtro)
  const elenco=useMemo(()=>[...medie].sort((x,y)=>x.nome.localeCompare(y.nome,'it')),[medie])
  const suggeriti=elenco.filter(r=>r.societa===societaIniziale&&r.fm_mean!=null).sort((x,y)=>Number(y.fm_mean)-Number(x.fm_mean)).slice(0,3)
  const selezionati=scelti??(suggeriti.length?suggeriti:elenco.slice(0,3)).map(chiave)
  const serie=[...new Set(selezionati.filter(Boolean))].map((id,i)=>({id,nome:elenco.find(r=>chiave(r)===id)?.nome??id,colore:['#d9b46a','#65b9e8','#75cda0'][i],punti:righe.filter(r=>chiave(r)===id&&r.giornata_serie_a>=inizio&&r.giornata_serie_a<=a).sort((x,y)=>x.giornata_serie_a-y.giornata_serie_a).map(r=>({x:r.giornata_serie_a,y:numero(r[metrica])}))}))
  const classifica=[...riepiloghi].filter(r=>r[criterio]!=null).sort((x,y)=>Number(y[criterio])-Number(x[criterio])||x.nome.localeCompare(y.nome,'it'))
  const posti=[1,...modulo.split('-').map(Number)]
  const undici=['P','D','C','A'].flatMap((r,i)=>classifica.filter(p=>p.ruolo===r).slice(0,posti[i]))
  const riserve=['P','D','C','A'].flatMap((r,i)=>classifica.filter(p=>p.ruolo===r).slice(posti[i],posti[i]+posti[i]))
  if(fonte.caricamento||sintesi.caricamento)return <p role="status">Carico le Performance dei giocatori…</p>
  if(fonte.errore||sintesi.errore)return <p role="alert">Impossibile leggere le Performance: {fonte.errore||sintesi.errore}</p>
  if(!righe.length)return <p className="ana-vuoto">Le Performance per giornata non sono ancora presenti per la stagione {stagione}.</p>
  return <div className="performance-giocatori">
    <h2>Performance dei giocatori · {stagione}</h2>
    <p>{righe.length.toLocaleString('it-IT')} rilevazioni · {medie.length} calciatori · giornate Serie A 1–{ultima}. Fonte: <a href="https://caprera.shinyapps.io/caprera/" target="_blank" rel="noreferrer">Shiny Caprera, Lega → Giocatori → Performance</a>, aggiornata al {righe[0]?.aggiornato_al}.</p>
    <p className="ana-nota">Le giornate di questi grafici sono quelle di Serie A.{stagione==='2026-27'?' La 4ª Serie A corrisponde alla 2ª Caprera.':''} I rendimenti individuali non indicano chi è stato schierato. I valori «Round» sono quelli arrotondati pubblicati dalla fonte.</p>
    <section className="ana-pannello"><h2>Performance temporale</h2><div className="ana-filtri">{[0,1,2].map(i=><label key={i}>Calciatore {i+1}<select aria-label={`Calciatore a confronto ${i+1}`} value={selezionati[i]??''} onChange={e=>setScelti([0,1,2].map(j=>i===j?e.target.value:selezionati[j]??''))}><option value="">Nessuno</option>{elenco.map(r=><option key={chiave(r)} value={chiave(r)}>{r.nome} · {r.ruolo}</option>)}</select></label>)}<label>Indicatore<select aria-label="Indicatore Performance" value={metrica} onChange={e=>setMetrica(e.target.value)}>{Object.entries(metriche).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div><div className="ana-filtri"><label>Dalla giornata Serie A<select aria-label="Dalla giornata Serie A" value={inizio} onChange={e=>setDa(Number(e.target.value))}>{Array.from({length:a},(_,i)=><option key={i} value={i+1}>{i+1}ª</option>)}</select></label><label>Alla giornata Serie A<select aria-label="Alla giornata Serie A" value={a} onChange={e=>setFino(Number(e.target.value))}>{Array.from({length:ultima},(_,i)=><option key={i} value={i+1}>{i+1}ª</option>)}</select></label></div><Linee titolo={`Performance temporale: ${metriche[metrica]}`} asseX="Giornata Serie A" serie={serie}/><p className="ana-nota">L’intervallo si applica al grafico e alla tabella per giornata. Le medie e la Top 11 sotto riportano il riepilogo dell’intera stagione pubblicato dalla Shiny.</p></section>
    <div className="ana-filtri"><label>Cerca calciatore<input aria-label="Cerca nelle Performance" type="search" value={cerca} onChange={e=>setCerca(e.target.value)}/></label><label>Ruolo<select aria-label="Ruolo nelle Performance" value={ruolo} onChange={e=>setRuolo(e.target.value)}><option value="">Tutti</option>{['P','D','C','A'].map(r=><option key={r}>{r}</option>)}</select></label><label>Società<select aria-label="Società nelle Performance" value={societa} onChange={e=>setSocieta(e.target.value)}><option value="">Tutte</option><option value="liberi">Non assegnati nella fonte</option>{[...new Set(medie.map(r=>r.societa).filter(Boolean))].map(id=><option key={id} value={id}>{societaNome(id)}</option>)}</select></label><label>Club<select aria-label="Club nelle Performance" value={club} onChange={e=>setClub(e.target.value)}><option value="">Tutti</option>{[...new Set(righe.map(r=>r.club).filter(Boolean))].sort().map(c=><option key={c}>{c}</option>)}</select></label><button onClick={()=>{setCerca('');setRuolo('');setSocieta('');setClub('')}}>Azzera filtri giocatori</button></div>
    <div className="ana-griglia">
      <Tabella key={`giorni-${cerca}-${ruolo}-${societa}-${club}-${inizio}-${a}`} titolo="Performance per giornata" righe={giornaliere} colonne={[...anagrafica,colNumero('giornata_serie_a','Giornata Serie A'),...Object.entries(metriche).map(([k,v])=>colNumero(k,v))]}/>
      <Tabella key={`medie-${cerca}-${ruolo}-${societa}-${club}`} titolo="Performance medie, minimi e massimi" righe={riepiloghi} colonne={[...anagrafica,colNumero('valore_fp','Valore FP'),...['mean','min','max'].flatMap(op=>Object.entries(metriche).filter(([k])=>k!=='valore_fp').map(([k,v])=>colNumero(`${k}_${op}`,`${v} · ${{mean:'media',min:'min',max:'max'}[op]}`)))]}/>
      <section className="ana-pannello"><h2>Top 11 Performance</h2><p className="ana-nota">Dai giocatori filtrati, usando i riepiloghi Shiny. A parità di valore, ordine alfabetico. È una selezione statistica.</p><div className="ana-filtri"><label>Modulo<select aria-label="Modulo Top 11 Performance" value={modulo} onChange={e=>setModulo(e.target.value)}>{['3-4-3','3-5-2','3-6-1','4-3-3','4-4-2','4-5-1','5-3-2','5-2-3'].map(m=><option key={m}>{m}</option>)}</select></label><label>Criterio<select aria-label="Criterio Top 11 Performance" value={criterio} onChange={e=>setCriterio(e.target.value)}>{Object.entries({valore_fp:'Valore FP',voto_mean:'Media voto FP',fpstat_mean:'Media voto statistico',fm_mean:'Fantamedia FP'}).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label></div><div className="ana-campo">{['A','C','D','P'].map(r=><div key={r}>{undici.filter(p=>p.ruolo===r).map(p=><span key={chiave(p)}><b>{p.nome}</b><small>{cifra(p[criterio])}</small></span>)}</div>)}</div>{undici.length!==11&&<p>I filtri non consentono di comporre undici giocatori.</p>}<h3>Panchina statistica</h3><ul>{riserve.map(p=><li key={chiave(p)}>{p.ruolo} · {p.nome} · {cifra(p[criterio])}</li>)}</ul></section>
      <section className="ana-pannello"><h2>Migliori Performance</h2><p className="ana-nota">Stesso criterio e filtri della Top 11.</p><Barre titolo="Migliori Performance" righe={classifica.slice(0,15).map(r=>({id:chiave(r),nome:r.nome,valore:numero(r[criterio])}))}/></section>
    </div>
  </div>
}
