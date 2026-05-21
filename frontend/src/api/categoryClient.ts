import type { Category } from '@/types/category';
import { request } from '@/api/http';

export const categoryClient = {
  list(): Promise<Category[]> {
    return request<Category[]>('/categories');
  },
};

export type CategoryClient = typeof categoryClient;
