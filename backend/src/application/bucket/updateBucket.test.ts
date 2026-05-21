import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { BucketNotFoundError } from '@/domain/bucket/errors.js';
import { createBucket } from './createBucket.js';
import { updateBucket } from './updateBucket.js';

describe('updateBucket', () => {
  let buckets: SqliteBucketRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    buckets = new SqliteBucketRepository(db);
  });

  it('edita y persiste los cambios', async () => {
    const created = await createBucket(buckets, {
      name: 'Viaje',
      targetAmount: 800000,
      targetDate: null,
      accountId: null,
    });
    const updated = await updateBucket(buckets, created.id, {
      name: 'Viaje a Japón',
      targetAmount: 1200000,
    });
    expect(updated.name).toBe('Viaje a Japón');
    expect(updated.targetAmount).toBe(1200000);
    expect((await buckets.findById(created.id))?.name).toBe('Viaje a Japón');
  });

  it('deja intacto lo que no se cambia', async () => {
    const created = await createBucket(buckets, {
      name: 'Viaje',
      targetAmount: 800000,
      targetDate: '2027-01-01',
      accountId: 'acc_streep',
    });
    const updated = await updateBucket(buckets, created.id, { name: 'Otro nombre' });
    expect(updated.targetAmount).toBe(800000);
    expect(updated.targetDate).toBe('2027-01-01');
  });

  it('permite poner el monto objetivo en null', async () => {
    const created = await createBucket(buckets, {
      name: 'Viaje',
      targetAmount: 800000,
      targetDate: null,
      accountId: null,
    });
    const updated = await updateBucket(buckets, created.id, { targetAmount: null });
    expect(updated.targetAmount).toBeNull();
  });

  it('rechaza un bucket inexistente', async () => {
    await expect(updateBucket(buckets, 'bk_FANTASMA', { name: 'x' })).rejects.toThrow(
      BucketNotFoundError,
    );
  });
});
