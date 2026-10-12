import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mockWorkers } from '../../data/mockWorkers'
import { mockReviews } from '../../data/mockReviews'
import { workerService } from '../workerService'

describe('workerService', () => {
  let originalWorkers: typeof mockWorkers
  let originalReviews: typeof mockReviews

  beforeEach(() => {
    originalWorkers = mockWorkers.map((worker) => ({ ...worker }))
    originalReviews = mockReviews.map((review) => ({ ...review }))
  })

  afterEach(() => {
    mockWorkers.splice(0, mockWorkers.length, ...originalWorkers)
    mockReviews.splice(0, mockReviews.length, ...originalReviews)
  })

  it('devuelve solamente trabajadores activos', async () => {
    const workers = await workerService.getAll()

    expect(workers.length).toBeGreaterThan(0)
    expect(workers.every((worker) => worker.active)).toBe(true)
  })

  it('devuelve un trabajador activo por su ID', async () => {
    const existingWorker = mockWorkers.find((worker) => worker.active)

    expect(existingWorker).toBeDefined()
    if (!existingWorker) return

    const worker = await workerService.getById(existingWorker.id)

    expect(worker?.id).toBe(existingWorker.id)
  })

  it('devuelve null si el trabajador no existe', async () => {
    await expect(
      workerService.getById('worker-inexistente'),
    ).resolves.toBeNull()
  })

  it('calcula el promedio y la cantidad de reseñas', async () => {
    const worker = mockWorkers.find((item) =>
      mockReviews.some((review) => review.workerId === item.id),
    )

    expect(worker).toBeDefined()
    if (!worker) return

    const reviews = mockReviews.filter(
      (review) => review.workerId === worker.id,
    )
    const expectedAverage =
      reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length

    const result = await workerService.getById(worker.id)

    expect(result?.reviewCount).toBe(reviews.length)
    expect(result?.ratingAverage).toBeCloseTo(expectedAverage)
  })

  it('busca trabajadores por texto', async () => {
    const worker = mockWorkers.find((item) => item.active)

    expect(worker).toBeDefined()
    if (!worker) return

    const result = await workerService.search({
      query: worker.firstName,
    })

    expect(result.some((item) => item.id === worker.id)).toBe(true)
  })

  it('crea un trabajador con métricas iniciales correctas', async () => {
    const source = mockWorkers[0]

    expect(source).toBeDefined()
    if (!source) return

    const worker = await workerService.createMock({
      userId: 'user-provider-test',
      firstName: 'Trabajador',
      lastName: 'De Prueba',
      description: 'Perfil utilizado en pruebas automatizadas.',
      phone: source.phone,
      whatsapp: source.whatsapp,
      department: source.department,
      zones: [...source.zones],
      coverage: source.coverage,
      categories: [...source.categories],
      photoUrl: source.photoUrl,
      workPhotoUrls: [...source.workPhotoUrls],
      experienceYears: source.experienceYears,
      schedule: source.schedule,
      availableDays: [...source.availableDays],
    })

    expect(worker.id).toMatch(/^worker-/)
    expect(worker.active).toBe(true)
    expect(worker.premium).toBe(false)
    expect(worker.ratingAverage).toBe(0)
    expect(worker.reviewCount).toBe(0)
    expect(mockWorkers.some((item) => item.id === worker.id)).toBe(true)
  })


  it('actualiza los datos profesionales de un trabajador', async () => {
    const source = mockWorkers.find((worker) => worker.active)

    expect(source).toBeDefined()
    if (!source) return

    const originalDescription = source.description
    const updatedDescription = 'Descripción actualizada para pruebas.'
    const updatedSchedule = 'Jornada completa'

    const result = await workerService.updateMock(source.id, {
      description: updatedDescription,
      phone: source.phone,
      whatsapp: source.whatsapp,
      department: source.department,
      zones: [...source.zones],
      coverage: source.coverage,
      categories: [...source.categories],
      photoUrl: source.photoUrl,
      workPhotoUrls: [...source.workPhotoUrls],
      experienceYears: source.experienceYears,
      schedule: updatedSchedule,
      availableDays: [...source.availableDays],
    })

    expect(result).not.toBeNull()
    expect(result?.description).toBe(updatedDescription)
    expect(result?.schedule).toBe(updatedSchedule)
    expect(mockWorkers.find((worker) => worker.id === source.id)?.description)
      .toBe(updatedDescription)
    expect(originalDescription).not.toBe(updatedDescription)
  })

  it('devuelve null al intentar actualizar un trabajador inexistente', async () => {
    const result = await workerService.updateMock(
      'worker-inexistente',
      {
        description: 'Descripción de prueba.',
        phone: '2641234567',
        whatsapp: '',
        department: 'Jáchal',
        zones: ['Jáchal'],
        coverage: 'SOLO CENTRO',
        categories: [],
        photoUrl: '',
        workPhotoUrls: [],
        experienceYears: 0,
        schedule: 'Jornada completa',
        availableDays: ['Lunes'],
      },
    )

    expect(result).toBeNull()
  })
})