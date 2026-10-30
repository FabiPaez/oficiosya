import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useEffect, useState } from 'react'
import { workerService } from '../services/workerService'
import type { Worker } from '../types/worker'

function ProfilePage() {
  const { user } = useAuth()
  const [worker, setWorker] = useState<Worker | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadWorker() {
      if (!user) {
        setWorker(null)
        return
      }

      try {
        const workers = await workerService.getAll()
        const currentWorker = workers.find(
          (item) => item.userId === user.id,
        )

        if (!cancelled) {
          setWorker(currentWorker ?? null)
        }
      } catch {
        if (!cancelled) {
          setWorker(null)
        }
      }
    }

    void loadWorker()

    return () => {
      cancelled = true
    }
  }, [user])

  if (!user) {
    return (
      <div className="page-section">
        <div className="container">
          <div className="state state-empty">
            <h1>Mi perfil</h1>
            <p>Iniciá sesión para consultar tu perfil.</p>
            <Link to="/login" className="button button-primary">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    )
  }

  const fullName =
    `${user.firstName} ${user.lastName}`.trim()

  const userRoles = user.roles?.length
    ? user.roles
    : [user.role]

  const isAdmin = userRoles.includes('ADMIN')
  const isClient = userRoles.includes('CLIENT')
  const isProvider = userRoles.includes('PROVIDER')

  let accountType = 'Cliente'

  if (isAdmin) {
    accountType = 'Administrador'
  } else if (isClient && isProvider) {
    accountType = 'Cliente y trabajador'
  } else if (isProvider) {
    accountType = 'Trabajador'
  }

  return (
    <div className="page-section">
      <div className="container">
        <section className="profile-page">
          <header className="profile-page__header">
            <h1>Mi perfil</h1>
            <p>
              Consultá tus datos personales y accedé a
              las opciones de tu cuenta.
            </p>
          </header>

          <section
            className="profile-card"
            aria-labelledby="profile-personal-data"
          >
            <h2 id="profile-personal-data">
              Datos personales
            </h2>

            <dl className="profile-details">
              <div>
                <dt>Nombre y apellido</dt>
                <dd>{fullName || 'Sin informar'}</dd>
              </div>

              <div>
                <dt>Correo electrónico</dt>
                <dd>{user.email || 'Sin informar'}</dd>
              </div>

              <div>
                <dt>Teléfono</dt>
                <dd>{user.phone || 'Sin informar'}</dd>
              </div>

              <div>
                <dt>Localidad</dt>
                <dd>{user.department || 'Sin informar'}</dd>
              </div>

              <div>
                <dt>Tipo de cuenta</dt>
                <dd>{accountType}</dd>
              </div>
            </dl>
          </section>

          {isProvider && (
            <section
              className="profile-card"
              aria-labelledby="profile-professional-data"
            >
              <h2 id="profile-professional-data">
                Datos profesionales
              </h2>

              {worker ? (
                <dl className="profile-details">
                  <div>
                    <dt>Descripción de los servicios</dt>
                    <dd>
                      {worker.description.trim() || 'Sin descripción'}
                    </dd>
                  </div>

                  <div>
                    <dt>Categorías</dt>
                    <dd>
                      {worker.categoryNames?.join(', ') ||
                        worker.categories.join(', ') ||
                        'Sin categorías'}
                    </dd>
                  </div>

                  <div>
                    <dt>Teléfono profesional</dt>
                    <dd>{worker.phone || 'Sin informar'}</dd>
                  </div>

                  <div>
                    <dt>WhatsApp</dt>
                    <dd>{worker.whatsapp || 'Sin informar'}</dd>
                  </div>

                  <div>
                    <dt>Departamento</dt>
                    <dd>{worker.department || 'Sin informar'}</dd>
                  </div>

                  <div>
                    <dt>Zonas de trabajo</dt>
                    <dd>{worker.zones.join(', ') || 'Sin informar'}</dd>
                  </div>

                  <div>
                    <dt>Cobertura</dt>
                    <dd>{worker.coverage || 'Sin informar'}</dd>
                  </div>

                  <div>
                    <dt>Experiencia</dt>
                    <dd>
                      {worker.experienceYears == null
                        ? 'Sin informar'
                        : worker.experienceYears === '+40'
                          ? '+40 años'
                          : `${worker.experienceYears} años`}
                    </dd>
                  </div>

                  <div>
                    <dt>Horario de atención</dt>
                    <dd>{worker.schedule || 'Sin informar'}</dd>
                  </div>

                  <div>
                    <dt>Días disponibles</dt>
                    <dd>
                      {worker.availableDays.join(', ') || 'Sin informar'}
                    </dd>
                  </div>
                </dl>
              ) : (
                <p>
                  No encontramos un perfil profesional asociado a tu cuenta.
                </p>
              )}
            </section>
          )}

          <nav
            className="profile-actions"
            aria-label="Opciones de mi cuenta"
          >
            <Link
              className="profile-action"
              to="/buscar"
            >
              <h2>Buscar trabajadores</h2>
              <p>
                Encontrá profesionales para tus necesidades.
              </p>
            </Link>

            <Link
              className="profile-action"
              to="/favoritos"
            >
              <h2>Mis favoritos</h2>
              <p>
                Consultá los trabajadores que guardaste para
                encontrarlos fácilmente.
              </p>
            </Link>

            {isProvider && (
              <Link
                className="profile-action"
                to="/editar-perfil-trabajador"
              >
                <h2>Editar perfil profesional</h2>
                <p>
                  Actualizá tu presentación, categorías, experiencia,
                  datos de contacto y cobertura de tus servicios.
                </p>
              </Link>
            )}

            {isAdmin && (
              <Link
                className="profile-action"
                to="/admin"
                style={{
                  borderLeft: '4px solid var(--color-primary)',
                }}
              >
                <h2>Panel de administración</h2>
                <p>
                  Gestioná a todos los prestadores de la plataforma,
                  inspeccioná perfiles y eliminá o suspendé cuentas.
                </p>
              </Link>
            )}

            {isClient && !isProvider && !isAdmin && (
              <Link
                className="profile-action"
                to="/registro-trabajador"
              >
                <h2>Ofrecer mis servicios</h2>
                <p>
                  Registrate como trabajador para publicar
                  tus servicios en OficiosYa.
                </p>
              </Link>
            )}
          </nav>
        </section>
      </div>
    </div>
  )
}

export default ProfilePage
