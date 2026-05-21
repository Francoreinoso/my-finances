import type { RecurringTransfer, RecurringTransferChanges } from '@/types/recurring';
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
  /** Edita un aporte: cambia el monto y/o lo activa/pausa. */
  update(id: string, changes: RecurringTransferChanges): Promise<void> {
    return request<void>(`/recurring/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  },
};

export type RecurringClient = typeof recurringClient;
