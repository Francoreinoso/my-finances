import { z } from 'zod';

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date debe estar en formato YYYY-MM-DD');
const amountSchema = z.number().positive('El monto debe ser mayor a cero');
const descriptionSchema = z.string().max(280).nullable().optional();

/**
 * Body de POST /api/transactions — unión discriminada por `type`.
 *
 * Ingreso y gasto comparten forma: una sola cuenta (`accountId`), que el
 * controller mapea a destino u origen. La transferencia tiene dos cuentas y
 * no lleva categoría. La unión discriminada hace que Zod —y TypeScript—
 * exijan exactamente los campos correctos según el tipo.
 */
const cashflowFields = {
  date: isoDateSchema,
  amount: amountSchema,
  accountId: z.string().min(1, 'accountId es requerido'),
  categoryId: z.string().min(1).nullable().optional(),
  description: descriptionSchema,
};

const incomeSchema = z.object({ type: z.literal('income'), ...cashflowFields });
const expenseSchema = z.object({ type: z.literal('expense'), ...cashflowFields });

const transferSchema = z.object({
  type: z.literal('transfer'),
  date: isoDateSchema,
  amount: amountSchema,
  fromAccountId: z.string().min(1, 'fromAccountId es requerido'),
  toAccountId: z.string().min(1, 'toAccountId es requerido'),
  description: descriptionSchema,
});

export const createTransactionSchema = z.discriminatedUnion('type', [
  incomeSchema,
  expenseSchema,
  transferSchema,
]);

export type CreateTransactionRequest = z.infer<typeof createTransactionSchema>;
