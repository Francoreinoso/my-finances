import { z } from 'zod';

/** Body de POST /api/recurring. */
export const createRecurringSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  fromAccountId: z.string().min(1, 'La cuenta de origen es requerida'),
  toAccountId: z.string().min(1, 'La cuenta de destino es requerida'),
  amount: z.number().positive('El monto debe ser mayor a cero'),
  bucketId: z.string().min(1).nullable().default(null),
  dayOfMonth: z
    .number()
    .int('El día del mes debe ser entero')
    .min(1, 'El día del mes debe ser ≥ 1')
    .max(31, 'El día del mes debe ser ≤ 31'),
});

/**
 * Body de PATCH /api/recurring/:id. Ambos campos opcionales, pero al menos
 * uno debe venir — un PATCH vacío no tiene sentido.
 */
export const updateRecurringSchema = z
  .object({
    amount: z.number().positive('El monto debe ser mayor a cero').optional(),
    isActive: z.boolean().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateRecurringRequest = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringRequest = z.infer<typeof updateRecurringSchema>;
