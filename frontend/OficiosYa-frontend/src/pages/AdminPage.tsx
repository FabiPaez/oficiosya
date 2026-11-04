import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { workerService } from '../services/workerService'
import { categoryService } from '../services/categoryService'
import type { Worker } from '../types/worker'
import type { Category } from '../types/category'
import Badge from '../components/ui/Badge'
import { normalizeText } from '../utils/normalizeText'

function AdminPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Estado para modal de confirmación de eliminación
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null)
  const [deleteAccount, setDeleteAccount] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        const [loadedWorkers, loadedCategories] = await Promise.all([
          workerService.getAll(),
          categoryService.getAll(),
        ])

        if (!active) return

        setWorkers(loadedWorkers)
        setCategories(loadedCategories)
      } catch (err) {
        if (!active) return
        setError(
          err instanceof Error
            ? err.message
            : 'Error al cargar los datos de administración.',
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [])

  // Filtrado de profesionales
  const filteredWorkers = useMemo(() => {
    const term = normalizeText(searchTerm.trim())

    return workers.filter((worker) => {
      const matchesCategory =
        !selectedCategory ||
        worker.categories.includes(selectedCategory) ||
        (worker.categoryNames &&
          worker.categoryNames.some(
            (c) => normalizeText(c) === normalizeText(selectedCategory),
          ))

      if (!matchesCategory) return false

      if (!term) return true

      const name = normalizeText(`${worker.firstName} ${worker.lastName}`)
      const categoriesText = normalizeText(
        (worker.categoryNames ?? worker.categories).join(' '),
      )
      const locationText = normalizeText(
        `${worker.department} ${worker.zones.join(' ')} ${worker.coverage}`,
      )
      const phoneText = worker.phone.replace(/\D/g, '')

      return (
        name.includes(term) ||
        categoriesText.includes(term) ||
        locationText.includes(term) ||
        phoneText.includes(term)
      )
    })
  }, [workers, searchTerm, selectedCategory])

  // Estadísticas rápidas
  const totalCount = workers.length
  const uniqueZones = useMemo(() => {
    const zones = new Set<string>()
    workers.forEach((w) => {
      if (w.department) zones.add(w.department)
      w.zones.forEach((z) => zones.add(z))
    })
    return zones.size
  }, [workers])

  function openDeleteModal(worker: Worker) {
    setWorkerToDelete(worker)
    setDeleteAccount(false)
    setDeleteError(null)
  }

  function closeDeleteModal() {
    if (isDeleting) return
    setWorkerToDelete(null)
    setDeleteAccount(false)
    setDeleteError(null)
  }

  async function handleConfirmDelete() {
    if (!workerToDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await workerService.deleteProvider(workerToDelete.id, deleteAccount)

      // Actualizar listado local
      setWorkers((current) =>
        current.filter(
          (w) => w.id !== workerToDelete.id && w.userId !== workerToDelete.id,
        ),
      )

      setSuccessMessage(
        `El profesional "${workerToDelete.firstName} ${workerToDelete.lastName}" fue eliminado correctamente.`,
      )
      closeDeleteModal()

      // Autoocultar mensaje luego de 5 segundos
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    } catch (err) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar al profesional. Verificá permisos e intentá nuevamente.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="page-section">
      <div className="container">
        {/* Cabecera del Panel */}
        <header className="page-heading">
          <div className="admin-header-badge">
            <span className="badge badge-premium">Super Admin</span>
            <span className="section-eyebrow">Panel de Control</span>
          </div>

          <h1>Administración de Prestadores</h1>
          <p>
            Supervisión integral de profesionales registrados. Podés buscar,
            inspeccionar perfiles y dar de baja profesionales de la plataforma.
          </p>
        </header>

        {/* Mensaje de éxito global */}
        {successMessage && (
          <div
            className="state state-info"
            role="status"
            style={{
              marginBottom: 'var(--space-6)',
              backgroundColor: 'var(--color-success-soft)',
              borderColor: 'var(--color-success)',
              color: 'var(--color-success)',
              fontWeight: 500,
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {/* Métricas / Estadísticas rápidas */}
        <section className="admin-stats-grid" aria-label="Métricas generales">
          <div className="card admin-stat-card">
            <span className="admin-stat-number">{totalCount}</span>
            <span className="admin-stat-label">Profesionales Registrados</span>
          </div>

          <div className="card admin-stat-card">
            <span className="admin-stat-number">{categories.length}</span>
            <span className="admin-stat-label">Categorías de Oficios</span>
          </div>

          <div className="card admin-stat-card">
            <span className="admin-stat-number">{uniqueZones}</span>
            <span className="admin-stat-label">Zonas y Departamentos</span>
          </div>
        </section>

        {/* Barra de Filtros y Búsqueda */}
        <div className="card admin-filters-card">
          <div className="admin-filters-grid">
            <div className="admin-search-field">
              <label htmlFor="admin-search">Buscar profesional</label>
              <input
                id="admin-search"
                type="text"
                placeholder="Filtrar por nombre, oficio, zona o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="admin-search-field">
              <label htmlFor="admin-category-filter">Filtrar por oficio</label>
              <select
                id="admin-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todos los oficios</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-filters-footer">
            <span>
              Mostrando <strong>{filteredWorkers.length}</strong> de{' '}
              <strong>{totalCount}</strong> profesionales
            </span>

            {(searchTerm || selectedCategory) && (
              <button
                type="button"
                className="button button-outline button-sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Estados de carga o error */}
        {loading && (
          <div className="state state-loading" role="status">
            Cargando listado de profesionales...
          </div>
        )}

        {error && (
          <div className="state state-error" role="alert">
            {error}
          </div>
        )}

        {/* Listado de Profesionales */}
        {!loading && !error && filteredWorkers.length === 0 && (
          <div className="state state-empty">
            <h3>No se encontraron profesionales</h3>
            <p>
              {totalCount === 0
                ? 'No hay prestadores registrados en la plataforma actualmente.'
                : 'Ningún profesional coincide con los criterios de búsqueda seleccionados.'}
            </p>
          </div>
        )}

        {!loading && !error && filteredWorkers.length > 0 && (
          <section
            className="admin-workers-list"
            aria-label="Listado de profesionales"
          >
            {filteredWorkers.map((worker) => {
              const categoriesList =
                worker.categoryNames ?? worker.categories

              return (
                <article key={worker.id} className="card admin-worker-row">
                  {/* Avatar / Foto */}
                  <div className="admin-worker-avatar">
                    {worker.photoUrl ? (
                      <img
                        src={worker.photoUrl}
                        alt={`${worker.firstName} ${worker.lastName}`}
                      />
                    ) : (
                      <span>
                        {worker.firstName.charAt(0)}
                        {worker.lastName.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Datos del profesional */}
                  <div className="admin-worker-info">
                    <div className="admin-worker-name-group">
                      <h3>
                        {worker.firstName} {worker.lastName}
                      </h3>
                      {worker.premium && (
                        <Badge variant="premium">PREMIUM</Badge>
                      )}
                    </div>

                    <div className="admin-worker-categories">
                      {categoriesList.map((cat, idx) => (
                        <span key={idx} className="admin-category-pill">
                          {cat}
                        </span>
                      ))}
                    </div>

                    <div className="admin-worker-meta">
                      {worker.department && (
                        <span>📍 {worker.department}</span>
                      )}
                      {worker.coverage && (
                        <span>🌐 {worker.coverage}</span>
                      )}
                      {worker.phone && (
                        <span>📞 {worker.phone}</span>
                      )}
                      {worker.experienceYears != null && (
                        <span>
                          ⭐ {worker.experienceYears}{' '}
                          {worker.experienceYears === 1 ? 'año' : 'años'} de exp.
                        </span>
                      )}
                    </div>

                    {worker.description && (
                      <p className="admin-worker-desc">
                        {worker.description}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="admin-worker-actions">
                    <Link
                      to={`/trabajador/${worker.id}`}
                      className="button button-outline button-sm"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver perfil ↗
                    </Link>

                    <button
                      type="button"
                      className="button button-danger button-sm"
                      onClick={() => openDeleteModal(worker)}
                    >
                      Eliminar profesional
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
        )}

        {/* Modal de confirmación para eliminar */}
        {workerToDelete && (
          <div
            className="admin-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="admin-modal-card">
              <div className="admin-modal-header">
                <span className="admin-modal-warning-icon">⚠️</span>
                <h2 id="modal-title">¿Eliminar a este profesional?</h2>
              </div>

              <div className="admin-modal-body">
                <p>
                  Estás a punto de dar de baja a{' '}
                  <strong>
                    {workerToDelete.firstName} {workerToDelete.lastName}
                  </strong>{' '}
                  como prestador de servicios.
                </p>

                <div className="admin-modal-callout">
                  <strong>¿Qué sucederá?</strong>
                  <ul>
                    <li>
                      Se revocará el rol de <code>PROVIDER</code>.
                    </li>
                    <li>
                      Se desasociarán sus categorías y servicios activos.
                    </li>
                    <li>
                      El usuario ya no aparecerá en búsquedas ni listados.
                    </li>
                  </ul>
                </div>

                <label className="admin-checkbox-label">
                  <input
                    type="checkbox"
                    checked={deleteAccount}
                    onChange={(e) => setDeleteAccount(e.target.checked)}
                    disabled={isDeleting}
                  />
                  <span>
                    Eliminar también la cuenta de usuario completa (incluyendo
                    credenciales de inicio de sesión).
                  </span>
                </label>

                {deleteError && (
                  <div
                    className="state state-error"
                    style={{ marginTop: 'var(--space-3)' }}
                    role="alert"
                  >
                    {deleteError}
                  </div>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="button button-danger"
                  onClick={() => void handleConfirmDelete()}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Eliminando...' : 'Sí, eliminar profesional'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
