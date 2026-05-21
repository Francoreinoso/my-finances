import type { Bucket, BucketChanges } from '@/domain/bucket/Bucket.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import { BucketNotFoundError } from '@/domain/bucket/errors.js';

/** Edita un bucket existente: nombre, monto objetivo, fecha o cuenta. */
export async function updateBucket(
  buckets: BucketRepository,
  id: string,
  changes: BucketChanges,
): Promise<Bucket> {
  const existing = await buckets.findById(id);
  if (existing === null) {
    throw new BucketNotFoundError(id);
  }

  // targetAmount/targetDate/accountId pueden ser null, así que se compara
  // contra undefined (no se puede usar ??): undefined = no se editó.
  const updated: Bucket = {
    id: existing.id,
    name: changes.name ?? existing.name,
    targetAmount:
      changes.targetAmount === undefined ? existing.targetAmount : changes.targetAmount,
    targetDate: changes.targetDate === undefined ? existing.targetDate : changes.targetDate,
    accountId: changes.accountId === undefined ? existing.accountId : changes.accountId,
  };

  await buckets.save(updated);
  return updated;
}
