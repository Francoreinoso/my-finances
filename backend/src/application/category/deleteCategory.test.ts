import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { CategoryNotFoundError } from '@/domain/category/errors.js';
import { createCategory } from './createCategory.js';
import { deleteCategory } from './deleteCategory.js';

describe('deleteCategory', () => {
  let categories: SqliteCategoryRepository;
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    categories = new SqliteCategoryRepository(db);
    transactions = new SqliteTransactionRepository(db);
  });

  it('hard delete cuando ninguna transacción referencia la categoría', async () => {
    const cat = await createCategory(categories, {
      name: 'Mascotas',
      type: 'expense',
      color: '#ff00ff',
    });
    const result = await deleteCategory(categories, cat.id);
    expect(result.mode).toBe('deleted');
    expect(await categories.findById(cat.id)).toBeNull();
  });

  it('soft delete cuando hay transacciones referenciándola', async () => {
    await transactions.create(
      Transaction.create({
        type: 'expense',
        date: '2026-05-20',
        amount: 5000,
        fromAccountId: 'acc_santander',
        categoryId: 'cat_comida',
      }),
    );
    const result = await deleteCategory(categories, 'cat_comida');
    expect(result.mode).toBe('archived');
    expect((await categories.findById('cat_comida'))?.isArchived).toBe(true);
  });

  it('rechaza una categoría inexistente', async () => {
    await expect(deleteCategory(categories, 'cat_FANTASMA')).rejects.toThrow(
      CategoryNotFoundError,
    );
  });
});
