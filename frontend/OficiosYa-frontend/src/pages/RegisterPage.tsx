import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Localidades frecuentes de Jáchal y alrededores
const JACHAL_LOCALITIES = [
  'Jáchal Centro',
  'San José de Jáchal',
  'Villa Mercedes',
  'Niquivil',
  'Huaco',
  'Pampa Vieja',
  'Gran China',
  'Tamberías',
  'Otra localidad',
]

function RegisterPage() {
  const { registerMock } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [department, setDepartment] = useState('Jáchal')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [wantsToBeProvider, setWantsToBeProvider] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isPasswordLongEnough = password.length >= 8
  const doPasswordsMatch =
    confirmPassword.length > 0 && password === confirmPassword

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (firstName.trim().length < 2) {
      setError('Ingresá un nombre de al menos 2 caracteres.')
      return
    }

    if (lastName.trim().length < 2) {
      setError('Ingresá un apellido de al menos 2 caracteres.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Ingresá un correo electrónico válido.')
      return
    }

    if (phone.trim().length < 6) {
      setError('Ingresá un teléfono de al menos 6 caracteres.')
      return
    }

    if (!department.trim()) {
      setError('Ingresá tu departamento o localidad.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setIsSubmitting(true)

    try {
      const newUser = await registerMock({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        department: department.trim(),
        password,
      })

      if (!newUser) {
        setError('No se pudo crear la cuenta.')
        return
      }

      if (wantsToBeProvider) {
        navigate('/registro-trabajador')
      } else {
        navigate('/mi-perfil')
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar el registro. Intentá nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="register-page">
      <div className="register-container">
        <div className="register-layout">
          {/* Columna Izquierda: Presentación y beneficios */}
          <section className="register-hero" aria-label="Beneficios de OficiosYa">
            <div>
              <div className="register-hero-badge">
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
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>Comunidad Jáchal · San Juan</span>
              </div>

              <h1 className="register-hero-title">
                Conectamos vecinos con los mejores trabajadores locales
              </h1>

              <p className="register-hero-description">
                Creá tu cuenta gratis. Encontrá especialistas de confianza para
                resolver arreglos en tu hogar o empezá a ofrecer tus servicios
                en la comunidad.
              </p>
            </div>

            <div className="register-features">
              <div className="register-feature-card">
                <div className="register-feature-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h2 className="register-feature-title">
                    Contacto directo por WhatsApp o llamada
                  </h2>
                  <p className="register-feature-desc">
                    Hablá directamente con el profesional sin intermediarios ni
                    comisiones sorpresa.
                  </p>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <div>
                  <h2 className="register-feature-title">
                    Perfiles reales y detallados
                  </h2>
                  <p className="register-feature-desc">
                    Conocé la trayectoria, especialidades y fotos de trabajos anteriores
                    de trabajadores de tu zona.
                  </p>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon" aria-hidden="true">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <h2 className="register-feature-title">
                    100% Comunidad de Jáchal
                  </h2>
                  <p className="register-feature-desc">
                    Profesionales cerca de vos: Jáchal Centro, Niquivil, Huaco,
                    Villa Mercedes y alrededores.
                  </p>
                </div>
              </div>
            </div>

            <div className="register-trust-card">
              <div className="register-trust-stars" aria-label="5 de 5 estrellas">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                    aria-hidden="true"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="register-trust-quote">
                &ldquo;Pude contactar a un plomero para un arreglo urgente en menos
                de 15 minutos. Una herramienta indispensable para Jáchal.&rdquo;
              </p>
              <p className="register-trust-author">
                — Laura G., vecina de Jáchal Centro
              </p>
            </div>
          </section>

          {/* Columna Derecha: Tarjeta de Registro */}
          <section
            className="register-card"
            aria-labelledby="register-card-title"
          >
            <div className="register-card-header">
              <h2 id="register-card-title">Crear cuenta</h2>
              <p>Completá tus datos para sumarte a OficiosYa.</p>
            </div>

            <form
              className="register-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Nombre y Apellido en 2 columnas */}
              <div className="register-form-row">
                <div className="register-field">
                  <label htmlFor="firstName">Nombre</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon" aria-hidden="true">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Ej. Juan"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={80}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="lastName">Apellido</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon" aria-hidden="true">
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
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Ej. Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      minLength={2}
                      maxLength={80}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="register-field">
                <label htmlFor="email">Correo electrónico</label>
                <div className="register-input-wrapper">
                  <span className="register-input-icon" aria-hidden="true">
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
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    maxLength={254}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Teléfono y Departamento */}
              <div className="register-form-row">
                <div className="register-field">
                  <label htmlFor="phone">Teléfono / WhatsApp</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon" aria-hidden="true">
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
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="Ej. 264 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      minLength={6}
                      maxLength={30}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="department">Localidad / Zona</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon" aria-hidden="true">
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
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      list="departments-list"
                      placeholder="Ej. Jáchal Centro"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    <datalist id="departments-list">
                      {JACHAL_LOCALITIES.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </div>
                </div>
              </div>

              {/* Contraseñas en 2 columnas */}
              <div className="register-form-row">
                <div className="register-field">
                  <label htmlFor="password">Contraseña</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon" aria-hidden="true">
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
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="register-field">
                  <label htmlFor="confirmPassword">Confirmar contraseña</label>
                  <div className="register-input-wrapper">
                    <span className="register-input-icon" aria-hidden="true">
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
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Repetí la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="register-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar contraseña'
                          : 'Mostrar contraseña'
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                          <line x1="2" x2="22" y1="2" y2="22" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Indicadores en vivo de contraseña */}
              {(password.length > 0 || confirmPassword.length > 0) && (
                <div
                  className="register-password-status"
                  aria-live="polite"
                >
                  <span
                    className={`register-status-badge ${
                      isPasswordLongEnough
                        ? 'register-status-badge--success'
                        : ''
                    }`}
                  >
                    {isPasswordLongEnough ? '✓' : '•'} Mínimo 8 caracteres
                  </span>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`register-status-badge ${
                        doPasswordsMatch
                          ? 'register-status-badge--success'
                          : ''
                      }`}
                    >
                      {doPasswordsMatch
                        ? '✓ Las contraseñas coinciden'
                        : '• Las contraseñas deben coincidir'}
                    </span>
                  )}
                </div>
              )}

              {/* Opción Interactiva: Ofrecer servicios como trabajador */}
              <div className="register-provider-option">
                <div
                  className={`register-provider-card ${
                    wantsToBeProvider ? 'register-provider-card--active' : ''
                  }`}
                  onClick={() =>
                    !isSubmitting && setWantsToBeProvider(!wantsToBeProvider)
                  }
                  role="checkbox"
                  aria-checked={wantsToBeProvider}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault()
                      if (!isSubmitting) setWantsToBeProvider(!wantsToBeProvider)
                    }
                  }}
                >
                  <div className="register-provider-info">
                    <div className="register-provider-icon" aria-hidden="true">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="20"
                          height="14"
                          x="2"
                          y="7"
                          rx="2"
                          ry="2"
                        />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className="register-provider-text">
                      <span className="register-provider-title">
                        ¿Querés ofrecer tus servicios como trabajador?
                      </span>
                      <span className="register-provider-subtitle">
                        Activá esta opción para crear tu perfil laboral y conseguir
                        nuevos clientes en Jáchal.
                      </span>
                    </div>
                  </div>

                  <div className="register-toggle-switch" aria-hidden="true">
                    <div className="register-toggle-thumb" />
                  </div>

                  {/* Input oculto para accesibilidad */}
                  <input
                    type="checkbox"
                    checked={wantsToBeProvider}
                    onChange={(e) => setWantsToBeProvider(e.target.checked)}
                    disabled={isSubmitting}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="register-error" role="alert">
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" x2="12" y1="8" y2="12" />
                    <line x1="12" x2="12.01" y1="16" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Botón de envío */}
              <button
                className="button button-primary register-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="register-spinner" aria-hidden="true" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Crear cuenta</span>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="5" x2="19" y1="12" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <p className="register-login-link">
              ¿Ya tenés una cuenta?
              <Link to="/login">Iniciá sesión</Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage