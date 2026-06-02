import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { BucketNotFoundError } from '@/domain/bucket/errors.js';
import { createBucket } from './createBucket.js';
import { deleteBucket } from './deleteBucket.js';

describe('deleteBucket', () => {
  let buckets: SqliteBucketRepository;
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    buckets = new SqliteBucketRepository(db);
    transactions = new SqliteTransactionRepository(db);
  });

  it('hard delete cuando el bucket no tiene referencias', async () => {
    const bucket = await createBucket(buckets, {
      name: 'Viaje',
      targetAmount: 800000,
      targetDate: null,
      accountId: null,
    });
    const result = await deleteBucket(buckets, bucket.id);
    expect(result.mode).toBe('deleted');
    expect(await buckets.findById(bucket.id)).toBeNull();
  });

  it('soft delete cuando hay transacciones referenciándolo', async () => {
    await transactions.create(
      Transaction.create({
        type: 'transfer',
        date: '2026-05-20',
        amount: 50000,
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_dap',
        bucketId: 'bk_mudanza',
      }),
    );
    const result = await deleteBucket(buckets, 'bk_mudanza');
    expect(result.mode).toBe('archived');
    expect((await buckets.findById('bk_mudanza'))?.isArchived).toBe(true);
  });

  it('soft delete cuando hay recurring referenciándolo (sin transacciones)', async () => {
    // bk_emergencia del seed: tiene un recurring (rec_emergencia) pero sin transacciones todavía.
    const result = await deleteBucket(buckets, 'bk_emergencia');
    expect(result.mode).toBe('archived');
  });

  it('rechaza un bucket inexistente', async () => {
    await expect(deleteBucket(buckets, 'bk_FANTASMA')).rejects.toThrow(BucketNotFoundError);
  });
});
