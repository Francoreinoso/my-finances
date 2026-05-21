import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { CategoryNotFoundError } from '@/domain/category/errors.js';
import { createCategory } from './createCategory.js';
import { updateCategory } from './updateCategory.js';

describe('updateCategory', () => {
  let categories: SqliteCategoryRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    categories = new SqliteCategoryRepository(db);
  });

  it('edita nombre y color', async () => {
    const cat = await createCategory(categories, {
      name: 'Mascotas',
      type: 'expense',
      color: '#ff00ff',
    });
    const updated = await updateCategory(categories, cat.id, {
      name: 'Mascotas y vet',
      color: '#00ffff',
    });
    expect(updated.name).toBe('Mascotas y vet');
    expect(updated.color).toBe('#00ffff');
  });

  it('no cambia el tipo de la categoría', async () => {
    const cat = await createCategory(categories, {
      name: 'Mascotas',
      type: 'expense',
      color: '#ff00ff',
    });
    const updated = await updateCategory(categories, cat.id, { name: 'Otro' });
    expect(updated.type).toBe('expense');
  });

  it('rechaza una categoría inexistente', async () => {
    await expect(updateCategory(categories, 'cat_FANTASMA', { name: 'x' })).rejects.toThrow(
      CategoryNotFoundError,
    );
  });
});
