import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { workerService } from '../services/workerService'
import type { UpdateMockWorkerData } from '../services/workerService'
import type { Worker } from '../types/worker'
import {
  WORKER_DAYS_OPTIONS,
  WORKER_SCHEDULE_OPTIONS,
} from '../constants/workerAvailability'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'
import { getZonesFromCoverage } from '../utils/coverageZones'

function EditWorkerProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [worker, setWorker] = useState<Worker | null>(null)
  const [form, setForm] = useState<UpdateMockWorkerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesLoadError, setCategoriesLoadError] = useState(false)


  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      setCategoriesLoading(true)
      setCategoriesLoadError(false)

      try {
        const categories = await categoryService.getAll()

        if (!cancelled) {
          setAvailableCategories(categories)
        }
      } catch {
        if (!cancelled) {
          setCategoriesLoadError(true)
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      cancelled = true
    }
  }, [])


  useEffect(() => {
    let cancelled = false

    async function loadWorkerProfile() {
      if (!user) {
        setWorker(null)
        setForm(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const workers = await workerService.getAll()
        const currentWorker = workers.find(
          (item) => item.userId === user.id,
        )

        if (!cancelled) {
          setWorker(currentWorker ?? null)

          if (currentWorker) {
            const {
              description,
              phone,
              whatsapp,
              department,
              zones,
              coverage,
              categories,
              photoUrl,
              workPhotoUrls,
              experienceYears,
              schedule,
              availableDays,
            } = currentWorker

            setForm({
              description,
              phone,
              whatsapp,
              department,
              zones: [...zones],
              coverage,
              categories: [...categories],
              photoUrl,
              workPhotoUrls: [...workPhotoUrls],
              experienceYears,
              schedule,
              availableDays: [...availableDays],
            })
          } else {
            setForm(null)
          }
        }
      } catch {
        if (!cancelled) {
          setError('No pudimos cargar tu perfil profesional.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadWorkerProfile()

    return () => {
      cancelled = true
    }
  }, [user])

  function updateField<K extends keyof UpdateMockWorkerData>(
    field: K,
    value: UpdateMockWorkerData[K],
  ) {
    setForm((current) =>
      current ? { ...current, [field]: value } : current,
    )
    setSuccess(false)
    setError('')
  }

  function handleCoverageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const coverage =
      event.target.value as UpdateMockWorkerData['coverage']

    const zones = getZonesFromCoverage(coverage)

    setForm((current) =>
      current
        ? {
          ...current,
          coverage,
          zones,
        }
        : current,
    )

    setSuccess(false)
    setError('')
  }

  function isValidPhoneNumber(value: string): boolean {
    const digits = value.replace(/\D/g, '')

    return digits.length >= 10 && digits.length <= 13
  }

  function handleCancel() {
    const confirmed = window.confirm(
      '¿Querés cancelar el registro? Se perderán los cambios de este formulario.',
    )

    if (confirmed) {
      navigate('/mi-perfil')
    }
  }


  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!worker || !form) {
      return
    }

    if (!form.phone.trim()) {
      setError('El teléfono es obligatorio.')
      setSuccess(false)
      return
    }

    if (!isValidPhoneNumber(form.phone)) {
      setError('Ingresá un teléfono válido con entre 10 y 13 dígitos.')
      setSuccess(false)
      return
    }

    if (
      form.whatsapp.trim() &&
      !isValidPhoneNumber(form.whatsapp)
    ) {
      setError('Ingresá un WhatsApp válido con entre 10 y 13 dígitos.')
      setSuccess(false)
      return
    }


    if (
      !WORKER_SCHEDULE_OPTIONS.some(
        (option) => option.value === form.schedule,
      )
    ) {
      setError('Seleccioná un horario de atención válido.')
      setSuccess(false)
      return
    }

    if (
      form.availableDays.length === 0 ||
      !form.availableDays.every((day) =>
        WORKER_DAYS_OPTIONS.includes(
          day as (typeof WORKER_DAYS_OPTIONS)[number],
        ),
      )
    ) {
      setError('Seleccioná al menos un día disponible válido.')
      setSuccess(false)
      return
    }


    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const updatedWorker = await workerService.updateMock(
        worker.id,
        form,
      )

      if (!updatedWorker) {
        setError('No encontramos el perfil que intentás actualizar.')
        return
      }

      setWorker(updatedWorker)
      setSuccess(true)
    } catch {
      setError('No pudimos guardar los cambios. Intentá nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="page-container">
        <h1>Editar perfil profesional</h1>
        <p role="status">Cargando tus datos profesionales...</p>
      </main>
    )
  }

  if (!worker || !form) {
    return (
      <main className="page-container">
        <h1>Editar perfil profesional</h1>
        <p role="alert">
          {error ||
            'No encontramos un perfil profesional asociado a tu cuenta.'}
        </p>
        <Link to="/mi-perfil">Volver a mi perfil</Link>
      </main>
    )
  }

  return (
    <main className="page-container">
      <section className="profile-page">
        <header className="profile-page__header">
          <h2>Editar perfil profesional</h2>
          <p>
            Mantené actualizada la información de tus servicios.
          </p>
          <div className="provider-registration__step-title"><h3 >{worker.firstName} {worker.lastName} </h3></div>
          <p>
            
          </p>
        </header>

        <form className="provider-registration__form" onSubmit={handleSubmit} noValidate>
          <h2>Presentación profesional</h2>

          <div className="provider-registration__field">
            <label htmlFor="description">Descripción de tus servicios</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              rows={5}
              maxLength={1000}
            />
          </div>

          <div className="provider-registration__step-title"><h2 >Datos de contacto</h2></div>

          <div className="provider-registration__field">
            <div>
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField('phone', event.target.value)
                }
                required
              />
            </div>

            <div>
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={form.whatsapp}
                onChange={(event) =>
                  updateField('whatsapp', event.target.value)
                }
              />
            </div>

          </div>

          <div className="provider-registration__field">

            <h2>Ubicación y cobertura</h2>

            <div>
              <label htmlFor="department">Departamento</label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={(event) =>
                  updateField('department', event.target.value)
                }
                required
              >
                <option value="">Seleccioná un departamento</option>
                <option value="Jáchal">Jáchal</option>
              </select>
            </div>

            <fieldset className="provider-registration__coverage">
              <legend>¿En qué zonas trabajás?</legend>

              <label>
                <input
                  type="radio"
                  name="coverage"
                  value="SOLO CENTRO"
                  checked={form.coverage === 'SOLO CENTRO'}
                  onChange={handleCoverageChange}
                />
                <span>Jáchal Centro</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="coverage"
                  value="RURAL"
                  checked={form.coverage === 'RURAL'}
                  onChange={handleCoverageChange}
                />
                <span>Zonas rurales de Jáchal</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="coverage"
                  value="CENTRO + RURAL"
                  checked={form.coverage === 'CENTRO + RURAL'}
                  onChange={handleCoverageChange}
                />
                <span>Centro y zonas rurales</span>
              </label>
            </fieldset>

            <p className="provider-registration__field-help">
              La cobertura se limita a las zonas seleccionadas del departamento.
            </p>
          </div>


          <div className="provider-registration__step-title"><h2 >Categorías</h2></div>
          <p>Elegí los servicios que ofrecés.</p>


          <div className="provider-registration__category-section">
            <p>
              Seleccioná todas las categorías en las que ofrecés servicios.
              Podés elegir más de una.
            </p>

            {categoriesLoading && (
              <p role="status">Cargando categorías...</p>
            )}

            {!categoriesLoading && categoriesLoadError && (
              <div
                className="provider-registration__category-message"
                role="alert"
              >
                <p>
                  No pudimos cargar las categorías. Revisá la conexión e
                  intentá nuevamente.
                </p>
                <button
                  className="provider-registration__button provider-registration__button--secondary"
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Reintentar
                </button>
              </div>
            )}

            {!categoriesLoading &&
              !categoriesLoadError &&
              availableCategories.length === 0 && (
                <p role="status">
                  No hay categorías activas disponibles en este momento.
                </p>
              )}

            {!categoriesLoading &&
              !categoriesLoadError &&
              availableCategories.length > 0 && (
                <div className="provider-registration__category-grid">
                  {availableCategories.map((category) => {
                    const selected = form?.categories.includes(category.id) ?? false

                    return (
                      <label
                        key={category.id}
                        className={`provider-registration__category-option ${selected
                          ? 'provider-registration__category-option--selected'
                          : ''
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => {
                            if (!form) return

                            const updatedCategories = selected
                              ? form.categories.filter(
                                (id) => id !== category.id,
                              )
                              : [...form.categories, category.id]

                            setForm({
                              ...form,
                              categories: updatedCategories,
                            })
                            setError('')
                            setSuccess(false)
                          }}
                        />

                        <span className="provider-registration__category-name">
                          {category.name}
                        </span>

                        {category.description && (
                          <span className="provider-registration__category-description">
                            {category.description}
                          </span>
                        )}
                      </label>
                    )
                  })}
                </div>
              )}

            <p className="provider-registration__selected-count">
              Categorías seleccionadas: {form?.categories.length ?? 0}
            </p>
          </div>


          <div className="provider-registration__field">
            <label htmlFor="experienceYears">
              <h3>Años de experiencia</h3>
            </label>
            <select
              id="experienceYears"
              name="experienceYears"
              value={String(form.experienceYears)}
              onChange={(event) => {
                const value = event.target.value
                updateField(
                  'experienceYears',
                  value === '+40' ? '+40' : Number(value),
                )
              }}
              required
            >
              {Array.from({ length: 41 }, (_, index) => (
                <option key={index} value={index}>
                  {index} {index === 1 ? 'año' : 'años'}
                </option>
              ))}
              <option value="+40">Más de 40 años</option>
            </select>
          </div>

          <h2>Disponibilidad</h2>

          <fieldset className="provider-registration__coverage">
            <legend>Horario de atención</legend>

            {WORKER_SCHEDULE_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="schedule"
                  value={option.value}
                  checked={form.schedule === option.value}
                  onChange={() => updateField('schedule', option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="provider-registration__coverage">
            <legend>Días disponibles</legend>

            {WORKER_DAYS_OPTIONS.map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  name="availableDays"
                  value={day}
                  checked={form.availableDays.includes(day)}
                  onChange={(event) => {
                    updateField(
                      'availableDays',
                      event.target.checked
                        ? [...form.availableDays, day]
                        : form.availableDays.filter(
                          (selectedDay) => selectedDay !== day,
                        ),
                    )
                  }}
                />
                <span>{day}</span>
              </label>
            ))}
          </fieldset>


          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p role="status">
              Los cambios de tu perfil se guardaron correctamente.
            </p>
          )}

          <div className="provider-registration__actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>


            <Link to="/mi-perfil">
              Volver a mi perfil
            </Link>

            <button
              className="provider-registration__button provider-registration__button--secondary"
              type="button"
              onClick={handleCancel}
            >
              Cancelar
            </button>

          </div>

        </form>
      </section>
    </main>
  )
}

export default EditWorkerProfilePage