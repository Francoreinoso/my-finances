import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import {
  TransactionNotFoundError,
  TransactionValidationError,
} from '@/domain/transaction/errors.js';
import { updateTransaction } from './updateTransaction.js';

describe('updateTransaction', () => {
  let transactions: SqliteTransactionRepository;
  let categories: SqliteCategoryRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    transactions = new SqliteTransactionRepository(db);
    categories = new SqliteCategoryRepository(db);
  });

  const seedExpense = async (): Promise<Transaction> => {
    const tx = Transaction.create({
      date: '2026-05-10',
      amount: 5500,
      type: 'expense',
      fromAccountId: 'acc_santander',
      categoryId: 'cat_comida',
    });
    await transactions.create(tx);
    return tx;
  };

  it('edita y persiste el monto', async () => {
    const tx = await seedExpense();
    const updated = await updateTransaction(transactions, categories, tx.id, { amount: 5000 });
    expect(updated.amount).toBe(5000);
    expect((await transactions.findById(tx.id))?.amount).toBe(5000);
  });

  it('rechaza una transacción inexistente', async () => {
    await expect(
      updateTransaction(transactions, categories, 'tx_FANTASMA', { amount: 1 }),
    ).rejects.toThrow(TransactionNotFoundError);
  });

  it('rechaza una categoría de tipo incompatible (income en un expense)', async () => {
    const tx = await seedExpense();
    await expect(
      updateTransaction(transactions, categories, tx.id, { categoryId: 'cat_sueldo' }),
    ).rejects.toThrow(TransactionValidationError);
  });

  it('rechaza un monto inválido', async () => {
    const tx = await seedExpense();
    await expect(
      updateTransaction(transactions, categories, tx.id, { amount: 0 }),
    ).rejects.toThrow(TransactionValidationError);
  });
});
