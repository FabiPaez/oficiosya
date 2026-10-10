import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logoutMock } = useAuth()

  function handleLogout() {
    logoutMock()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          OficiosYa
        </Link>

        <nav
          className="navbar-nav"
          aria-label="Navegación principal"
        >
          <Link to="/buscar">Buscar</Link>

          <Link to="/categorias">Categorías</Link>

          {!isAuthenticated && (
            <>
              <Link to="/registro">Registrarme</Link>

              <Link to="/login">Iniciar sesión</Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to="/mi-perfil">Mi perfil</Link>

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar