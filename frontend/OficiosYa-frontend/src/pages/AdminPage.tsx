import { Link } from 'react-router-dom'

function AdminPage() {
  return (
    <div className="page-section">
      <div className="container">
        <header className="page-heading">
          <span className="section-eyebrow">Panel de Control</span>
          <h1>Administración</h1>
          <p>
            Gestión y supervisión general de la plataforma OficiosYa.
          </p>
        </header>

        <div className="state state-info">
          <h3>Módulo en desarrollo</h3>
          <p>
            Las herramientas de gestión de categorías, moderación de reportes y supervisión
            de usuarios estarán disponibles en esta sección.
          </p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/" className="button button-outline">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage
