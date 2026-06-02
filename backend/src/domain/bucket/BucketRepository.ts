import type { Bucket } from './Bucket.js';

/** Conteo de referencias a un bucket desde otras tablas. */
export interface BucketReferenceCounts {
  transactions: number;
  recurring: number;
}

export interface BucketRepository {
  findAll(): Promise<Bucket[]>;
  findById(id: string): Promise<Bucket | null>;
  /** Inserta un bucket nuevo o actualiza uno existente (upsert por id). */
  save(bucket: Bucket): Promise<void>;
  /** Elimina el bucket. NO valida dependencias — eso va en el caso de uso. */
  delete(id: string): Promise<void>;
  /** Cuántas filas en cada tabla apuntan a este bucket. */
  findReferenceCounts(id: string): Promise<BucketReferenceCounts>;
}
