import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe estar en formato YYYY-MM-DD');

/** Body de POST /api/buckets. El monto objetivo, la fecha y la cuenta pueden ser null. */
export const createBucketSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  targetAmount: z.number().positive('El monto objetivo debe ser mayor a cero').nullable(),
  targetDate: isoDateSchema.nullable(),
  accountId: z.string().min(1).nullable(),
});

/** Body de PATCH /api/buckets/:id. Todo opcional, al menos un campo. */
export const updateBucketSchema = z
  .object({
    name: z.string().min(1).optional(),
    targetAmount: z.number().positive('El monto objetivo debe ser mayor a cero').nullable().optional(),
    targetDate: isoDateSchema.nullable().optional(),
    accountId: z.string().min(1).nullable().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: 'Debe enviar al menos un campo a actualizar',
  });

export type CreateBucketRequest = z.infer<typeof createBucketSchema>;
export type UpdateBucketRequest = z.infer<typeof updateBucketSchema>;
