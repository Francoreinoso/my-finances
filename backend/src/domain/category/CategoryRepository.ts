import type { Category } from './Category.js';

export interface CategoryRepository {
  findAll(): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  /** Inserta una categoría nueva o actualiza una existente (upsert por id). */
  save(category: Category): Promise<void>;
  /** Elimina la categoría. NO valida dependencias — eso va en el caso de uso. */
  delete(id: string): Promise<void>;
  /** Cuántas transacciones referencian esta categoría. */
  countTransactions(id: string): Promise<number>;
}
