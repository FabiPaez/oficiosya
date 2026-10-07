// Tipos base transversales del frontend de OficiosYa

export type UserRole = 'CLIENT' | 'PROVIDER' | 'ADMIN';

export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}