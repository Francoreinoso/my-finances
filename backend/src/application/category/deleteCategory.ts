import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import { CategoryNotFoundError } from '@/domain/category/errors.js';

export interface DeleteCategoryResult {
  mode: 'deleted' | 'archived';
}

/**
 * Elimina una categoría. Política híbrida:
 * - hard delete si no hay transacciones que la referencien
 * - soft delete (archivar) si hay transacciones — preserva la historia
 */
export async function deleteCategory(
  categories: CategoryRepository,
  id: string,
): Promise<DeleteCategoryResult> {
  const category = await categories.findById(id);
  if (category === null) {
    throw new CategoryNotFoundError(id);
  }

  const count = await categories.countTransactions(id);
  if (count > 0) {
    await categories.save({ ...category, isArchived: true });
    return { mode: 'archived' };
  }

  await categories.delete(id);
  return { mode: 'deleted' };
}
