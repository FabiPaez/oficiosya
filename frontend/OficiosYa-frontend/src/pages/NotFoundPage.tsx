import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="page-section">
      <div className="container">
        <div className="state state-empty" style={{ maxWidth: '600px', margin: '40px auto' }}>
          <span className="badge badge-premium" style={{ marginBottom: '16px' }}>Error 404</span>
          <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>Página no encontrada</h1>
          <p style={{ marginBottom: '24px' }}>
            La página que buscás no existe o fue movida.
          </p>
          <Link to="/" className="button button-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
