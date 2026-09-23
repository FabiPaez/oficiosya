import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede superar los 50 caracteres')
    .optional(),

  lastName: z
    .string()
    .trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede superar los 50 caracteres')
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{6,20}$/, 'Formato de teléfono inválido')
    .optional()
    .nullable(),

  profileImageUrl: z
    .string()
    .trim()
    .url('La URL de imagen no es válida')
    .optional()
    .nullable(),

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
});