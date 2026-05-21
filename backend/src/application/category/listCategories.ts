import type { Category } from '@/domain/category/Category.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';

export function listCategories(repo: CategoryRepository): Promise<Category[]> {
  return repo.findAll();
}
