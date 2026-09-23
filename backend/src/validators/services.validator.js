import { z } from 'zod';

export const createServiceSchema = z.object({
  categoryId: z
    .number({ required_error: 'El categoryId es requerido', invalid_type_error: 'El categoryId debe ser un número' })
    .int('El categoryId debe ser un entero')
    .positive('El categoryId debe ser mayor a 0'),

  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),

  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .nullable(),
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres')
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .nullable(),

  isActive: z
    .boolean({ invalid_type_error: 'isActive debe ser booleano' })
    .optional(),
});