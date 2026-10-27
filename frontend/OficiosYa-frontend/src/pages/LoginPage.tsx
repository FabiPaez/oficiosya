import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

function LoginPage() {
  const navigate = useNavigate()
  const { loginMock } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setEmail(event.target.value)
    if (error) setError('')
  }

  function handlePasswordChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setPassword(event.target.value)
    if (error) setError('')
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (loading) return

    setError('')

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Ingresá tu correo electrónico.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(normalizedEmail)) {
      setError('Ingresá un correo electrónico válido.')
      return
    }

    if (!password) {
      setError('Ingresá tu contraseña.')
      return
    }

    setLoading(true)

    try {
      const user = await authService.login(
        normalizedEmail,
        password,
      )

      loginMock(user)
      navigate('/')
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al iniciar sesión. Intentá nuevamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-layout">
          {/* Columna Izquierda: Información de Bienvenida */}
          <section className="login-hero" aria-label="Información de acceso">
            <div>
              <div className="login-hero-badge">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Plataforma Segura · Comunidad Jáchal</span>
              </div>

              <h1 className="login-hero-title">
                Bienvenido de nuevo a OficiosYa
              </h1>

              <p className="login-hero-description">
                Conectate con los mejores trabajadores locales, gestioná tus
                solicitudes de trabajo o administrá tus servicios profesionales en un solo lugar.
              </p>
            </div>

            <div className="login-features">
              <div className="login-feature-card">
                <div className="login-feature-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="login-feature-title">
                    Contacto directo y rápido
                  </h2>
                  <p className="login-feature-desc">
                    Comunicate al instante por WhatsApp o llamada directa sin intermediarios.
                  </p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div>
                  <h2 className="login-feature-title">
                    Información transparente
                  </h2>
                  <p className="login-feature-desc">
                    Revisá la experiencia, especialidad y zonas de cobertura de cada profesional.
                  </p>
                </div>
              </div>

              <div className="login-feature-card">
                <div className="login-feature-icon" aria-hidden="true">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h2 className="login-feature-title">
                    Panel de prestador
                  </h2>
                  <p className="login-feature-desc">
                    Si ofrecés un oficio, gestioná tus servicios, datos de contacto y disponibilidad.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Columna Derecha: Tarjeta de Formulario */}
          <section className="login-card" aria-label="Formulario de inicio de sesión">
            <div className="login-card-header">
              <h1>Iniciar sesión</h1>
              <p>
                Ingresá tus credenciales para acceder a tu cuenta.
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {error && (
                <div
                  className="login-error-alert"
                  role="alert"
                  aria-live="polite"
                >
                  <span className="login-error-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </span>
                  <span>{error}</span>
                </div>
              )}

              <div className="login-field">
                <label className="login-label" htmlFor="login-email">
                  Correo electrónico
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    className="login-input"
                    placeholder="tunombre@ejemplo.com"
                    value={email}
                    onChange={handleEmailChange}
                    autoComplete="email"
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="login-password">
                  Contraseña
                </label>
                <div className="login-input-wrapper">
                  <span className="login-input-icon" aria-hidden="true">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="login-input login-input--password"
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    tabIndex={0}
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" aria-hidden="true" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </button>

              <div className="login-card-footer">
                <p>
                  ¿Todavía no tenés una cuenta?{' '}
                  <Link to="/registro" className="login-link">
                    Registrate gratis
                  </Link>
                </p>

                <div className="login-provider-cta">
                  <span>¿Ofrecés un oficio o servicio?</span>
                  <Link to="/registro-trabajador">Registrate como prestador</Link>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
