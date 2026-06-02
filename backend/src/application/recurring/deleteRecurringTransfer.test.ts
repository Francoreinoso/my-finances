import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteRecurringTransferRepository } from '@/infrastructure/persistence/SqliteRecurringTransferRepository.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { RecurringTransferNotFoundError } from '@/domain/recurring/errors.js';
import { confirmRecurringTransfer } from './confirmRecurringTransfer.js';
import { createRecurringTransfer } from './createRecurringTransfer.js';
import { deleteRecurringTransfer } from './deleteRecurringTransfer.js';

describe('deleteRecurringTransfer', () => {
  let recurring: SqliteRecurringTransferRepository;
  let accounts: SqliteAccountRepository;
  let buckets: SqliteBucketRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    recurring = new SqliteRecurringTransferRepository(db);
    accounts = new SqliteAccountRepository(db);
    buckets = new SqliteBucketRepository(db);
  });

  it('hard delete cuando el aporte nunca generó transacciones', async () => {
    const created = await createRecurringTransfer(recurring, accounts, buckets, {
      name: 'Aporte test',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
      amount: 10000,
      bucketId: null,
      dayOfMonth: 8,
      today: '2026-05-24',
    });
    const result = await deleteRecurringTransfer(recurring, created.id);
    expect(result.mode).toBe('deleted');
    expect(await recurring.findById(created.id)).toBeNull();
  });

  it('soft delete cuando el aporte tiene transacciones generadas por confirm', async () => {
    // rec_mudanza del seed: nextDueDate=2026-06-08, hoy=2026-06-09 → pendiente
    await confirmRecurringTransfer(recurring, 'rec_mudanza', '2026-06-09');
    const result = await deleteRecurringTransfer(recurring, 'rec_mudanza');
    expect(result.mode).toBe('archived');
    expect((await recurring.findById('rec_mudanza'))?.isArchived).toBe(true);
  });

  it('rechaza un aporte inexistente', async () => {
    await expect(deleteRecurringTransfer(recurring, 'rec_FANTASMA')).rejects.toThrow(
      RecurringTransferNotFoundError,
    );
  });
});
