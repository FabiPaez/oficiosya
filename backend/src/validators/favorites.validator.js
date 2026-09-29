import { z } from 'zod';

export const addFavoriteSchema = z.object({
  providerId: z
    .string({ required_error: 'El providerId es requerido' })
    .uuid('El providerId debe ser un UUID válido'),
});