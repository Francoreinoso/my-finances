import type { BucketWithProgress } from '@/domain/bucket/Bucket.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';

/**
 * Lista los buckets con su progreso.
 *
 * "El progreso de un bucket es el balance de su cuenta vinculada" es una regla
 * de NEGOCIO: por eso vive en este caso de uso y no en un repositorio. Ningún
 * repo conoce esa relación — el caso de uso cruza dos repos (buckets y cuentas)
 * y arma el resultado, tomando también la moneda de la cuenta.
 */
export async function listBucketsWithProgress(
  buckets: BucketRepository,
  accounts: AccountRepository,
): Promise<BucketWithProgress[]> {
  const [bucketList, accountBalances] = await Promise.all([
    buckets.findAll(),
    accounts.findAllWithBalance(),
  ]);

  const accountById = new Map(accountBalances.map((a) => [a.id, a]));

  return bucketList.map((bucket) => {
    const account = bucket.accountId === null ? undefined : accountById.get(bucket.accountId);
    return {
      ...bucket,
      progress: account?.balance ?? 0,
      currency: account?.currency ?? 'CLP',
    };
  });
}
