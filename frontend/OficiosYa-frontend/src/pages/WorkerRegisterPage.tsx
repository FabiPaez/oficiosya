import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { categoryService } from '../services/categoryService'
import type { Category } from '../types/category'
import { workerService } from '../services/workerService'
import {
  WORKER_DAYS_OPTIONS,
  WORKER_SCHEDULE_OPTIONS,
} from '../constants/workerAvailability'
import { getZonesFromCoverage } from '../utils/coverageZones'

const registrationSteps = [
  {
    title: 'Datos personales',
    description: 'Completá tus datos básicos.',
  },
  {
    title: 'Categorías',
    description: 'Elegí los servicios que ofrecés.',
  },
  {
    title: 'Presentación',
    description: 'Contá qué servicios brindás y tu experiencia.',
  },
  {
    title: 'Contacto y cobertura',
    description: 'Indicá cómo contactarte y dónde trabajás.',
  },
  {
    title: 'Imágenes',
    description: 'Agregá tu foto de perfil y trabajos realizados.',
  },
  {
    title: 'Confirmación',
    description: 'Revisá los datos antes de finalizar.',
  },
]

interface WorkerRegistrationDraft {
  firstName: string
  lastName: string
  email: string
  phone: string
  whatsapp: string
  department: string
  categories: string[]
  description: string
  experienceYears: string
  coverage: 'SOLO CENTRO' | 'RURAL' | 'CENTRO + RURAL'
  zones: string[]
  photoUrl: string
  workPhotoUrls: string[]
  schedule: string
  availableDays: string[]
}

function WorkerRegisterPage() {
  const navigate = useNavigate()
  const { user, registerAsProvider } = useAuth()

  const [currentStep, setCurrentStep] = useState(0)

  const [draft, setDraft] = useState<WorkerRegistrationDraft>(() => ({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    department: user?.department || 'Jáchal',
    categories: [],
    description: '',
    experienceYears: '',
    whatsapp: user?.phone ?? '',
    coverage: 'SOLO CENTRO',
    zones: ['Centro'],
    photoUrl: '',
    workPhotoUrls: [],
    schedule: 'Jornada completa',
    availableDays: [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
    ],
  }))

  const [errors, setErrors] = useState<
    Partial<Record<keyof WorkerRegistrationDraft, string>>
  >({})

  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesLoadError, setCategoriesLoadError] = useState(false)
  const [categoryValidationError, setCategoryValidationError] = useState('')


  const [presentationErrors, setPresentationErrors] = useState<{
    description?: string
    experienceYears?: string
    schedule?: string
    availableDays?: string
  }>({})


  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

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

  const progress =
    ((currentStep + 1) / registrationSteps.length) * 100

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target
    const field = name as keyof WorkerRegistrationDraft

    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }))

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }))

    if (field === 'description' || field === 'experienceYears') {
      setPresentationErrors((previous) => ({
        ...previous,
        [field]: undefined,
      }))
    }
  }

  function normalizeExperienceYears(value: string): string {
    if (value === '+40') {
      return '+40'
    }

    if (!/^\d+$/.test(value)) {
      return value
    }

    const years = Number(value)

    if (years >= 41 && years <= 90) {
      return '+40'
    }

    return value
  }

  function validatePresentation(): boolean {
    const nextErrors: {
      description?: string
      experienceYears?: string
      schedule?: string
      availableDays?: string
    } = {}

    const description = draft.description.trim()
    const experience = draft.experienceYears.trim()

    // La descripción es opcional, pero tiene un máximo de 600 caracteres.
    if (description.length > 600) {
      nextErrors.description =
        'La descripción no puede superar los 600 caracteres.'
    }

    // Los años de experiencia son obligatorios.
    if (!experience) {
      nextErrors.experienceYears =
        'Seleccioná tus años de experiencia.'
    } else if (experience !== '+40') {
      if (!/^\d+$/.test(experience)) {
        nextErrors.experienceYears =
          'Seleccioná un número entero válido.'
      } else {
        const years = Number(experience)

        if (years < 0 || years > 40) {
          nextErrors.experienceYears =
            'Seleccioná entre 0 y 40 años, o +40 años.'
        }
      }
    }

    // El horario es obligatorio y debe corresponder a una opción disponible.
    if (
      !WORKER_SCHEDULE_OPTIONS.some(
        (option) => option.value === draft.schedule,
      )
    ) {
      nextErrors.schedule = 'Seleccioná un horario de atención.'
    }

    // Debe seleccionarse al menos un día válido.
    if (
      draft.availableDays.length === 0 ||
      !draft.availableDays.every((day) =>
        WORKER_DAYS_OPTIONS.includes(
          day as (typeof WORKER_DAYS_OPTIONS)[number],
        ),
      )
    ) {
      nextErrors.availableDays =
        'Seleccioná al menos un día disponible.'
    }

    setPresentationErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }


  function validateContactCoverage(): boolean {
    const nextErrors: Partial<
      Record<keyof WorkerRegistrationDraft, string>
    > = {}

    const isValidPhoneNumber = (value: string): boolean => {
      const digits = value.replace(/\D/g, '')
      return digits.length >= 10 && digits.length <= 13
    }

    if (!draft.phone.trim()) {
      nextErrors.phone = 'Ingresá un teléfono de contacto.'
    } else if (!isValidPhoneNumber(draft.phone)) {
      nextErrors.phone =
        'Ingresá un teléfono válido con entre 10 y 13 dígitos.'
    }

    if (!draft.whatsapp.trim()) {
      nextErrors.whatsapp = 'Ingresá un número de WhatsApp.'
    } else if (!isValidPhoneNumber(draft.whatsapp)) {
      nextErrors.whatsapp =
        'Ingresá un WhatsApp válido con entre 10 y 13 dígitos.'
    }

    setErrors((previous) => ({
      ...previous,
      phone: nextErrors.phone,
      whatsapp: nextErrors.whatsapp,
    }))

    return !nextErrors.phone && !nextErrors.whatsapp
  }


  function validatePersonalData(): boolean {
    const nextErrors: Partial<
      Record<keyof WorkerRegistrationDraft, string>
    > = {}

    if (!draft.firstName.trim()) {
      nextErrors.firstName = 'Ingresá tu nombre.'
    }

    if (!draft.lastName.trim()) {
      nextErrors.lastName = 'Ingresá tu apellido.'
    }

    if (!draft.email.trim()) {
      nextErrors.email = 'Ingresá tu correo electrónico.'
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
    ) {
      nextErrors.email = 'Ingresá un correo electrónico válido.'
    }

    if (!draft.phone.trim()) {
      nextErrors.phone = 'Ingresá un teléfono de contacto.'
    } else {
      const phoneDigits = draft.phone.replace(/\D/g, '')

      if (phoneDigits.length < 10 || phoneDigits.length > 13) {
        nextErrors.phone =
          'Ingresá un teléfono válido con entre 10 y 13 dígitos.'
      }
    }

    if (!draft.department) {
      nextErrors.department = 'Seleccioná un departamento.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function handleSubmitPersonalData(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!validatePersonalData()) {
      return
    }

    setCurrentStep(1)
  }

  function handleCategoryToggle(categoryId: string) {
    setDraft((previous) => {
      const isSelected = previous.categories.includes(categoryId)

      return {
        ...previous,
        categories: isSelected
          ? previous.categories.filter((id) => id !== categoryId)
          : [...previous.categories, categoryId],
      }
    })

    setCategoryValidationError('')
  }

  function handleCoverageChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const coverage =
      event.target.value as WorkerRegistrationDraft['coverage']

    const zones = getZonesFromCoverage(coverage)

    setDraft((previous) => ({
      ...previous,
      coverage,
      zones,
    }))

    setErrors((previous) => ({
      ...previous,
      zones: undefined,
    }))
  }


  function handleProfilePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      window.alert('Seleccioná un archivo de imagen válido.')
      event.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert('La foto de perfil no puede superar los 5 MB.')
      event.target.value = ''
      return
    }

    setDraft((previous) => ({
      ...previous,
      photoUrl: URL.createObjectURL(file),
    }))
  }

  function handleWorkPhotosChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? [])

    if (files.length === 0) {
      return
    }

    if (files.some((file) => !file.type.startsWith('image/'))) {
      window.alert('Todos los archivos seleccionados deben ser imágenes.')
      event.target.value = ''
      return
    }

    if (files.some((file) => file.size > 5 * 1024 * 1024)) {
      window.alert('Cada imagen debe pesar como máximo 5 MB.')
      event.target.value = ''
      return
    }

    if (files.length + draft.workPhotoUrls.length > 5) {
      window.alert('Podés agregar hasta 5 fotos de tus trabajos.')
      event.target.value = ''
      return
    }

    const newUrls = files.map((file) => URL.createObjectURL(file))

    setDraft((previous) => ({
      ...previous,
      workPhotoUrls: [...previous.workPhotoUrls, ...newUrls],
    }))

    event.target.value = ''
  }

  function handleRemoveWorkPhoto(photoUrl: string) {
    URL.revokeObjectURL(photoUrl)

    setDraft((previous) => ({
      ...previous,
      workPhotoUrls: previous.workPhotoUrls.filter(
        (url) => url !== photoUrl,
      ),
    }))
  }

  function handleRemoveProfilePhoto() {
    if (draft.photoUrl) {
      URL.revokeObjectURL(draft.photoUrl)
    }

    setDraft((previous) => ({
      ...previous,
      photoUrl: '',
    }))
  }

  function handleSubmitPresentation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!validatePresentation()) {
      return
    }

    setCurrentStep(3)
  }

  function handleSubmitContactCoverage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!validateContactCoverage()) {
      return
    }

    setCurrentStep(4)
  }



  async function handleConfirmRegistration() {
    if (isSubmitting || registrationComplete) {
      return
    }

    if (!user) {
      window.alert(
        'Necesitás iniciar sesión para registrar tu perfil profesional.',
      )
      return
    }

    setIsSubmitting(true)

    try {

      await workerService.registerProvider({
        description: draft.description.trim(),
        department: draft.department.trim(),
        categoryIds: draft.categories,
        coverage: draft.coverage,
        experienceYears: draft.experienceYears,
        schedule: draft.schedule,
        availableDays: draft.availableDays,
      })

      await registerAsProvider()

      setRegistrationComplete(true)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el perfil profesional.'

      window.alert(message)
    } finally {
      setIsSubmitting(false)
    }
  }


  function handleNext() {
    if (currentStep === 0) {
      return
    }

    if (currentStep === 1) {
      if (categoriesLoading || categoriesLoadError) {
        return
      }

      if (draft.categories.length === 0) {
        setCategoryValidationError(
          'Seleccioná al menos una categoría para continuar.',
        )
        return
      }
    }

    setCurrentStep((step) =>
      Math.min(step + 1, registrationSteps.length - 1),
    )
  }

  function handlePrevious() {
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function handleCancel() {
    const confirmed = window.confirm(
      '¿Querés cancelar el registro? Se perderán los cambios de este formulario.',
    )

    if (confirmed) {
      navigate('/mi-perfil')
    }
  }

  return (
    <div className="provider-registration">
      <header className="provider-registration__header">
        <span className="provider-registration__eyebrow">
          REGISTRO DE TRABAJADOR
        </span>

        <h1>Creá tu perfil profesional</h1>

        <p>
          Completá los pasos para presentar tus servicios en OficiosYa.
        </p>
      </header>

      <section
        className="provider-registration__progress"
        aria-label="Progreso del registro"
      >
        <div className="provider-registration__progress-label">
          <span>
            Paso {currentStep + 1} de {registrationSteps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        <div
          className="provider-registration__progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del registro"
        >
          <div
            className="provider-registration__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <nav
        className="provider-registration__steps"
        aria-label="Pasos del registro"
      >
        {registrationSteps.map((step, index) => (
          <div
            key={step.title}
            className={`provider-registration__step ${index === currentStep
              ? 'provider-registration__step--active'
              : ''
              } ${index < currentStep
                ? 'provider-registration__step--completed'
                : ''
              }`}
            aria-current={index === currentStep ? 'step' : undefined}
          >
            <span className="provider-registration__step-number">
              {index < currentStep ? '✓' : index + 1}
            </span>

            <span className="provider-registration__step-title">
              {step.title}
            </span>
          </div>
        ))}
      </nav>

      <section className="provider-registration__content">
        <div className="provider-registration__content-heading">
          <h2>{registrationSteps[currentStep].title}</h2>
          <p>{registrationSteps[currentStep].description}</p>
        </div>

        {currentStep === 0 && (
          <form
            className="provider-registration__form"
            onSubmit={handleSubmitPersonalData}
            noValidate
          >
            <div className="provider-registration__field">
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={draft.firstName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                required
              />
              {errors.firstName && (
                <p id="firstName-error" className="provider-registration__error">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="provider-registration__field">
              <label htmlFor="lastName">Apellido</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={draft.lastName}
                onChange={handleChange}
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                required
              />
              {errors.lastName && (
                <p id="lastName-error" className="provider-registration__error">
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="provider-registration__field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={handleChange}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                required
              />
              {errors.email && (
                <p id="email-error" className="provider-registration__error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="provider-registration__field">
              <label htmlFor="phone">Teléfono de contacto</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Ej.: 264 123 4567"
                value={draft.phone}
                onChange={handleChange}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                required
              />
              {errors.phone && (
                <p id="phone-error" className="provider-registration__error">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="provider-registration__field">
              <label htmlFor="department">Departamento</label>
              <select
                id="department"
                name="department"
                value={draft.department}
                onChange={handleChange}
                aria-invalid={Boolean(errors.department)}
                aria-describedby={
                  errors.department ? 'department-error' : undefined
                }
                required
              >
                <option value="">Seleccioná un departamento</option>
                <option value="Jáchal">Jáchal</option>
              </select>
              {errors.department && (
                <p id="department-error" className="provider-registration__error">
                  {errors.department}
                </p>
              )}
            </div>

            <div className="provider-registration__actions">
              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancelar
              </button>

              <button
                className="provider-registration__button provider-registration__button--primary"
                type="submit"
              >
                Continuar
              </button>
            </div>
          </form>
        )}

        {currentStep === 1 && (
          <div className="provider-registration__category-section">
            <p>
              Seleccioná todas las categorías en las que ofrecés servicios.
              Podés elegir más de una.
            </p>

            {categoriesLoading && (
              <p role="status">Cargando categorías...</p>
            )}

            {!categoriesLoading && categoriesLoadError && (
              <div className="provider-registration__category-message" role="alert">
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
                    const selected = draft.categories.includes(category.id)

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
                          onChange={() => handleCategoryToggle(category.id)}
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
              Categorías seleccionadas: {draft.categories.length}
            </p>

            {categoryValidationError && (
              <p className="provider-registration__error" role="alert">
                {categoryValidationError}
              </p>
            )}

            <div className="provider-registration__actions">
              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancelar
              </button>

              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handlePrevious}
              >
                Anterior
              </button>

              <button
                className="provider-registration__button provider-registration__button--primary"
                type="button"
                onClick={handleNext}
                disabled={
                  categoriesLoading ||
                  categoriesLoadError ||
                  availableCategories.length === 0
                }
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <form
            className="provider-registration__form"
            onSubmit={handleSubmitPresentation}
            noValidate
          >
            <div className="provider-registration__field">
              <label htmlFor="description">
                Descripción de tus servicios
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                maxLength={600}
                placeholder="Contá qué trabajos realizás, cuáles son tus especialidades y qué pueden esperar tus clientes."
                value={draft.description}
                onChange={handleChange}
                aria-invalid={Boolean(presentationErrors.description)}
                aria-describedby={
                  presentationErrors.description
                    ? 'description-error description-count'
                    : 'description-count'
                }
                required
              />

              <div className="provider-registration__character-count">
                <span id="description-count">
                  {draft.description.length}/600 caracteres
                </span>
              </div>

              {presentationErrors.description && (
                <p
                  id="description-error"
                  className="provider-registration__error"
                  role="alert"
                >
                  {presentationErrors.description}
                </p>
              )}
            </div>


            <fieldset className="provider-registration__coverage">
              <legend>¿En qué horarios trabajás?</legend>

              {WORKER_SCHEDULE_OPTIONS.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    name="schedule"
                    value={option.value}
                    checked={draft.schedule === option.value}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        schedule: event.target.value,
                      }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>
            {presentationErrors.schedule && (
              <p className="form-error" role="alert">
                {presentationErrors.schedule}
              </p>
            )}

            <fieldset className="provider-registration__coverage">
              <legend>¿Qué días estás disponible?</legend>

              {WORKER_DAYS_OPTIONS.map((day) => (
                <label key={day}>
                  <input
                    type="checkbox"
                    name="availableDays"
                    value={day}
                    checked={draft.availableDays.includes(day)}
                    onChange={(event) => {
                      setDraft((previous) => ({
                        ...previous,
                        availableDays: event.target.checked
                          ? [...previous.availableDays, day]
                          : previous.availableDays.filter(
                            (selectedDay) => selectedDay !== day,
                          ),
                      }))
                    }}
                  />
                  <span>{day}</span>
                </label>
              ))}
            </fieldset>
            {presentationErrors.availableDays && (
              <p className="form-error" role="alert">
                {presentationErrors.availableDays}
              </p>
            )}

            <div className="provider-registration__field">
              <label htmlFor="experienceYears">
                Años de experiencia
              </label>

              <select
                id="experienceYears"
                name="experienceYears"
                value={draft.experienceYears}
                onChange={(event) => {
                  const value = normalizeExperienceYears(event.target.value)

                  setDraft((previous) => ({
                    ...previous,
                    experienceYears: value,
                  }))

                  setPresentationErrors((previous) => ({
                    ...previous,
                    experienceYears: undefined,
                  }))
                }}
                aria-invalid={Boolean(presentationErrors.experienceYears)}
                aria-describedby={
                  presentationErrors.experienceYears
                    ? 'experienceYears-help experienceYears-error'
                    : 'experienceYears-help'
                }
                required
              >
                <option value="">Seleccioná tus años de experiencia</option>

                {Array.from({ length: 41 }, (_, years) => (
                  <option key={years} value={String(years)}>
                    {years} {years === 1 ? 'año' : 'años'}
                  </option>
                ))}

                <option value="+40">+40 años</option>
              </select>

              <p
                id="experienceYears-help"
                className="provider-registration__field-help"
              >
                Seleccioná una opción. Si tenés más de 40 años de experiencia,
                elegí +40 años.
              </p>


              {presentationErrors.experienceYears && (
                <p
                  id="experienceYears-error"
                  className="provider-registration__error"
                  role="alert"
                >
                  {presentationErrors.experienceYears}
                </p>
              )}
            </div>

            <div className="provider-registration__actions">
              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancelar
              </button>

              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handlePrevious}
              >
                Anterior
              </button>

              <button
                className="provider-registration__button provider-registration__button--primary"
                type="submit"
              >
                Continuar
              </button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form
            className="provider-registration__form"
            onSubmit={handleSubmitContactCoverage}
            noValidate
          >
            <div className="provider-registration__field">
              <label htmlFor="phone">
                Teléfono de contacto
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Ej.: 264 123 4567"
                value={draft.phone}
                onChange={handleChange}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                required
              />

              {errors.phone && (
                <p
                  id="contact-phone-error"
                  className="provider-registration__error"
                  role="alert"
                >
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="provider-registration__field">
              <label htmlFor="whatsapp">
                Número de WhatsApp
              </label>

              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                placeholder="Ej.: 264 123 4567"
                value={draft.whatsapp}
                onChange={handleChange}
                aria-invalid={Boolean(errors.whatsapp)}
                aria-describedby={
                  errors.whatsapp ? 'whatsapp-error' : undefined
                }
                required
              />

              {errors.whatsapp && (
                <p
                  id="whatsapp-error"
                  className="provider-registration__error"
                  role="alert"
                >
                  {errors.whatsapp}
                </p>
              )}
            </div>

            <fieldset className="provider-registration__coverage">
              <legend>¿En qué zonas de Jáchal trabajás?</legend>

              <label>
                <input
                  type="radio"
                  name="coverage"
                  value="SOLO CENTRO"
                  checked={draft.coverage === 'SOLO CENTRO'}
                  onChange={handleCoverageChange}
                />
                <span>Jáchal Centro</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="coverage"
                  value="RURAL"
                  checked={draft.coverage === 'RURAL'}
                  onChange={handleCoverageChange}
                />
                <span>Zonas rurales de Jáchal</span>
              </label>

              <label>
                <input
                  type="radio"
                  name="coverage"
                  value="CENTRO + RURAL"
                  checked={draft.coverage === 'CENTRO + RURAL'}
                  onChange={handleCoverageChange}
                />
                <span>Centro y zonas rurales</span>
              </label>
            </fieldset>

            <p className="provider-registration__field-help">
              La cobertura se limita al departamento de Jáchal.
            </p>

            <div className="provider-registration__actions">
              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancelar
              </button>

              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handlePrevious}
              >
                Anterior
              </button>

              <button
                className="provider-registration__button provider-registration__button--primary"
                type="submit"
              >
                Continuar
              </button>
            </div>
          </form>
        )}


        {currentStep === 4 && (
          <section className="provider-registration__images">
            <div className="provider-registration__field">
              <label htmlFor="profilePhoto">
                Foto de perfil (opcional)
              </label>

              <p className="provider-registration__field-help">
                Elegí una imagen que permita a tus clientes reconocerte.
                Tamaño máximo: 5 MB.
              </p>

              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
              />

              {draft.photoUrl && (
                <div className="provider-registration__image-preview">
                  <img
                    src={draft.photoUrl}
                    alt="Vista previa de la foto de perfil"
                  />

                  <button
                    type="button"
                    className="provider-registration__button provider-registration__button--secondary"
                    onClick={handleRemoveProfilePhoto}
                  >
                    Quitar foto
                  </button>
                </div>
              )}
            </div>

            <div className="provider-registration__field">
              <label htmlFor="workPhotos">
                Fotos de trabajos realizados (opcional)
              </label>

              <p className="provider-registration__field-help">
                Podés seleccionar varias imágenes, con un máximo de 5
                fotos en total. Cada imagen puede pesar hasta 5 MB.
              </p>

              <input
                id="workPhotos"
                type="file"
                accept="image/*"
                multiple
                onChange={handleWorkPhotosChange}
              />

              {draft.workPhotoUrls.length > 0 && (
                <div className="provider-registration__work-gallery">
                  {draft.workPhotoUrls.map((photoUrl, index) => (
                    <div
                      className="provider-registration__image-preview"
                      key={photoUrl}
                    >
                      <img
                        src={photoUrl}
                        alt={`Trabajo realizado ${index + 1}`}
                      />

                      <button
                        type="button"
                        className="provider-registration__button provider-registration__button--secondary"
                        onClick={() => handleRemoveWorkPhoto(photoUrl)}
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="provider-registration__actions">
              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handleCancel}
              >
                Cancelar
              </button>

              <button
                className="provider-registration__button provider-registration__button--secondary"
                type="button"
                onClick={handlePrevious}
              >
                Anterior
              </button>

              <button
                className="provider-registration__button provider-registration__button--primary"
                type="button"
                onClick={handleNext}
              >
                Continuar
              </button>
            </div>
          </section>
        )}


        {currentStep === 5 && (
          registrationComplete ? (
            <section
              className="provider-registration__success"
              aria-live="polite"
            >
              <h3>¡Tu perfil fue creado!</h3>

              <p>
                Tu perfil profesional se registró en el servidor y el sistema
                confirmó tu rol de prestador. Las categorías seleccionadas
                quedaron asociadas a tu cuenta.
              </p>

              <button
                type="button"
                className="provider-registration__button provider-registration__button--primary"
                onClick={() => navigate('/mi-perfil')}
              >
                Ir a mi perfil
              </button>
            </section>
          ) : (
            <section className="provider-registration__confirmation">
              <h3>Revisá tu información</h3>

              <div>
                <h4>Datos personales</h4>
                <p>
                  <strong>Nombre:</strong>{' '}
                  {draft.firstName} {draft.lastName}
                </p>
                <p><strong>Correo:</strong> {draft.email}</p>
                <p><strong>Teléfono:</strong> {draft.phone}</p>
                <p><strong>Departamento:</strong> Jáchal</p>
              </div>

              <div>
                <h4>Servicios</h4>
                <p>
                  <strong>Categorías:</strong>{' '}
                  {availableCategories
                    .filter((category) =>
                      draft.categories.includes(category.id),
                    )
                    .map((category) => category.name)
                    .join(', ') || 'Sin categorías'}
                </p>
                <p>
                  <strong>Descripción:</strong>{' '}
                  {draft.description.trim() || 'Sin descripción'}
                </p>
                <p>
                  <strong>Experiencia:</strong>{' '}
                  {draft.experienceYears === '+40'
                    ? '+40 años'
                    : `${draft.experienceYears} ${draft.experienceYears === '1' ? 'año' : 'años'
                    }`}
                </p>
              </div>

              <div>
                <h4>Contacto y cobertura</h4>
                <p><strong>WhatsApp:</strong> {draft.whatsapp}</p>
                <p>
                  <strong>Cobertura:</strong>{' '}
                  {draft.coverage === 'SOLO CENTRO'
                    ? 'Jáchal Centro'
                    : draft.coverage === 'RURAL'
                      ? 'Zonas rurales de Jáchal'
                      : 'Jáchal Centro y zonas rurales'}
                </p>
              </div>

              <div>
                <h4>Imágenes</h4>
                <p>
                  Foto de perfil:{' '}
                  {draft.photoUrl ? 'Agregada' : 'No agregada'}
                </p>
                <p>
                  Fotos de trabajos: {draft.workPhotoUrls.length}
                </p>
              </div>

              <p className="provider-registration__field-help">
                Revisá los datos antes de confirmar. Las imágenes utilizan
                direcciones temporales del navegador y todavía no se guardan
                en un servidor.
              </p>

              <div className="provider-registration__actions">
                <button
                  type="button"
                  className="provider-registration__button provider-registration__button--secondary"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="provider-registration__button provider-registration__button--secondary"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Anterior
                </button>

                <button
                  type="button"
                  className="provider-registration__button provider-registration__button--primary"
                  onClick={handleConfirmRegistration}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Registrando...'
                    : 'Confirmar registro'}
                </button>
              </div>
            </section>
          )
        )}
      </section>
    </div>
  )
}

export default WorkerRegisterPage