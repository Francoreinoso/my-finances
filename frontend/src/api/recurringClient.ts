import type { RecurringTransfer } from '@/types/recurring';
import type { Transaction } from '@/types/transaction';
import { request } from '@/api/http';

export const recurringClient = {
  list(): Promise<RecurringTransfer[]> {
    return request<RecurringTransfer[]>('/recurring');
  },
  /** Confirma un aporte: el backend genera la transacción y avanza la fecha. */
  confirm(id: string): Promise<Transaction> {
    return request<Transaction>(`/recurring/${id}/confirm`, { method: 'POST' });
  },
};

export type RecurringClient = typeof recurringClient;
