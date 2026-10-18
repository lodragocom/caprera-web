import { useAuth } from '../../lib/auth'
import { getTeam } from '../../lib/core'
import AnalisiLega from '../../components/AnalisiLega'
export default function Analisi(){const {sessione}=useAuth();return <><header><p className="eyebrow">{getTeam(sessione.team)?.name}</p><h1>Analisi della lega</h1></header><AnalisiLega societa={sessione.team} privato/></>}
