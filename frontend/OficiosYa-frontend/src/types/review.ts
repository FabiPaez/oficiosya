export interface Review {
    id: string
    workerId: string
    clientId: string
    clientName: string
    rating: number
    comment?: string
    createdAt: string
    updatedAt?: string
  }