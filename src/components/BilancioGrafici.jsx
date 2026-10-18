import { Linee, Barre } from './GraficiLega'
import './AnalisiLega.css'

/** Riceve soltanto i bilanci già autorizzati dal database per questa società. */
export default function BilancioGrafici({bilanci,stagione}) {
  const anni=[...bilanci.keys()].sort()
  const attuale=bilanci.get(stagione)
  const serie=[['iniziali','Budget iniziale','#d9b46a'],['spesi','Crediti spesi','#65b9e8'],['residui','Residui a registro','#75cda0']].map(([k,nome,colore])=>({id:k,nome,colore,punti:anni.map((s,i)=>({x:i+1,y:bilanci.get(s)[k]==null?null:Number(bilanci.get(s)[k])}))}))
  const voci=attuale?[['base','Dote'],['riportati','Riporto'],['bonus','Premi e penalità'],['ffp','Fair Play finanziario'],['giovani','Giovani'],['assicurazione','Assicurazione']].map(([k,nome])=>({id:k,nome,valore:attuale[k]==null?null:Number(attuale[k])})):[]
  return <div className="analisi-lega ana-griglia" style={{margin:'24px 0'}}><section className="ana-pannello"><h2>Crediti nel tempo</h2><p className="ana-nota">{anni.map((s,i)=>`${i+1}: ${s}`).join(' · ')}. I saldi assenti restano vuoti.</p><Linee titolo="Budget, spesa e risparmi nelle stagioni" serie={serie} asseX="Stagione" etichettaX={v=>anni[v-1]??v}/></section><section className="ana-pannello"><h2>Composizione del budget {stagione}</h2><p className="ana-nota">Premi, riporti e altre voci del bilancio della società.</p><Barre titolo="Composizione del budget" righe={voci}/></section></div>
}
