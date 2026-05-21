import type { Category } from './Category.js';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  /** Inserta una categoría nueva o actualiza una existente (upsert por id). */
  save(category: Category): Promise<void>;
}
