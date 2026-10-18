import AnalisiLega from '../components/AnalisiLega'
import './Statistiche.css'

export default function Statistiche(){
  return <div className="page container wide statistiche-native"><header className="page-head"><p className="eyebrow">Federazione Caprera</p><h1>Statistiche della lega</h1><p className="lede">Il campionato, le rose e i giocatori. Scegli la stagione, confronta le società e segui ogni giornata.</p></header><AnalisiLega/><p className="note">Dati dall’archivio Caprera e dagli aggiornamenti Fantapazz pubblicati nella <a href="https://caprera.shinyapps.io/caprera/" target="_blank" rel="noreferrer">dashboard della lega</a>. Le informazioni non disponibili restano indicate come tali.</p></div>
}
