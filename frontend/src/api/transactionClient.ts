import type { Transaction, CreateTransactionInput } from '@/types/transaction';
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
};

export type TransactionClient = typeof transactionClient;
