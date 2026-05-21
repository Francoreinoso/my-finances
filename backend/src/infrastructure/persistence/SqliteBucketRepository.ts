import type { Bucket } from '@/domain/bucket/Bucket.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import { buckets, type BucketRow } from './schema.js';
import type { DB } from './db.js';

function toBucket(row: BucketRow): Bucket {
  return {
    id: row.id,
    name: row.name,
    targetAmount: row.targetAmount,
    targetDate: row.targetDate,
    accountId: row.accountId,
  };
}

export class SqliteBucketRepository implements BucketRepository {
  constructor(private readonly db: DB) {}

  findAll(): Promise<Bucket[]> {
    const rows = this.db.select().from(buckets).all();
    return Promise.resolve(rows.map(toBucket));
  }
}
