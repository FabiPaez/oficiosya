import { z } from 'zod';

export const createServiceRequestSchema = z.object({
  providerId: z
    .string({ required_error: 'El providerId es requerido' })
    .uuid('El providerId debe ser un UUID válido'),

  serviceId: z
    .number({ required_error: 'El serviceId es requerido', invalid_type_error: 'El serviceId debe ser un número' })
    .int('El serviceId debe ser un número entero')
    .positive('El serviceId debe ser mayor a 0'),

  title: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(150, 'El título no puede superar los 150 caracteres'),

  description: z
    .string()
    .trim()
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(1000, 'La descripción no puede superar los 1000 caracteres'),

  address: z
    .string()
    .trim()
    .max(200, 'La dirección no puede superar los 200 caracteres')
    .optional()
    .nullable(),

  city: z
    .string()
    .trim()
    .max(100, 'La ciudad no puede superar los 100 caracteres')
    .optional()
    .nullable(),

  requestedDate: z
    .string()
    .datetime({ message: 'Formato de fecha inválido (debe ser ISO 8601)' })
    .optional()
    .nullable(),
});

export const updateServiceRequestStatusSchema = z.object({
  status: z.enum(
    ['PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    { errorMap: () => ({ message: 'Estado de solicitud no válido' }) }
  ),
});