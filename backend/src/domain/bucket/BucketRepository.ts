import type { Bucket } from './Bucket.js';

export interface BucketRepository {
  findAll(): Promise<Bucket[]>;
}
