import { z } from 'zod';

export const createReviewSchema = z.object({
  requestId: z
    .number({ required_error: 'El requestId es requerido', invalid_type_error: 'El requestId debe ser un número' })
    .int('El requestId debe ser un entero')
    .positive('El requestId debe ser mayor a 0'),

  rating: z
    .number({ required_error: 'El rating es requerido', invalid_type_error: 'El rating debe ser un número' })
    .int('El rating debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5'),

  comment: z
    .string()
    .trim()
    .max(1000, 'El comentario no puede superar los 1000 caracteres')
    .optional()
    .nullable(),
});