import { z } from 'zod';

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

export type UpdateRecurringRequest = z.infer<typeof updateRecurringSchema>;
