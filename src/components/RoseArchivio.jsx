import {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'
import {useArchivio,sintesiRoseShiny,storicoRoseShiny,assenzeRoseShiny,dettagliRosaShiny} from '../lib/archivio'
import {getTeam,logoUrl} from '../lib/core'
import {cifra} from '../lib/analisi'
import {Linee,Barre} from './GraficiLega'
import './RoseArchivio.css'

const nome=id=>getTeam(id)?.name??id
const colonne=[['nome','Calciatore'],['stagione','Stagione'],['ruolo','Ruolo'],['costo','Costo'],['valore_fp','Valore FP'],['club','Club'],['mv','MV'],['presenze','Presenze'],['fm_fp','FM FP'],['mv_fp','MV FP'],['fm_ro_fp','FM Ro FP'],['mv_ro_fp','MV Ro FP']]
const colori={Indisponibili:'#d9b46a',Assenti:'#65b9e8',Squalificati:'#d9899d'}
function Pannello({titolo,children,wide=false}) {return <section className={`ana-pannello${wide?' ana-largo':''}`}><h2>{titolo}</h2>{children}</section>}

export default function RoseArchivio({societaIniziale,privato=false}) {
  const sintesi=useArchivio('sintesiRoseShiny',sintesiRoseShiny)
  const [societa,setSocieta]=useState(societaIniziale??'prosecco')
  const ids=[...new Set((sintesi.dati??[]).map(r=>r.societa))]
  if(sintesi.errore)return <p role="alert">Impossibile caricare le rose: {sintesi.errore}</p>
  if(!sintesi.dati)return <p role="status">Carico rose attuali e storico…</p>
  if(!ids.length)return <p>Nessuna rosa disponibile dalla Shiny.</p>
  return <div className="rose-archivio">
    <div className="ana-filtri"><label>Società delle rose<select aria-label="Società delle rose" value={societa} onChange={e=>setSocieta(e.target.value)}>{ids.map(id=><option value={id} key={id}>{nome(id)}</option>)}</select></label><p>Fonte: <a href="https://caprera.shinyapps.io/caprera/" target="_blank" rel="noreferrer">Caprera Shiny · Clubs → Rose</a></p></div>
    <Rosa key={societa} societa={societa} sintesi={sintesi.dati.filter(r=>r.societa===societa)} privato={privato}/>
  </div>
}

function Rosa({societa,sintesi,privato}) {
  const rose=useArchivio(['storicoRoseShiny',societa],()=>storicoRoseShiny(societa),[societa])
  const assenze=useArchivio(['assenzeRoseShiny',societa],()=>assenzeRoseShiny(societa),[societa])
  const attuale=sintesi.at(-1)
  const [stagione,setStagione]=useState(attuale.stagione),[ricerca,setRicerca]=useState(''),[ruolo,setRuolo]=useState(''),[pagina,setPagina]=useState(0),[ordine,setOrdine]=useState({campo:'ordine',asc:true}),[metrica,setMetrica]=useState('conteggio')
  const righe=(rose.dati??[]).filter(r=>(!stagione||r.stagione===stagione)&&(!ruolo||r.ruolo===ruolo)&&`${r.nome} ${r.club??''}`.toLocaleLowerCase('it').includes(ricerca.toLocaleLowerCase('it'))).sort((a,b)=>{
    const x=a[ordine.campo],y=b[ordine.campo]
    if(x==null)return y==null?a.ordine-b.ordine:1
    if(y==null)return -1
    return (typeof x==='number'?x-y:String(x).localeCompare(String(y),'it'))*(ordine.asc?1:-1)||a.ordine-b.ordine
  })
  const perPagina=31,pagine=Math.ceil(righe.length/perPagina),p=Math.min(pagina,Math.max(0,pagine-1))
  const somma=stagione?sintesi.find(s=>s.stagione===stagione):null
  const team=getTeam(societa)
  function ordina(campo) {setOrdine(o=>({campo,asc:o.campo===campo?!o.asc:['nome','stagione','ruolo','club'].includes(campo)}));setPagina(0)}
  return <>
    <header className="rose-archivio-testa">{team&&<img src={logoUrl(team)} alt=""/>}<div><p className="eyebrow">{nome(societa)}</p><h2>Rose attuali · {attuale.stagione} · e storico</h2><p className="ana-nota">Dati della Shiny al {attuale.aggiornato_al.split('-').reverse().join('/')} · {sintesi.length} stagioni disponibili</p></div></header>
    <div className="ana-filtri"><label>Stagione della rosa<select aria-label="Stagione della rosa" value={stagione} onChange={e=>{setStagione(e.target.value);setPagina(0)}}><option value="">Tutto lo storico</option>{[...sintesi].reverse().map(r=><option key={r.stagione}>{r.stagione}</option>)}</select></label><label>Cerca nelle rose<input aria-label="Cerca nelle rose" type="search" value={ricerca} placeholder="Calciatore o club" onChange={e=>{setRicerca(e.target.value);setPagina(0)}}/></label><label>Ruolo nella rosa<select aria-label="Ruolo nella rosa" value={ruolo} onChange={e=>{setRuolo(e.target.value);setPagina(0)}}><option value="">Tutti</option>{['P','D','C','A'].map(r=><option key={r}>{r}</option>)}</select></label><button onClick={()=>{setRicerca('');setRuolo('');setPagina(0)}}>Azzera filtri</button></div>
    {somma&&<div className="ana-kpi rose-archivio-numeri"><div><b>{somma.giocatori}</b><span>Giocatori · {stagione}</span></div><div><b>{cifra(somma.costo)}</b><span>Costo d’acquisto · crediti</span></div><div><b>{cifra(somma.valore_fp)}</b><span>Valore Fantapazz</span></div></div>}
    <div className="ana-griglia">
      <Pannello wide titolo={stagione?`Rosa ${stagione}`:'Tutte le rose nella Shiny'}>
        {rose.caricamento?<p role="status">Carico i calciatori…</p>:rose.errore?<p role="alert">Impossibile caricare i calciatori: {rose.errore}</p>:<>
          <p className="ana-nota">{righe.length} righe · {rose.dati?.length??0} nell’archivio della società. Ordina premendo un’intestazione.</p>
          <div className="ana-scroll" tabIndex="0" role="region" aria-label="Tabella rose attuali e storico"><table><thead><tr>{colonne.map(([k,t])=><th key={k} scope="col" aria-sort={ordine.campo===k?(ordine.asc?'ascending':'descending'):'none'}><button onClick={()=>ordina(k)}>{t}{ordine.campo===k?(ordine.asc?' ↑':' ↓'):''}</button></th>)}</tr></thead><tbody>{righe.slice(p*perPagina,(p+1)*perPagina).map(r=><tr key={r.ordine}>{colonne.map(([k])=>k==='nome'?<th scope="row" key={k}>{r[k]}</th>:<td key={k}>{['stagione','ruolo','club'].includes(k)?r[k]||'—':cifra(r[k])}</td>)}</tr>)}</tbody></table></div>
          {!righe.length&&<p>Nessun calciatore corrisponde ai filtri.</p>}
          <div className="ana-pagine"><button disabled={p===0} onClick={()=>setPagina(p-1)}>Rose precedenti</button><span>{pagine?p+1:0} / {pagine}</span><button disabled={p+1>=pagine} onClick={()=>setPagina(p+1)}>Rose successive</button></div>
        </>}
        <p className="ana-nota">Costo e quotazione sono distinti. MV, FM FP, MV FP, FM Ro FP e MV Ro FP mantengono le colonne della fonte; “Ro” indica i valori arrotondati. — significa dato non disponibile. Lo storico riproduce la fotografia della Shiny.</p>
      </Pannello>
      <Pannello titolo="Costo della rosa nelle stagioni"><Linee titolo="Costo delle rose per stagione" asseX="Stagione" etichettaX={v=>sintesi[v-1]?.stagione??v} serie={[{id:societa,nome:nome(societa),colore:'#d9b46a',punti:sintesi.map((r,i)=>({x:i+1,y:Number(r.costo)}))}]}/></Pannello>
      <Pannello titolo={`Costo e valore · ${attuale.stagione}`}><Barre titolo="Costo e quotazione attuali" righe={[{id:'costo',nome:'Costo',valore:attuale.costo},{id:'quote',nome:'Valore FP',valore:attuale.valore_fp,colore:'#65b9e8'}]}/><p className="ana-nota">Valori dell’intera rosa attuale. Il costo non rappresenta i crediti residui.</p></Pannello>
      <Pannello wide titolo={`Squalificati e infortunati · ${attuale.stagione}`}>
        <p className="ana-nota">Assenze cumulate fino alla giornata precedente, come pubblicate nella Shiny. Le categorie originali distinguono indisponibilità, assenze e squalifiche. Questo riepilogo riguarda la stagione attuale, anche quando consulti una rosa storica.</p>
        <div className="ana-filtri"><label>Indicatore delle assenze<select aria-label="Indicatore delle assenze" value={metrica} onChange={e=>setMetrica(e.target.value)}><option value="conteggio">Count · numero di assenze</option><option value="costo">Costo</option><option value="valore_fp">Valore FP</option></select></label></div>
        {assenze.caricamento?<p role="status">Carico le assenze…</p>:assenze.errore?<p role="alert">Impossibile caricare le assenze: {assenze.errore}</p>:<div className="rose-assenze">{Object.entries(colori).map(([ragione,colore])=>{const dati=(assenze.dati??[]).filter(r=>r.ragione===ragione).sort((a,b)=>b[metrica]-a[metrica]);return <section key={ragione}><h3 style={{color:colore}}>{ragione}</h3>{dati.length?<Barre titolo={`${ragione} · ${metrica}`} righe={dati.map(r=>({id:r.nome,nome:r.nome,valore:r[metrica],colore}))}/>:<p className="ana-nota">Nessuna voce nella fonte.</p>}</section>})}</div>}
        <p className="ana-nota">Costo e Valore FP sono i totali cumulati della fonte, non la quotazione attuale moltiplicata per il numero di assenze.</p>
      </Pannello>
      {privato&&<DettagliRiservati key={societa} societa={societa}/>}
    </div>
  </>
}

function DettagliRiservati({societa}) {
  const [stato,setStato]=useState({caricamento:true,dati:null,errore:null})
  useEffect(()=>{let vivo=true;dettagliRosaShiny(societa).then(dati=>vivo&&setStato({dati,caricamento:false})).catch(e=>vivo&&setStato({errore:e.message,caricamento:false}));return()=>{vivo=false}},[societa])
  if(stato.caricamento)return <p role="status">Carico i dettagli riservati…</p>
  if(stato.errore)return <p role="alert">Dettagli contrattuali non disponibili: {stato.errore}</p>
  if(!stato.dati)return <p className="ana-nota">I dettagli contrattuali sono riservati al mister della società e agli incarichi abilitati.</p>
  const d=stato.dati
  return <Pannello wide titolo={`Contratti nella Shiny · ${d.stagione}`}><div className="ana-kpi"><div><b>{cifra(d.wage)}</b><span>Wage della rosa · salario</span></div></div><p className="ana-nota">Fotografia riservata al {d.aggiornato_al.split('-').reverse().join('/')}. Le condizioni pubblicate nella Shiny restano distinte dal registro contratti dell’app.</p><div className="rose-contratti">{d.contratti}</div><Link to="/area/contratti">Apri il registro contratti</Link></Pannello>
}
