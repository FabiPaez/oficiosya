export type CoverageType =
  | 'SOLO CENTRO'
  | 'RURAL'
  | 'CENTRO + RURAL'
  | ''

export interface Worker {
  id: string
  userId: string
  firstName: string
  lastName: string
  description: string
  phone: string
  whatsapp: string
  department: string
  zones: string[]
  coverage: CoverageType
  categories: string[]
  categoryNames?: string[]
  photoUrl: string
  workPhotoUrls: string[]
  ratingAverage?: number
  reviewCount?: number
  premium: boolean
  experienceYears: number | '+40' | null
  schedule: string
  availableDays: string[]
  active: boolean
}
