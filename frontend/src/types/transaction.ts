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

/** Body de POST /api/transactions para un ingreso o gasto: una sola cuenta. */
export interface CashflowInput {
  type: 'income' | 'expense';
  date: string;
  amount: number;
  accountId: string;
  categoryId?: string | null;
  description?: string | null;
}

/** Body de POST /api/transactions para una transferencia: dos cuentas. */
export interface TransferInput {
  type: 'transfer';
  date: string;
  amount: number;
  fromAccountId: string;
  toAccountId: string;
  description?: string | null;
}

/** Unión discriminada por `type` — refleja el schema del backend. */
export type CreateTransactionInput = CashflowInput | TransferInput;

/** Campos editables de una transacción (body de PATCH). El tipo y las cuentas no se editan. */
export interface TransactionChanges {
  amount?: number;
  date?: string;
  categoryId?: string | null;
  description?: string | null;
}
