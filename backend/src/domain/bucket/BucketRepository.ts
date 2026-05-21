import type { Bucket } from './Bucket.js';

export interface BucketRepository {
  findAll(): Promise<Bucket[]>;
  findById(id: string): Promise<Bucket | null>;
  /** Inserta un bucket nuevo o actualiza uno existente (upsert por id). */
  save(bucket: Bucket): Promise<void>;
}
