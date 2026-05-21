export type TransactionType = 'income' | 'expense' | 'transfer';

/** Transacción tal como la devuelve la API. */
export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  fromAccountId: string | null;
  toAccountId: string | null;
  categoryId: string | null;
  bucketId: string | null;
  description: string;
  recurringId: string | null;
  createdAt: string;
}

/**
 * Body de POST /api/transactions. Fase 1: solo ingreso o gasto, con UNA
 * cuenta — el backend la mapea a origen o destino según el tipo.
 */
export interface CreateTransactionInput {
  date: string;
  amount: number;
  type: 'income' | 'expense';
  accountId: string;
  categoryId?: string | null;
  description?: string | null;
}
