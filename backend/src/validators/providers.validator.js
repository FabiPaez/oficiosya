import { z } from 'zod';

const categoryIdsSchema = z
  .array(
    z.number()
      .int('Cada categoría debe tener un ID entero')
      .positive('El ID de categoría debe ser positivo'),
  )
  .min(1, 'Seleccioná al menos una categoría')
  .max(10, 'Podés seleccionar hasta 10 categorías')
  .refine(
    (ids) => new Set(ids).size === ids.length,
    'No se permiten categorías duplicadas',
  );

export const registerProviderSchema = z.object({
  description: z
    .string()
    .trim()
    .max(1000, 'La descripción no puede superar los 1000 caracteres')
    .optional()
    .nullable(),

  city: z
    .string()
    .trim()
    .max(100, 'La ciudad no puede superar los 100 caracteres')
    .optional()
    .nullable(),

  department: z
    .string()
    .trim()
    .max(100, 'El departamento no puede superar los 100 caracteres')
    .optional()
    .nullable(),

  category_ids: categoryIdsSchema,

  coverage: z
    .enum(['SOLO CENTRO', 'RURAL', 'CENTRO + RURAL'])
    .optional()
    .nullable(),

  experience_years: z
    .string()
    .regex(
      /^(?:[0-9]|[1-3][0-9]|40|\+40)$/,
      'Los años de experiencia no son válidos',
    )
    .optional()
    .nullable(),

  schedule: z
    .string()
    .trim()
    .max(200, 'El horario no puede superar los 200 caracteres')
    .optional()
    .nullable(),

  available_days: z
    .array(
      z.enum([
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
      ]),
    )
    .max(7, 'No se pueden seleccionar más de 7 días')
    .optional(),
});


export const updateProviderProfileSchema = z.object({
  description: z
    .string()
    .trim()
    .max(1000, 'La descripción no puede superar los 1000 caracteres')
    .optional()
    .nullable(),

  city: z
    .string()
    .trim()
    .max(100, 'La ciudad no puede superar los 100 caracteres')
    .optional()
    .nullable(),

  department: z
    .string()
    .trim()
    .max(100, 'El departamento no puede superar los 100 caracteres')
    .optional()
    .nullable(),

  phone: z
    .string()
    .trim()
    .max(30, 'El teléfono no puede superar los 30 caracteres')
    .optional()
    .nullable(),

  category_ids: categoryIdsSchema.optional(),

  coverage: z
    .enum(['SOLO CENTRO', 'RURAL', 'CENTRO + RURAL'])
    .optional()
    .nullable(),

  experience_years: z
    .string()
    .regex(/^(?:[0-9]|[1-3][0-9]|40|\+40)$/, 'Los años de experiencia no son válidos')
    .optional()
    .nullable(),

  schedule: z
    .string()
    .trim()
    .max(200, 'El horario no puede superar los 200 caracteres')
    .optional()
    .nullable(),

  available_days: z
    .array(
      z.enum([
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
      ]),
    )
    .max(7, 'No se pueden seleccionar más de 7 días')
    .optional(),
});