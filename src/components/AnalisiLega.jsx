import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useArchivio, stagioni, partite, classifica, roseStagione, listone, statisticheGiornata, classificaPerpetua } from '../lib/archivio'
import { stagioneAttiva } from '../lib/stagioni'
import { getTeam, logoUrl } from '../lib/core'
import { gareSocieta, aggregaCampionato, serieCampionato, seriePremio, quotazioniRose, unisciGiocatori, cifra } from '../lib/analisi'
import { Linee, Barre, Dispersione } from './GraficiLega'
import './AnalisiLega.css'
import PerformanceGiocatori from './PerformanceGiocatori'

const nome=id=>getTeam(id)?.name??id
const breve=id=>getTeam(id)?.short??id
const colori=['#d9b46a','#65b9e8','#d9899d','#75cda0','#b6a1e7','#f2a25a','#b5c677','#8cbed1','#cfb3a2','#c9d5ee']
const metriche={punti:'Punti',fantapunti:'Fantapunti',gf:'Gol fatti',gs:'Gol subiti',valore_rosa:'Valore rosa',fair_play:'Fair Play',panchina_oro:'Panchina d’Oro',zdenek:'Zdenek'}
const premi=['valore_rosa','fair_play','panchina_oro','zdenek']
const numero=v=>v==null?null:Number(v)
function Pannello({titolo,nota,children,wide=false}){return <section className={`ana-pannello${wide?' ana-largo':''}`}><h2>{titolo}</h2>{nota&&<p className="ana-nota">{nota}</p>}{children}</section>}

export default function AnalisiLega({societa=null,soloCampionato=false,stagioneIniziale=null}) {
  const [parametri]=useSearchParams()
  const [scelta,setScelta]=useState(null),[tab,setTab]=useState(parametri.get('sezione')==='performance'?'performance':'campionato')
  const anni=useArchivio('stagioni',stagioni)
  const stagione=scelta??stagioneIniziale??stagioneAttiva(anni.dati??[])?.id
  const pa=useArchivio(['partite',stagione,'campionato'],()=>stagione?partite(stagione):Promise.resolve([]),[stagione])
  const ca=useArchivio(['classifica',stagione],()=>stagione?classifica(stagione):Promise.resolve([]),[stagione])
  const ro=useArchivio(['roseStagione',stagione,'attuale'],()=>stagione?roseStagione(stagione):Promise.resolve([]),[stagione])
  const li=useArchivio(['listone',stagione],()=>stagione?listone(stagione):Promise.resolve(null),[stagione])
  const st=useArchivio(['statisticheGiornata',stagione],()=>stagione?statisticheGiornata(stagione):Promise.resolve([]),[stagione])
  const gare=useMemo(()=>gareSocieta(pa.dati??[]),[pa.dati])
  const quote=useMemo(()=>li.dati?.fine?.length?li.dati.fine:li.dati?.righe??[],[li.dati])
  const squadre=useMemo(()=>[...new Set([...(ca.dati??[]).map(r=>r.societa),...gare.map(g=>g.societa),...(ro.dati??[]).map(r=>r.societa)])],[ca.dati,gare,ro.dati])
  const valore=useMemo(()=>quotazioniRose(ro.dati??[],quote),[ro.dati,quote])
  const ultima=Math.max(0,...gare.map(g=>g.giornata))
  const tabs=[['campionato','Campionato'],['rose','Rose e valori'],['giocatori','Giocatori e svincolati'],['performance','Performance giocatori'],['confronti','Scontri diretti'],['storico','Storico']]
  return <div className="analisi-lega">
    {!soloCampionato&&<><div className="ana-intro"><div><h2>Il laboratorio della lega</h2><p>Risultati, valori e confronti dalla stagione in corso allo storico.</p></div><label>Stagione<select aria-label="Stagione delle analisi" value={stagione??''} onChange={e=>setScelta(e.target.value)}>{(anni.dati??[]).map(s=><option key={s.id}>{s.id}</option>)}</select></label></div><nav className="ana-tabs" aria-label="Analisi della lega">{tabs.map(([id,t])=><button type="button" key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{t}</button>)}</nav></>}
    {pa.errore&&<p role="alert">Impossibile caricare i risultati: {pa.errore}</p>}
    {pa.caricamento&&<p role="status">Carico le analisi della stagione…</p>}
    {(tab==='campionato'||soloCampionato)&&<Campionato key={stagione} stagione={stagione} gare={gare} classifica={ca.dati??[]} statistiche={st.dati??[]} erroreStatistiche={st.errore} squadre={squadre} societa={societa} ultima={ultima} compatta={soloCampionato}/>}
    {!soloCampionato&&tab==='rose'&&<Rose valori={valore} rose={ro.dati??[]} quote={quote} correnti={Boolean(li.dati?.fine?.length)} />}
    {!soloCampionato&&tab==='giocatori'&&<Giocatori key={stagione} rose={ro.dati??[]} quote={quote} correnti={Boolean(li.dati?.fine?.length)}/>}
    {!soloCampionato&&tab==='performance'&&<PerformanceGiocatori key={stagione} stagione={stagione} societaIniziale={societa}/>}
    {!soloCampionato&&tab==='confronti'&&<Confronti key={stagione} gare={gare} squadre={squadre} societa={societa} partite={pa.dati??[]} />}
    {!soloCampionato&&tab==='storico'&&<Storico societa={societa} />}
    {!soloCampionato&&<nav className="ana-risorse" aria-label="Altre sezioni della lega"><Link to="/risultati">Calendario e tabellini</Link><Link to="/coppe">Coppe</Link><Link to="/albo-doro">Albo d’oro</Link><Link to="/ranking">Ranking</Link><Link to="/stats">Record</Link><Link to="/area/crediti">Finanze e crediti</Link><Link to="/area/contratti">Contratti</Link><Link to="/regolamento">Regolamento</Link><Link to="/assicurazioni">Assicurazioni</Link><Link to="/asta">Asta</Link></nav>}
  </div>
}

function Campionato({gare,classifica,statistiche,erroreStatistiche,squadre,societa,ultima,compatta}) {
  const [da,setDa]=useState(1),[fino,setFino]=useState(null),[campo,setCampo]=useState('tutte'),[metrica,setMetrica]=useState('punti'),[cumulo,setCumulo]=useState(true),[selezione,setSelezione]=useState(null)
  const a=Math.min(fino??ultima,ultima),inizio=Math.min(da,a||1)
  const selezionate=selezione??[societa,...squadre.filter(id=>id!==societa).slice(0,societa?2:3)].filter(Boolean)
  const ranghi=useMemo(()=>aggregaCampionato(gare,{da:inizio,a,campo}),[gare,inizio,a,campo])
  const ufficiale=inizio===1&&a===ultima&&campo==='tutte'
  const righe=ufficiale&&classifica.length?classifica:ranghi
  const serie=selezionate.map(id=>({id,nome:breve(id),colore:colori[Math.max(0,squadre.indexOf(id))%colori.length],punti:premi.includes(metrica)?seriePremio(statistiche,id,metrica,{da:inizio,a,cumulata:cumulo}):serieCampionato(gare,id,metrica,{da:inizio,a,campo,cumulata:cumulo})}))
  const graduatoria=premi.includes(metrica)?squadre.map(id=>{const punti=seriePremio(statistiche,id,metrica,{da:inizio,a,cumulata:true});return{societa:id,valore:punti.at(-1)?.y??null}}).filter(r=>r.valore!=null).sort((x,y)=>y.valore-x.valore):ranghi.map(r=>({societa:r.societa,valore:metrica==='gf'?r.gol_fatti:metrica==='gs'?r.gol_subiti:r[metrica]})).sort((x,y)=>(y.valore??-Infinity)-(x.valore??-Infinity))
  function scegli(id){setSelezione(v=>{const attuali=v??selezionate;return attuali.includes(id)?attuali.filter(x=>x!==id):[...attuali,id]})}
  if(!ultima)return <p className="ana-vuoto">Nessuna giornata giocata registrata per questa stagione.</p>
  return <>
    <div className="ana-filtri"><label>Dalla giornata<select aria-label="Dalla giornata" value={inizio} onChange={e=>setDa(Number(e.target.value))}>{Array.from({length:a||1},(_,i)=><option key={i} value={i+1}>{i+1}ª</option>)}</select></label><label>Alla giornata<select aria-label="Alla giornata" value={a} onChange={e=>setFino(Number(e.target.value))}>{Array.from({length:ultima},(_,i)=><option key={i} value={i+1}>{i+1}ª</option>)}</select></label><label>Campo<select aria-label="Campo" value={campo} onChange={e=>setCampo(e.target.value)}><option value="tutte">Casa e trasferta</option><option value="casa">Solo casa</option><option value="trasferta">Solo trasferta</option></select></label><button type="button" onClick={()=>{setDa(Math.max(1,ultima-4));setFino(null);setCampo('tutte')}}>Ultime cinque</button><button type="button" onClick={()=>{setDa(1);setFino(null);setCampo('tutte')}}>Tutta la stagione</button></div>
    <div className="ana-griglia">
      <Pannello wide titolo="Andamento per giornata" nota="Confronta le società e scegli un indicatore. I fantapunti escludono il bonus casalingo.">
        <div className="ana-filtri"><label>Indicatore<select aria-label="Indicatore" value={metrica} onChange={e=>setMetrica(e.target.value)}>{Object.entries(metriche).map(([id,n])=><option key={id} value={id}>{n}</option>)}</select></label><label className="ana-check"><input type="checkbox" checked={cumulo} onChange={e=>setCumulo(e.target.checked)}/>Valori cumulati</label></div>
        <fieldset className="ana-societa"><legend>Società a confronto</legend>{squadre.map((id,i)=><label key={id} style={{'--serie':colori[i%colori.length]}}><input type="checkbox" checked={selezionate.includes(id)} onChange={()=>scegli(id)}/><span>{breve(id)}</span></label>)}</fieldset>
        {selezionate.length?<Linee titolo={`Andamento ${metriche[metrica]}`} serie={serie}/>:<p className="ana-vuoto">Seleziona almeno una società.</p>}
        {premi.includes(metrica)&&<p className="ana-nota">Sono mostrate solo le giornate presenti nella fonte ({[...new Set(statistiche.map(s=>s.giornata))].sort((x,y)=>x-y).join(', ')||'nessuna'}). Questi indicatori non vengono filtrati per casa e trasferta. Il valore rosa è una fotografia, gli altri valori si sommano.</p>}
        {erroreStatistiche&&premi.includes(metrica)&&<p role="alert">Statistiche della Shiny temporaneamente non disponibili.</p>}
      </Pannello>
      <Pannello titolo={`${metriche[metrica]} nell’intervallo`} nota={`${inizio}ª–${a}ª giornata${premi.includes(metrica)?' · giornate disponibili nella fonte':''}`}><Barre titolo={metriche[metrica]} righe={graduatoria.map(r=>({id:r.societa,nome:breve(r.societa),valore:r.valore,colore:r.societa===societa?'var(--gold-400)':'#6b8cb8'}))}/></Pannello>
      <Pannello titolo="Attacco e difesa" nota="Gol fatti e subiti nell’intervallo selezionato."><Dispersione titolo="Attacco e difesa" xLabel="Gol subiti" yLabel="Gol fatti" righe={ranghi.map((r,i)=>({id:r.societa,nome:breve(r.societa),x:r.gol_subiti,y:r.gol_fatti,colore:colori[i%colori.length]}))}/></Pannello>
      <Pannello wide titolo={ufficiale?'Classifica ufficiale':'Classifica nell’intervallo'} nota={ufficiale?'Posizioni e totali dal registro della lega.':'Confronto calcolato per punti, fantapunti e differenza reti; non sostituisce la classifica ufficiale.'}>
        <div className="ana-scroll"><table><thead><tr><th>Società</th><th>G</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th><th>FP</th><th>Punti</th></tr></thead><tbody>{righe.map(r=><tr key={r.societa} className={r.societa===societa?'ana-mia':''}><th><Link to={`/squadre/${r.societa}`}>{ufficiale?r.posizione:null}{ufficiale?' · ':''}{nome(r.societa)}</Link></th>{['giocate','vinte','pari','perse','gol_fatti','gol_subiti','fantapunti','punti'].map(k=><td key={k}>{cifra(r[k])}</td>)}</tr>)}</tbody></table></div>
      </Pannello>
      {!compatta&&<Pannello wide titolo="Premi di giornata" nota="Fair Play: malus cartellini. Panchina d’Oro: fantapunti lasciati in panchina. Zdenek: variazione di valore della rosa. Valori ufficiali della Shiny."><div className="ana-scroll"><table><thead><tr><th>Giornata</th><th>Società</th><th>FP</th><th>Valore rosa</th><th>Fair Play</th><th>Panchina d’Oro</th><th>Zdenek</th></tr></thead><tbody>{statistiche.filter(r=>r.giornata>=inizio&&r.giornata<=a&&selezionate.includes(r.societa)).map(r=><tr key={`${r.societa}-${r.giornata}`}><td>{r.giornata}ª</td><th>{nome(r.societa)}</th>{['fantapunti','valore_rosa','fair_play','panchina_oro','zdenek'].map(k=><td key={k}>{cifra(r[k])}</td>)}</tr>)}</tbody></table>{!statistiche.length&&<p>Nessun valore di giornata disponibile in archivio.</p>}</div></Pannello>}
    </div>
  </>
}

function Rose({valori,rose,quote,correnti}) {
  const [club,setClub]=useState('')
  const r=valori.find(s=>s.societa===club)
  const perRuolo=['P','D','C','A'].map(ruolo=>({id:ruolo,nome:{P:'Portieri',D:'Difensori',C:'Centrocampisti',A:'Attaccanti'}[ruolo],valore:rose.filter(p=>(!club||p.societa===club)&&p.ruolo===ruolo).reduce((n,p)=>n+(numero(p.costo)??0),0)}))
  return <><div className="ana-filtri"><label>Società<select aria-label="Società" value={club} onChange={e=>setClub(e.target.value)}><option value="">Tutte le società</option>{valori.map(v=><option key={v.societa} value={v.societa}>{nome(v.societa)}</option>)}</select></label><p>{correnti?'Quotazioni a stagione in corso':'Quotazioni di partenza'} · {quote.length} giocatori nel listone</p></div><div className="ana-griglia"><Pannello titolo="Valore delle rose" nota="Quotazione Fantapazz dei calciatori attualmente in rosa."><Barre titolo="Valore delle rose" righe={[...valori].sort((a,b)=>(b.valore??0)-(a.valore??0)).map(v=>({id:v.societa,nome:breve(v.societa),valore:v.valore,colore:v.societa===club?'var(--gold-400)':undefined}))}/></Pannello><Pannello titolo="Costo e valore" nota="Ogni punto è una società: costo d’acquisto e valore del listone sono due misure distinte."><Dispersione titolo="Costo e valore delle rose" xLabel="Costo d’acquisto" yLabel="Quotazione rosa" righe={valori.map((v,i)=>({id:v.societa,nome:breve(v.societa),x:v.costo,y:v.valore,colore:colori[i%colori.length]}))}/></Pannello><Pannello titolo="Investimento per reparto" nota={club?nome(club):'Tutta la lega'}><Barre titolo="Costo per reparto" righe={perRuolo}/></Pannello><Pannello titolo={club?nome(club):'Le rose in numeri'}><div className="ana-kpi"><div><b>{r?.giocatori??rose.length}</b><span>Giocatori</span></div><div><b>{cifra(r?r.costo:valori.reduce((s,v)=>s+(v.costo??0),0))}</b><span>Crediti spesi</span></div></div><p className="ana-nota">Il costo della rosa non indica i crediti residui. Il bilancio completo è nell’area riservata.</p><Link to="/rose">Apri le rose complete</Link></Pannello><Pannello wide titolo="Confronto delle società"><div className="ana-scroll"><table><thead><tr><th>Società</th><th>Giocatori</th><th>Costo</th><th>Valore FP</th><th>Quote disponibili</th></tr></thead><tbody>{valori.filter(v=>!club||v.societa===club).map(v=><tr key={v.societa}><th><Link to={`/squadre/${v.societa}`}>{nome(v.societa)}</Link></th><td>{v.giocatori}</td><td>{cifra(v.costo)}</td><td>{cifra(v.valore)}</td><td>{v.quotati}/{v.giocatori}</td></tr>)}</tbody></table></div></Pannello></div></>
}

function Giocatori({rose,quote,correnti}) {
  const [cerca,setCerca]=useState(''),[ruolo,setRuolo]=useState(''),[tipo,setTipo]=useState('tutti'),[ordine,setOrdine]=useState('prezzo'),[pagina,setPagina]=useState(0),[modulo,setModulo]=useState('3-4-3'),[topMetrica,setTopMetrica]=useState('prezzo'),[minPres,setMinPres]=useState(3),[societa,setSocieta]=useState('')
  const tutti=useMemo(()=>unisciGiocatori(rose,quote),[rose,quote])
  const dati=tutti.filter(p=>(!societa||p.societa===societa)&&(!ruolo||p.ruolo===ruolo)&&(!cerca||`${p.nome} ${p.club??''}`.toLowerCase().includes(cerca.toLowerCase()))&&(tipo==='tutti'||(tipo==='svincolati'?!p.societa:Boolean(p.societa)))).sort((a,b)=>(numero(b[ordine])??-Infinity)-(numero(a[ordine])??-Infinity)||a.nome.localeCompare(b.nome))
  const paginaEff=Math.min(pagina,Math.max(0,Math.ceil(dati.length/25)-1))
  const conteggi=[1,...modulo.split('-').map(Number)]
  const top=['P','D','C','A'].flatMap((r,i)=>dati.filter(p=>p.ruolo===r&&p[topMetrica]!=null&&(topMetrica==='prezzo'||(p.presenze??0)>=minPres)).sort((a,b)=>Number(b[topMetrica])-Number(a[topMetrica])).slice(0,conteggi[i]))
  const completo=top.length===11
  const conVoti=tutti.filter(p=>p.fm!=null).length
  return <><div className="ana-filtri"><label>Società<select aria-label="Società dei giocatori" value={societa} onChange={e=>{setSocieta(e.target.value);setPagina(0)}}><option value="">Tutta la lega</option>{[...new Set(rose.map(r=>r.societa))].map(id=><option key={id} value={id}>{nome(id)}</option>)}</select></label><label>Cerca<input aria-label="Cerca" type="search" value={cerca} placeholder="Calciatore o club" onChange={e=>{setCerca(e.target.value);setPagina(0)}}/></label><label>Ruolo<select aria-label="Ruolo" value={ruolo} onChange={e=>{setRuolo(e.target.value);setPagina(0)}}><option value="">Tutti</option>{['P','D','C','A'].map(r=><option key={r}>{r}</option>)}</select></label><label>Disponibilità<select aria-label="Disponibilità" value={tipo} onChange={e=>{setTipo(e.target.value);setPagina(0)}}><option value="tutti">Tutti i giocatori</option><option value="svincolati">Svincolati</option><option value="assegnati">In rosa</option></select></label><label>Ordina per<select aria-label="Ordina per" value={ordine} onChange={e=>setOrdine(e.target.value)}><option value="prezzo">Quotazione</option><option value="costo">Costo d’acquisto</option><option value="fm">Fantamedia</option><option value="mv">Media voto</option><option value="presenze">Presenze</option></select></label></div><p className="ana-nota">{dati.length} risultati · {correnti?'quotazioni a stagione in corso':'quotazioni di partenza'}. Medie e presenze disponibili per {conVoti} giocatori: un dato mancante resta vuoto.</p><RendimentoGiocatori dati={dati} minPres={minPres}/><div className="ana-griglia"><Pannello wide titolo="Listone e rendimento"><div className="ana-scroll"><table><thead><tr><th>Calciatore</th><th>Ruolo</th><th>Club</th><th>Società</th><th>Costo</th><th>Valore FP</th><th>Presenze</th><th>MV</th><th>FM</th></tr></thead><tbody>{dati.slice(paginaEff*25,paginaEff*25+25).map(p=><tr key={`${p.nome}|${p.ruolo}|${p.club}`}><th>{p.calciatore?<Link to={`/giocatori/${p.calciatore}`}>{p.nome}</Link>:p.nome}</th><td>{p.ruolo}</td><td>{p.club??'—'}</td><td>{p.societa?breve(p.societa):'Svincolato'}</td>{['costo','prezzo','presenze','mv','fm'].map(k=><td key={k}>{cifra(p[k])}</td>)}</tr>)}</tbody></table>{!dati.length&&<p>Nessun calciatore corrisponde ai filtri.</p>}</div><div className="ana-pagine"><button disabled={paginaEff===0} onClick={()=>setPagina(paginaEff-1)}>Precedenti</button><span>{dati.length?paginaEff+1:0} / {Math.ceil(dati.length/25)}</span><button disabled={(paginaEff+1)*25>=dati.length} onClick={()=>setPagina(paginaEff+1)}>Successivi</button></div></Pannello><Pannello titolo="Top 11" nota="Selezione teorica dai giocatori filtrati. Le medie riguardano le presenze in Serie A, non i voti dei soli schieramenti Caprera."><div className="ana-filtri"><label>Criterio<select aria-label="Criterio Top 11" value={topMetrica} onChange={e=>setTopMetrica(e.target.value)}><option value="prezzo">Quotazione</option><option value="fm">Fantamedia</option><option value="mv">Media voto</option></select></label><label>Presenze minime<select aria-label="Presenze minime" value={minPres} onChange={e=>setMinPres(Number(e.target.value))}>{[1,3,5,10,15,20].map(n=><option key={n} value={n}>{n}</option>)}</select></label></div><label className="ana-modulo">Modulo<select aria-label="Modulo" value={modulo} onChange={e=>setModulo(e.target.value)}>{['3-4-3','3-5-2','3-6-1','4-3-3','4-4-2','4-5-1','5-3-2','5-2-3'].map(m=><option key={m}>{m}</option>)}</select></label><div className="ana-campo">{['A','C','D','P'].map(r=><div key={r}>{top.filter(p=>p.ruolo===r).map(p=><span key={p.nome}><b>{p.nome}</b><small>{cifra(p[topMetrica])}</small></span>)}</div>)}</div><p>{completo?(topMetrica==='prezzo'?`Valore totale: ${cifra(top.reduce((s,p)=>s+p.prezzo,0))}`:`Media degli undici: ${cifra(top.reduce((s,p)=>s+Number(p[topMetrica]),0)/11)}`):'I filtri non consentono di comporre undici giocatori nel modulo scelto.'}</p></Pannello><Pannello titolo="Quotazione per ruolo"><Barre titolo="Quotazioni medie" righe={['P','D','C','A'].map(r=>{const ps=dati.filter(p=>p.ruolo===r);return{id:r,nome:r,valore:ps.length?ps.reduce((s,p)=>s+p.prezzo,0)/ps.length:null}})}/></Pannello></div></>
}

function RendimentoGiocatori({dati,minPres}) {
  const disponibili=dati.filter(p=>p.fm!=null&&(p.presenze??0)>=minPres)
    .sort((a,b)=>Number(b.fm)-Number(a.fm)).slice(0,10)
  return <div className="ana-griglia ana-rendimento">
    <Pannello titolo="Migliori fantamedie" nota={`Giocatori filtrati con almeno ${minPres} presenze. Medie della stagione selezionata.`}>
      <Barre titolo="Migliori fantamedie" righe={disponibili.map(p=>({id:`${p.nome}-${p.club}`,nome:p.nome,valore:Number(p.fm)}))}/>
      {!disponibili.length&&<p className="ana-nota">Nessuna fantamedia disponibile con questi filtri.</p>}
    </Pannello>
    <Pannello titolo="Voto e fantamedia" nota="Il contributo di bonus e malus rispetto al voto. Dieci migliori fantamedie tra i giocatori filtrati.">
      <Dispersione titolo="Media voto e fantamedia" xLabel="Media voto" yLabel="Fantamedia" righe={disponibili.map((p,i)=>({id:`${p.nome}-${p.club}`,nome:p.nome,x:numero(p.mv),y:numero(p.fm),colore:colori[i%colori.length]}))}/>
    </Pannello>
  </div>
}

function Confronti({gare,squadre,societa,partite}) {
  const [prima,setPrima]=useState(societa??squadre[0]??''),[seconda,setSeconda]=useState(squadre.find(s=>s!==(societa??squadre[0]))??'')
  const scontri=gare.filter(g=>g.societa===prima&&g.avversario===seconda)
  const bilancio={vinte:scontri.filter(g=>g.punti===3).length,pari:scontri.filter(g=>g.punti===1).length,perse:scontri.filter(g=>g.punti===0).length}
  const prossima=partite.find(p=>!p.giocata&&((p.casa===prima&&p.fuori===seconda)||(p.fuori===prima&&p.casa===seconda)))
  return <><div className="ana-filtri">{[[prima,setPrima,'Prima società'],[seconda,setSeconda,'Seconda società']].map(([v,set,label])=><label key={label}>{label}<select aria-label={label} value={v} onChange={e=>set(e.target.value)}>{squadre.map(id=><option key={id} value={id}>{nome(id)}</option>)}</select></label>)}</div>{prima===seconda?<p>Scegli due società diverse.</p>:<div className="ana-griglia"><Pannello titolo={`${breve(prima)} – ${breve(seconda)}`} nota="Scontri diretti nella stagione selezionata."><div className="ana-kpi">{Object.entries(bilancio).map(([k,v])=><div key={k}><b>{v}</b><span>{k}</span></div>)}</div>{prossima&&<p>Prossimo incontro: {prossima.giornata}ª giornata, in casa di {nome(prossima.casa)}.</p>}<div className="ana-scroll"><table><thead><tr><th>Giornata</th><th>Campo</th><th>Risultato</th><th>FP</th></tr></thead><tbody>{scontri.map(g=><tr key={g.id}><td><Link to={`/partita/${g.id}`}>{g.giornata}ª</Link></td><td>{g.casa?'Casa':'Trasferta'}</td><td>{g.gf}–{g.gs}</td><td>{cifra(g.fantapunti)}</td></tr>)}</tbody></table>{!scontri.length&&<p>Nessuno scontro giocato in questa stagione.</p>}</div></Pannello><Pannello titolo="Percorso a confronto"><Linee titolo="Punti delle due società" serie={[prima,seconda].map((id,i)=>({id,nome:breve(id),colore:colori[i],punti:serieCampionato(gare,id,'punti')}))}/></Pannello></div>}</>
}

function Storico({societa}) {
  const stato=useArchivio('perpetua',classificaPerpetua)
  const ids=[...new Set((stato.dati??[]).map(r=>r.societa))]
  const [club,setClub]=useState(societa??null)
  const id=club??ids[0]
  const righe=(stato.dati??[]).filter(r=>r.societa===id).sort((a,b)=>a.stagione.localeCompare(b.stagione))
  const serie=k=>[{id,nome:nome(id),colore:colori[0],punti:righe.map((r,i)=>({x:i+1,y:numero(r[k])}))}]
  return <><div className="ana-filtri"><label>Società<select aria-label="Società" value={id??''} onChange={e=>setClub(e.target.value)}>{ids.map(s=><option key={s} value={s}>{nome(s)}</option>)}</select></label><p>Solo stagioni concluse: la stagione corrente non assegna titoli.</p></div><div className="ana-griglia"><Pannello titolo="Posizione nelle stagioni" nota={righe.map((r,i)=>`${i+1}: ${r.stagione}`).join(' · ')}><Linee titolo="Posizioni storiche" serie={serie('posizione')} asseX="Stagione" etichettaX={v=>righe[v-1]?.stagione??v} invertito/></Pannello><Pannello titolo="Punti nelle stagioni"><Linee titolo="Punti storici" serie={serie('punti')} asseX="Stagione" etichettaX={v=>righe[v-1]?.stagione??v}/></Pannello><Pannello wide titolo="Archivio delle stagioni"><div className="ana-scroll"><table><thead><tr><th>Stagione</th><th>Posizione</th><th>Punti</th><th>Giocate</th><th>V</th><th>N</th><th>P</th><th>GF</th><th>GS</th></tr></thead><tbody>{righe.map(r=><tr key={r.stagione}><th>{r.stagione}</th>{['posizione','punti','giocate','vinte','pari','perse','gol_fatti','gol_subiti'].map(k=><td key={k}>{cifra(r[k])}</td>)}</tr>)}</tbody></table></div><Link to={`/squadre/${id}`}>Apri la storia completa della società</Link></Pannello></div></>
}

export function IdentitaSocieta({id}){const t=getTeam(id);return t?<span className="ana-identita"><img src={logoUrl(t)} alt=""/>{t.name}</span>:nome(id)}
