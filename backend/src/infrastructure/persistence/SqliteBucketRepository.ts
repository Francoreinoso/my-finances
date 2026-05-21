import { eq } from 'drizzle-orm';
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

  findById(id: string): Promise<Bucket | null> {
    const row = this.db.select().from(buckets).where(eq(buckets.id, id)).get();
    return Promise.resolve(row ? toBucket(row) : null);
  }

  save(bucket: Bucket): Promise<void> {
    const values = {
      id: bucket.id,
      name: bucket.name,
      targetAmount: bucket.targetAmount,
      targetDate: bucket.targetDate,
      accountId: bucket.accountId,
    };
    this.db
      .insert(buckets)
      .values(values)
      .onConflictDoUpdate({
        target: buckets.id,
        set: {
          name: values.name,
          targetAmount: values.targetAmount,
          targetDate: values.targetDate,
          accountId: values.accountId,
        },
      })
      .run();
    return Promise.resolve();
  }
}
