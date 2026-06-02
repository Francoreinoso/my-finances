import type { Bucket, CreateBucketInput } from '@/domain/bucket/Bucket.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';

/**
 * Crea un bucket nuevo. La forma del input ya viene validada por Zod en el
 * borde HTTP; este caso de uso genera el id y persiste.
 */
export async function createBucket(
  buckets: BucketRepository,
  input: CreateBucketInput,
): Promise<Bucket> {
  const bucket: Bucket = {
    id: crypto.randomUUID(),
    name: input.name,
    targetAmount: input.targetAmount,
    targetDate: input.targetDate,
    accountId: input.accountId,
    isArchived: false,
  };
  await buckets.save(bucket);
  return bucket;
}
