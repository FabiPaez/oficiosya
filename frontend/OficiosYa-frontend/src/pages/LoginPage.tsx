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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setEmail(event.target.value)

    if (error) {
      setError('')
    }
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

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(normalizedEmail)) {
      setError(
        'Ingresá un correo electrónico válido.',
      )
      return
    }

    setLoading(true)

    try {
      const user =
        await authService.login(normalizedEmail)

      if (!user) {
        setError(
          'No encontramos una cuenta activa con ese correo electrónico.',
        )
        return
      }

      loginMock(user)
      navigate('/')
    } catch {
      setError(
        'Ocurrió un error al iniciar sesión. Intentá nuevamente.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="container">
        <section className="form-page">
          <div className="form-page-header">
            <span className="badge badge-premium">
              OficiosYa
            </span>

            <h1>Iniciar sesión</h1>

            <p>
              Ingresá con tu correo electrónico para
              acceder a tu cuenta.
            </p>
          </div>

          <form
            className="form-card"
            onSubmit={handleSubmit}
            noValidate
          >
            {error && (
              <div
                className="state state-error"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email">
                Correo electrónico
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={loading}
                aria-invalid={Boolean(error)}
                aria-describedby={
                  error
                    ? 'login-email-error'
                    : undefined
                }
                required
              />

              {error && (
                <span
                  id="login-email-error"
                  className="form-error"
                >
                  {error}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="button button-primary"
              disabled={loading}
            >
              {loading
                ? 'Ingresando...'
                : 'Iniciar sesión'}
            </button>

            <div className="form-page-footer">
              <p>
                ¿Todavía no tenés una cuenta?{' '}
                <Link to="/registro">
                  Registrarme
                </Link>
              </p>
            </div>
          </form>

          <div className="state state-empty">
            <strong>Acceso de prueba</strong>

            <p>
              Durante esta etapa del desarrollo, podés
              utilizar cualquiera de los correos de los
              usuarios mock.
            </p>

            <p>
              Por ejemplo:{' '}
              <strong>
                carlos.perez@example.com o juan.sanchez@example.com
              </strong>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage