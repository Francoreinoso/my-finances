import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe estar en formato YYYY-MM-DD');

/**
 * Body de POST /api/transactions.
 *
 * Fase 1: solo ingresos y gastos. El cliente manda UNA cuenta (`accountId`);
 * el controller la mapea a origen o destino según el tipo. Las transferencias
 * (con dos cuentas) llegan en la Fase 2.
 */
export const createTransactionSchema = z.object({
  date: isoDateSchema,
  amount: z.number().positive('El monto debe ser mayor a cero'),
  type: z.enum(['income', 'expense']),
  accountId: z.string().min(1, 'accountId es requerido'),
  categoryId: z.string().min(1).nullable().optional(),
  description: z.string().max(280).nullable().optional(),
});

export type CreateTransactionRequest = z.infer<typeof createTransactionSchema>;
