/**
 * Aporte recurrente tal como lo devuelve GET /api/recurring: con su estado
 * `pending` (si la fecha ya venció) ya calculado por el backend.
 */
export interface RecurringTransfer {
  id: string;
  name: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  bucketId: string | null;
  dayOfMonth: number;
  nextDueDate: string;
  isActive: boolean;
  isArchived: boolean;
  pending: boolean;
}

/** Campos editables de un aporte recurrente (body de PATCH). */
export interface RecurringTransferChanges {
  amount?: number;
  isActive?: boolean;
}

/** Datos para crear un aporte recurrente nuevo (body de POST). */
export interface CreateRecurringTransferInput {
  name: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  bucketId: string | null;
  dayOfMonth: number;
}
