import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { createCategory } from './createCategory.js';

describe('createCategory', () => {
  let categories: SqliteCategoryRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    categories = new SqliteCategoryRepository(db);
  });

  it('crea una categoría con id generado y la persiste', async () => {
    const category = await createCategory(categories, {
      name: 'Mascotas',
      type: 'expense',
      color: '#ff00ff',
    });
    expect(category.id).toBeTruthy();
    expect(category.type).toBe('expense');
    expect(await categories.findById(category.id)).not.toBeNull();
  });
});
