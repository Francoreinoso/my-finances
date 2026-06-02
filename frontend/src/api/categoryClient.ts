import type { Category, CreateCategoryInput, CategoryChanges } from '@/types/category';
import type { DeleteResult } from '@/types/delete';
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
  remove(id: string): Promise<DeleteResult> {
    return request<DeleteResult>(`/categories/${id}`, { method: 'DELETE' });
  },
};

export type CategoryClient = typeof categoryClient;
