import { z } from 'zod';

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'El color debe ser un hex tipo #rrggbb');

/** Body de POST /api/categories. */
export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['income', 'expense']),
  color: colorSchema,
});

/** Body de PATCH /api/categories/:id. El tipo no se edita. */
export const updateCategorySchema = z
  .object({
    name: z.string().min(1).optional(),
    color: colorSchema.optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateCategoryRequest = z.infer<typeof createCategorySchema>;
export type UpdateCategoryRequest = z.infer<typeof updateCategorySchema>;
