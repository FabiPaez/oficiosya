import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logoutMock } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleLogout() {
    closeMenu()
    logoutMock()
    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link
          to="/"
          className="navbar-brand"
          onClick={closeMenu}
        >
          OficiosYa
        </Link>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="navbar-menu"
          className={`navbar-nav${menuOpen ? ' is-open' : ''}`}
          aria-label="Navegación principal"
        >
          <Link to="/buscar" onClick={closeMenu}>
            Buscar
          </Link>

          <Link to="/categorias" onClick={closeMenu}>
            Categorías
          </Link>

          {!isAuthenticated && (
            <>
              <Link to="/registro" onClick={closeMenu}>
                Registrarme
              </Link>

              <Link to="/login" onClick={closeMenu}>
                Iniciar sesión
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to="/mi-perfil" onClick={closeMenu}>
                Mi perfil
              </Link>

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