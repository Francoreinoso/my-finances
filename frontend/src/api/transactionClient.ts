import type {
  Transaction,
  CreateTransactionInput,
  TransactionChanges,
} from '@/types/transaction';
import { request } from '@/api/http';

export const transactionClient = {
  list(limit?: number): Promise<Transaction[]> {
    const query = limit !== undefined ? `?limit=${String(limit)}` : '';
    return request<Transaction[]>(`/transactions${query}`);
  },
  create(input: CreateTransactionInput): Promise<Transaction> {
    return request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  update(id: string, changes: TransactionChanges): Promise<void> {
    return request<void>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/transactions/${id}`, { method: 'DELETE' });
  },
};

export type TransactionClient = typeof transactionClient;
