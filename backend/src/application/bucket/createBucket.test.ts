import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { createBucket } from './createBucket.js';

describe('createBucket', () => {
  let buckets: SqliteBucketRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    buckets = new SqliteBucketRepository(db);
  });

  it('crea un bucket con id generado y lo persiste', async () => {
    const bucket = await createBucket(buckets, {
      name: 'Viaje',
      targetAmount: 800000,
      targetDate: '2027-01-01',
      accountId: 'acc_streep',
    });
    expect(bucket.id).toBeTruthy();
    expect(bucket.name).toBe('Viaje');
    expect(await buckets.findById(bucket.id)).not.toBeNull();
  });

  it('acepta un bucket sin meta ni cuenta', async () => {
    const bucket = await createBucket(buckets, {
      name: 'Sin meta',
      targetAmount: null,
      targetDate: null,
      accountId: null,
    });
    expect(bucket.targetAmount).toBeNull();
    expect(bucket.accountId).toBeNull();
  });
});
