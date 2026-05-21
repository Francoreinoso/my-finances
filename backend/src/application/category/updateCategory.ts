import type { Category, CategoryChanges } from '@/domain/category/Category.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import { CategoryNotFoundError } from '@/domain/category/errors.js';

/** Edita una categoría existente: nombre y color (el tipo no se edita). */
export async function updateCategory(
  categories: CategoryRepository,
  id: string,
  changes: CategoryChanges,
): Promise<Category> {
  const existing = await categories.findById(id);
  if (existing === null) {
    throw new CategoryNotFoundError(id);
  }

  const updated: Category = {
    id: existing.id,
    name: changes.name ?? existing.name,
    type: existing.type,
    color: changes.color ?? existing.color,
  };

  await categories.save(updated);
  return updated;
}
