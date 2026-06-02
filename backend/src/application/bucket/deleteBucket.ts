import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import { BucketNotFoundError } from '@/domain/bucket/errors.js';

export interface DeleteBucketResult {
  mode: 'deleted' | 'archived';
}

/**
 * Elimina un bucket. Política híbrida:
 * - hard delete si no hay transacciones ni recurring que lo referencien
 * - soft delete (archivar) si hay referencias — preserva la historia
 */
export async function deleteBucket(
  buckets: BucketRepository,
  id: string,
): Promise<DeleteBucketResult> {
  const bucket = await buckets.findById(id);
  if (bucket === null) {
    throw new BucketNotFoundError(id);
  }

  const refs = await buckets.findReferenceCounts(id);
  const hasDeps = refs.transactions > 0 || refs.recurring > 0;

  if (hasDeps) {
    await buckets.save({ ...bucket, isArchived: true });
    return { mode: 'archived' };
  }

  await buckets.delete(id);
  return { mode: 'deleted' };
}
