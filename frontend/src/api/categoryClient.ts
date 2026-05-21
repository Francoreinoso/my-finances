import type { Category, CreateCategoryInput, CategoryChanges } from '@/types/category';
import { request } from '@/api/http';

export const categoryClient = {
  list(): Promise<Category[]> {
    return request<Category[]>('/categories');
  },
  create(input: CreateCategoryInput): Promise<void> {
    return request<void>('/categories', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: string, changes: CategoryChanges): Promise<void> {
    return request<void>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    });
  },
};

export type CategoryClient = typeof categoryClient;
