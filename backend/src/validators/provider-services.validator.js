import { z } from 'zod';

export const createProviderServiceSchema = z.object({
  serviceId: z
    .number({ required_error: 'El serviceId es requerido', invalid_type_error: 'El serviceId debe ser un número' })
    .int('El serviceId debe ser un número entero')
    .positive('El serviceId debe ser mayor a 0'),

  priceFrom: z
    .number({ invalid_type_error: 'El precio inicial debe ser un número' })
    .min(0, 'El precio inicial no puede ser negativo')
    .optional()
    .nullable(),

  priceTo: z
    .number({ invalid_type_error: 'El precio final debe ser un número' })
    .min(0, 'El precio final no puede ser negativo')
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .nullable(),
}).refine(
  (data) => {
    if (data.priceFrom != null && data.priceTo != null) {
      return data.priceTo >= data.priceFrom;
    }
    return true;
  },
  {
    message: 'El precio final debe ser mayor o igual al precio inicial',
    path: ['priceTo'],
  }
);

export const updateProviderServiceSchema = z.object({
  priceFrom: z
    .number({ invalid_type_error: 'El precio inicial debe ser un número' })
    .min(0, 'El precio inicial no puede ser negativo')
    .optional()
    .nullable(),

  priceTo: z
    .number({ invalid_type_error: 'El precio final debe ser un número' })
    .min(0, 'El precio final no puede ser negativo')
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(500, 'La descripción no puede superar los 500 caracteres')
    .optional()
    .nullable(),

  isActive: z
    .boolean({ invalid_type_error: 'isActive debe ser booleano' })
    .optional(),
}).refine(
  (data) => {
    if (data.priceFrom != null && data.priceTo != null) {
      return data.priceTo >= data.priceFrom;
    }
    return true;
  },
  {
    message: 'El precio final debe ser mayor o igual al precio inicial',
    path: ['priceTo'],
  }
);