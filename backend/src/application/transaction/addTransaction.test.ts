import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { TransactionValidationError } from '@/domain/transaction/errors.js';
import { addTransaction } from './addTransaction.js';

describe('addTransaction', () => {
  let accounts: SqliteAccountRepository;
  let categories: SqliteCategoryRepository;
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    accounts = new SqliteAccountRepository(db);
    categories = new SqliteCategoryRepository(db);
    transactions = new SqliteTransactionRepository(db);
  });

  it('crea y persiste un ingreso válido', async () => {
    const tx = await addTransaction(transactions, accounts, categories, {
      date: '2026-05-20',
      amount: 250000,
      type: 'income',
      toAccountId: 'acc_santander',
      categoryId: 'cat_sueldo',
    });
    expect(tx.amount).toBe(250000);
    const recent = await transactions.findRecent(10);
    expect(recent).toHaveLength(1);
    expect(recent[0]?.id).toBe(tx.id);
  });

  it('rechaza una cuenta inexistente', async () => {
    await expect(
      addTransaction(transactions, accounts, categories, {
        date: '2026-05-20',
        amount: 1000,
        type: 'expense',
        fromAccountId: 'acc_FANTASMA',
      }),
    ).rejects.toThrow(TransactionValidationError);
  });

  it('rechaza una categoría inexistente', async () => {
    await expect(
      addTransaction(transactions, accounts, categories, {
        date: '2026-05-20',
        amount: 1000,
        type: 'expense',
        fromAccountId: 'acc_santander',
        categoryId: 'cat_FANTASMA',
      }),
    ).rejects.toThrow(/no existe/);
  });

  it('rechaza una categoría de tipo incompatible con la transacción', async () => {
    await expect(
      addTransaction(transactions, accounts, categories, {
        date: '2026-05-20',
        amount: 1000,
        type: 'income',
        toAccountId: 'acc_santander',
        categoryId: 'cat_comida',
      }),
    ).rejects.toThrow(/tipo/);
  });

  it('no persiste la transacción si la validación referencial falla', async () => {
    await expect(
      addTransaction(transactions, accounts, categories, {
        date: '2026-05-20',
        amount: 1000,
        type: 'expense',
        fromAccountId: 'acc_FANTASMA',
      }),
    ).rejects.toThrow();
    expect(await transactions.findRecent(10)).toHaveLength(0);
  });

  it('crea y persiste una transferencia válida', async () => {
    const tx = await addTransaction(transactions, accounts, categories, {
      date: '2026-05-20',
      amount: 80000,
      type: 'transfer',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
    });
    expect(tx.type).toBe('transfer');
    expect(await transactions.findRecent(10)).toHaveLength(1);
  });

  it('rechaza una transferencia con cuenta de destino inexistente', async () => {
    await expect(
      addTransaction(transactions, accounts, categories, {
        date: '2026-05-20',
        amount: 80000,
        type: 'transfer',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_FANTASMA',
      }),
    ).rejects.toThrow(TransactionValidationError);
  });
});
