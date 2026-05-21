import type { Category, CreateCategoryInput } from '@/domain/category/Category.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';

/** Crea una categoría nueva. El input ya viene validado por Zod en el borde. */
export async function createCategory(
  categories: CategoryRepository,
  input: CreateCategoryInput,
): Promise<Category> {
  const category: Category = {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    color: input.color,
  };
  await categories.save(category);
  return category;
}
