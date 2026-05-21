import { useCallback, useEffect, useState } from 'react';
import { categoryClient } from '@/api/categoryClient';
import type { Category, CreateCategoryInput, CategoryChanges } from '@/types/category';

export type CategoriesStatus = 'loading' | 'ready' | 'error';

export interface UseCategories {
  categories: Category[];
  status: CategoriesStatus;
  error: string | null;
  create: (input: CreateCategoryInput) => Promise<void>;
  update: (id: string, changes: CategoryChanges) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/** Carga las categorías y expone las acciones de crear y editar. */
export function useCategories(): UseCategories {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState<CategoriesStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setCategories(await categoryClient.list());
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // El error se propaga a propósito: el modal lo muestra y se queda abierto.
  const create = useCallback(async (input: CreateCategoryInput) => {
    await categoryClient.create(input);
    setCategories(await categoryClient.list());
  }, []);

  const update = useCallback(async (id: string, changes: CategoryChanges) => {
    await categoryClient.update(id, changes);
    setCategories(await categoryClient.list());
  }, []);

  return { categories, status, error, create, update };
}
