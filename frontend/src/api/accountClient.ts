import type { Account, CreateAccountInput } from '@/types/account';
import type { DeleteResult } from '@/types/delete';
import { request } from '@/api/http';

export const accountClient = {
  list(): Promise<Account[]> {
    return request<Account[]>('/accounts');
  },
  create(input: CreateAccountInput): Promise<void> {
    return request<void>('/accounts', { method: 'POST', body: JSON.stringify(input) });
  },
  remove(id: string): Promise<DeleteResult> {
    return request<DeleteResult>(`/accounts/${id}`, { method: 'DELETE' });
  },
};

export type AccountClient = typeof accountClient;
