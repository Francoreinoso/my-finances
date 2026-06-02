import { z } from 'zod';

/** Body de POST /api/accounts. */
export const createAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  type: z.enum(['checking', 'savings', 'investment', 'cash']),
  currency: z.enum(['CLP', 'UF']).default('CLP'),
});

export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
