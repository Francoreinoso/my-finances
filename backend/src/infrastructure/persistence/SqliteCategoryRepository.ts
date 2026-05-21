import { eq } from 'drizzle-orm';
import type { Category } from '@/domain/category/Category.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import { categories, type CategoryRow } from './schema.js';
import type { DB } from './db.js';

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
  };
}

export class SqliteCategoryRepository implements CategoryRepository {
  constructor(private readonly db: DB) {}

  findAll(): Promise<Category[]> {
    const rows = this.db.select().from(categories).all();
    return Promise.resolve(rows.map(toCategory));
  }

  findById(id: string): Promise<Category | null> {
    const row = this.db.select().from(categories).where(eq(categories.id, id)).get();
    return Promise.resolve(row ? toCategory(row) : null);
  }

  save(category: Category): Promise<void> {
    const values = {
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color,
    };
    this.db
      .insert(categories)
      .values(values)
      .onConflictDoUpdate({
        target: categories.id,
        set: { name: values.name, type: values.type, color: values.color },
      })
      .run();
    return Promise.resolve();
  }
}
