import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
const [isSubmitting, setIsSubmitting] = useState(false)
const [error, setError] = useState('')

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
} catch (error: unknown) {
  setError(
    error instanceof Error
      ? error.message
      : 'No se pudo completar el registro. Intentá nuevamente.',
  )
} finally {
  setIsSubmitting(false)
}

}

return ( <main className="container register-page"> <section
     className="register-card"
     aria-labelledby="register-title"
   > <h1 id="register-title">Crear cuenta</h1>

    <p className="register-description">
      Registrate en OficiosYa para encontrar y contactar
      trabajadores de tu zona.
    </p>

    <form className="register-form" onSubmit={handleSubmit}>
      <div className="register-field">
        <label htmlFor="firstName">Nombre</label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
          minLength={2}
          maxLength={80}
          disabled={isSubmitting}
        />
      </div>

      <div className="register-field">
        <label htmlFor="lastName">Apellido</label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
          minLength={2}
          maxLength={80}
          disabled={isSubmitting}
        />
      </div>

      <div className="register-field">
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={254}
          disabled={isSubmitting}
        />
      </div>

      <div className="register-field">
        <label htmlFor="phone">Teléfono</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
          minLength={6}
          maxLength={30}
          disabled={isSubmitting}
        />
      </div>

      <div className="register-field">
        <label htmlFor="department">
          Departamento o localidad
        </label>
        <input
          id="department"
          name="department"
          type="text"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          required
          maxLength={100}
          disabled={isSubmitting}
        />
      </div>

      <div className="register-field">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
          disabled={isSubmitting}
        />
        <small>Debe tener al menos 8 caracteres.</small>
      </div>

      <div className="register-field">
        <label htmlFor="confirmPassword">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          required
          minLength={8}
          disabled={isSubmitting}
        />
      </div>

      <div className="register-provider-option">
        <label className="register-checkbox-label">
          <input
            type="checkbox"
            checked={wantsToBeProvider}
            onChange={(event) =>
              setWantsToBeProvider(event.target.checked)
            }
            disabled={isSubmitting}
          />
          <span>
            <strong>
              ¿Sos trabajador y querés ofrecer tus servicios?
            </strong>
            <span className="register-checkbox-description">
              Después de crear tu cuenta, podrás completar
              tu perfil de trabajador.
            </span>
          </span>
        </label>
      </div>

      {error && (
        <p className="register-error" role="alert">
          {error}
        </p>
      )}

      <button
        className="button button-primary register-submit"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
    </form>

    <p className="register-login-link">
      ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
    </p>
  </section>
</main>

)
}

export default RegisterPage