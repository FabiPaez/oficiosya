import type { Report } from '../types/report'

export const mockReports: Report[] = [
  {
    id: 'report-001',
    reporterId: 'user-client-001',
    workerId: 'worker-003',
    reason: 'INFORMACION_INCORRECTA',
    description: 'La información del perfil no coincide con el servicio ofrecido.',
    status: 'PENDING',
    createdAt: '2026-07-05T15:00:00',
  },
]