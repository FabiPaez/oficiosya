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
});
