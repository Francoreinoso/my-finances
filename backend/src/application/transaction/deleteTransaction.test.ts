import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { TransactionNotFoundError } from '@/domain/transaction/errors.js';
import { deleteTransaction } from './deleteTransaction.js';

describe('deleteTransaction', () => {
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    transactions = new SqliteTransactionRepository(db);
  });

  it('borra una transacción existente', async () => {
    const tx = Transaction.create({
      date: '2026-05-10',
      amount: 5500,
      type: 'expense',
      fromAccountId: 'acc_santander',
    });
    await transactions.create(tx);
    await deleteTransaction(transactions, tx.id);
    expect(await transactions.findById(tx.id)).toBeNull();
  });

  it('rechaza una transacción inexistente', async () => {
    await expect(deleteTransaction(transactions, 'tx_FANTASMA')).rejects.toThrow(
      TransactionNotFoundError,
    );
  });
});
