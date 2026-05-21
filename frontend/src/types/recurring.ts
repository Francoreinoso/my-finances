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
  pending: boolean;
}
