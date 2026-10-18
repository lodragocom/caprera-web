import { useAuth } from '../lib/auth'
import { Link } from 'react-router-dom'
import { useArchivio, partite, listone, laMiaConsegna } from '../lib/archivio'
import { getTeam, logoUrl } from '../lib/core'
import { cifra } from '../lib/analisi'
import AnalisiLega from './AnalisiLega'
import './CruscottoMister.css'

export default function CruscottoMister({d}) {
  const {inVisita}=useAuth()
  const stato=useArchivio(['partite',d.stagioneRosa,'campionato'],()=>partite(d.stagioneRosa),[d.stagioneRosa])
  const quotazioni=useArchivio(['listone',d.stagioneRosa],()=>listone(d.stagioneRosa),[d.stagioneRosa])
  const consegna=useArchivio(['pan-consegna',d.team.id,inVisita],()=>inVisita?Promise.resolve(null):laMiaConsegna(),[d.team.id,inVisita])
  const partiteSquadra=(stato.dati??[]).filter(p=>p.casa===d.team.id||p.fuori===d.team.id)
  const prossima=partiteSquadra.find(p=>!p.giocata)
  const avversario=prossima?getTeam(prossima.casa===d.team.id?prossima.fuori:prossima.casa):null
  const quote=quotazioni.dati?.fine?.length?quotazioni.dati.fine:quotazioni.dati?.righe??[]
  const valori=d.rosa.map(p=>quote.find(q=>q.nome===p.player&&q.ruolo===p.role&&(q.club??'')===(p.club??''))?.prezzo)
  const valore=valori.length&&valori.every(v=>v!=null)?valori.reduce((s,v)=>s+Number(v),0):null
  const turno=consegna.dati?.turno
  const formazione=consegna.dati?.consegna??consegna.dati?.bozza
  const scadenza=turno?.scadenza?new Date(turno.scadenza).toLocaleString('it-IT',{timeZone:'Europe/Rome',dateStyle:'short',timeStyle:'short'}):null
  const mia=d.classifica.find(r=>r.societa===d.team.id)
  const ultima=Math.max(0,...partiteSquadra.filter(p=>p.giocata).map(p=>p.giornata))
  const migliori=d.rosa.filter(p=>p.fm!=null&&(p.apps??0)>=3).sort((a,b)=>b.fm-a.fm).slice(0,5)
  if(d.caricamento)return <p role="status">Carico la panoramica della stagione…</p>
  return <div className="pan-viva">
    <section className="pan-prossima" aria-label="Prossima partita e formazione">
      <div className="pan-turno"><span>{prossima?`${prossima.giornata}ª giornata`:'Campionato'} · {d.stagioneRosa}</span><p>{ultima?`Risultati aggiornati alla ${ultima}ª giornata`:'In attesa della prima giornata'}</p></div>
      <div className="pan-sfida"><div><img src={logoUrl(d.team)} alt=""/><strong>{d.team.name}</strong></div><span className="pan-vs">vs</span><div>{avversario&&<img src={logoUrl(avversario)} alt=""/>}<strong>{avversario?.name??'Avversario da definire'}</strong></div></div>
      <p className="pan-luogo">{prossima?(prossima.casa===d.team.id?'Giochi in casa':`In casa di ${avversario?.name??'avversario'}`):'Nessun incontro futuro registrato'}</p>
      <div className="pan-consegna"><div><strong>{consegna.dati?.consegna?'Formazione consegnata':formazione?'Bozza salvata':'Prepara la formazione'}</strong><p>{inVisita?'Stai consultando un’altra società.':scadenza?`Scadenza: ${scadenza} (ora italiana)`:'Consegna ufficiale in attesa dell’orario del turno. Puoi salvare una bozza.'}</p>{formazione&&<small>{formazione.modulo} · {formazione.titolari?.length??0} titolari · {formazione.panchina?.length??0} riserve</small>}{consegna.errore&&<p role="alert">Stato della formazione non disponibile: apri Schiera formazione per riprovare.</p>}</div><Link className="pan-schiera" to="/area/schiera">{consegna.dati?.consegna?'Rivedi formazione':formazione?'Modifica bozza':'Schiera formazione'}</Link></div>
    </section>
    <div className="pan-stagione-kpi">{[['Posizione',mia?`${mia.posizione}ª`:null],['Punti',mia?.punti],['Fantapunti',mia?.fantapunti],['Valore rosa',valore],['Costo rosa',d.rosa.reduce((s,p)=>s+(p.cost??0),0)]].map(([label,v])=><div key={label}><span>{label}</span><b>{typeof v==='string'?v:cifra(v)}</b></div>)}</div>
    <nav className="pan-scorciatoie" aria-label="Gestisci la società"><Link to="/area/rosa">La mia rosa <span>{d.rosa.length} giocatori</span></Link><Link to="/area/crediti">Crediti <span>{d.finanze?.left==null?'Saldo da verificare':`${d.finanze.left} disponibili`}</span></Link><Link to="/area/analisi">Analisi della lega <span>Grafici, confronti e svincolati</span></Link><Link to="/risultati">Calendario <span>Risultati e prossimi incontri</span></Link></nav>
    <section className="pan-rendimento"><div><h2>Chi sta rendendo di più</h2><p>Fantamedia in Serie A · {d.stagioneRosa} · almeno 3 presenze</p></div>{migliori.length?<ol>{migliori.map(p=><li key={p.player}><span className={`badge role-${p.role}`}>{p.role}</span><span>{p.player}<small>{p.apps} presenze</small></span><b>{cifra(p.fm)}</b></li>)}</ol>:<p>Le medie attuali non sono ancora disponibili.</p>}<Link to="/area/analisi">Confronta i giocatori</Link></section>
    <div className="pan-analisi-titolo"><h2>La stagione, giornata per giornata</h2><Link to="/area/analisi">Tutte le analisi</Link></div>
    <AnalisiLega key={d.stagioneRosa} societa={d.team.id} stagioneIniziale={d.stagioneRosa} soloCampionato/>
  </div>
}
