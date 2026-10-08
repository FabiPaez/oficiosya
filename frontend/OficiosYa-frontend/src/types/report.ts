export type ReportReason =
  | 'INFORMACION_INCORRECTA'
  | 'CONDUCTA_INADECUADA'
  | 'CONTENIDO_INAPROPIADO'
  | 'OTRO'

export type ReportStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'RESOLVED'
  | 'REJECTED'

export interface Report {
  id: string
  reporterId: string
  workerId?: string
  reviewId?: string
  reason: ReportReason
  description: string
  status: ReportStatus
  createdAt: string
}