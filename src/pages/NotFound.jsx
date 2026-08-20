import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="page container">
      <header className="page-head">
        <p className="eyebrow">Errore 404</p>
        <h1>Pagina non trovata</h1>
        <p className="lede">
          Questa pagina non risulta agli atti della Presidenza Tricolore.
        </p>
      </header>
      <Link to="/" className="btn btn-primary">Torna alla home</Link>
    </div>
  )
}
