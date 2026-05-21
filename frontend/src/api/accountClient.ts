import type { Account } from '@/types/account';
import { request } from '@/api/http';

export const accountClient = {
  list(): Promise<Account[]> {
    return request<Account[]>('/accounts');
  },
};

export type AccountClient = typeof accountClient;
