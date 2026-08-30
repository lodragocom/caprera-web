import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Consenso from './components/Consenso'
import Layout from './components/Layout'
import { AuthProvider } from './lib/auth'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Rotte lazy: calendario e rose pesano ~560 KB di JSON e non devono
// entrare nel bundle iniziale.
const Classifica = lazy(() => import('./pages/Classifica'))
const Risultati = lazy(() => import('./pages/Risultati'))
const Squadre = lazy(() => import('./pages/Squadre'))
const SquadraDetail = lazy(() => import('./pages/SquadraDetail'))
const Rose = lazy(() => import('./pages/Rose'))
const Contratti = lazy(() => import('./pages/Contratti'))
const AlboOro = lazy(() => import('./pages/AlboOro'))
const Giocatori = lazy(() => import('./pages/Giocatori'))
const SchedaGiocatore = lazy(() => import('./pages/SchedaGiocatore'))
const Partita = lazy(() => import('./pages/Partita'))
const Stats = lazy(() => import('./pages/Stats'))
const Asta = lazy(() => import('./pages/Asta'))
const Ranking = lazy(() => import('./pages/Ranking'))
const Coppe = lazy(() => import('./pages/Coppe'))
const Regolamento = lazy(() => import('./pages/Regolamento'))
const Assicurazioni = lazy(() => import('./pages/Assicurazioni'))
const Login = lazy(() => import('./pages/Login'))
const AreaLayout = lazy(() => import('./components/AreaLayout'))
const AreaSezioni = () => import('./pages/area/sezioni')
const Panoramica = lazy(() => AreaSezioni().then((m) => ({ default: m.Panoramica })))
const AreaRosa = lazy(() => AreaSezioni().then((m) => ({ default: m.Rosa })))
const AreaContratti = lazy(() => AreaSezioni().then((m) => ({ default: m.Contratti })))
const AreaCrediti = lazy(() => AreaSezioni().then((m) => ({ default: m.Crediti })))
const AreaStoria = lazy(() => AreaSezioni().then((m) => ({ default: m.Storia })))
const AreaCoppe = lazy(() => AreaSezioni().then((m) => ({ default: m.Coppe })))
const AreaFormazioni = lazy(() => import('./pages/area/Formazioni'))
const AreaTessera = lazy(() => import('./pages/area/Tessera'))
const AreaFederazione = lazy(() => import('./pages/area/Federazione'))
const AreaAtti = lazy(() => import('./pages/area/Atti'))
const AreaClausole = lazy(() => import('./pages/area/Clausole'))
const AreaStagione = lazy(() => import('./pages/area/Stagione'))
const AreaDiario = lazy(() => import('./pages/area/Diario'))
const Statistiche = lazy(() => import('./pages/Statistiche'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Termini = lazy(() => import('./pages/Termini'))

/** Riporta in cima ad ogni cambio di rotta. */
function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PageLoader() {
  return (
    <div className="page container">
      <p className="empty">Caricamento…</p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ScrollTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="classifica" element={<Classifica />} />
            <Route path="risultati" element={<Risultati />} />
            <Route path="squadre" element={<Squadre />} />
            <Route path="squadre/:id" element={<SquadraDetail />} />
            <Route path="rose" element={<Rose />} />
            <Route path="contratti" element={<Contratti />} />
            <Route path="albo-doro" element={<AlboOro />} />
            <Route path="giocatori" element={<Giocatori />} />
            <Route path="giocatori/:id" element={<SchedaGiocatore />} />
            <Route path="partita/:id" element={<Partita />} />
            <Route path="stats" element={<Stats />} />
            <Route path="asta" element={<Asta />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="coppe" element={<Coppe />} />
            <Route path="regolamento" element={<Regolamento />} />
            <Route path="assicurazioni" element={<Assicurazioni />} />
            <Route path="login" element={<Login />} />
            <Route path="statistiche" element={<Statistiche />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="termini" element={<Termini />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Dashboard privata: guscio proprio, fuori dal sito pubblico */}
          <Route path="/area" element={<AreaLayout />}>
            <Route index element={<Panoramica />} />
            <Route path="rosa" element={<AreaRosa />} />
            <Route path="formazioni" element={<AreaFormazioni />} />
            <Route path="contratti" element={<AreaContratti />} />
            <Route path="crediti" element={<AreaCrediti />} />
            <Route path="coppe" element={<AreaCoppe />} />
            <Route path="storia" element={<AreaStoria />} />
            <Route path="tessera" element={<AreaTessera />} />
            <Route path="federazione" element={<AreaFederazione />} />
            <Route path="atti" element={<AreaAtti />} />
            <Route path="clausole" element={<AreaClausole />} />
            <Route path="stagione" element={<AreaStagione />} />
            <Route path="diario" element={<AreaDiario />} />
          </Route>
        </Routes>
      </Suspense>
      {/* Fuori dalle rotte: la scelta sui cookie riguarda il sito, non una
          pagina, e chi arriva su un indirizzo profondo la deve trovare uguale. */}
      <Consenso />
      </BrowserRouter>
    </AuthProvider>
  )
}
