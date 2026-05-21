import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { listBucketsWithProgress } from './listBucketsWithProgress.js';

describe('listBucketsWithProgress', () => {
  let buckets: SqliteBucketRepository;
  let accounts: SqliteAccountRepository;
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    buckets = new SqliteBucketRepository(db);
    accounts = new SqliteAccountRepository(db);
    transactions = new SqliteTransactionRepository(db);
  });

  it('lista los 3 buckets del seed', async () => {
    expect(await listBucketsWithProgress(buckets, accounts)).toHaveLength(3);
  });

  it('arranca con todos los buckets en progreso cero', async () => {
    const list = await listBucketsWithProgress(buckets, accounts);
    expect(list.every((b) => b.progress === 0)).toBe(true);
  });

  it('el progreso de un bucket es el balance de su cuenta vinculada', async () => {
    await transactions.create(
      Transaction.create({
        date: '2026-05-20',
        amount: 80000,
        type: 'income',
        toAccountId: 'acc_dap',
      }),
    );
    const list = await listBucketsWithProgress(buckets, accounts);
    expect(list.find((b) => b.id === 'bk_mudanza')?.progress).toBe(80000);
    expect(list.find((b) => b.id === 'bk_emergencia')?.progress).toBe(0);
  });

  it('cada bucket lleva la moneda de su cuenta vinculada', async () => {
    const list = await listBucketsWithProgress(buckets, accounts);
    expect(list.every((b) => b.currency === 'CLP')).toBe(true);
  });
});
