import type { Currency } from '@/types/account';

/**
 * Bucket tal como lo devuelve GET /api/buckets: con su progreso (el balance
 * de la cuenta vinculada) y la moneda de esa cuenta, ya resueltos por el backend.
 */
export interface Bucket {
  id: string;
  name: string;
  targetAmount: number | null;
  targetDate: string | null;
  accountId: string | null;
  progress: number;
  currency: Currency;
  isArchived: boolean;
}

/** Datos para crear un bucket (body de POST). */
export interface CreateBucketInput {
  name: string;
  targetAmount: number | null;
  targetDate: string | null;
  accountId: string | null;
}

/** Campos editables de un bucket (body de PATCH). */
export type BucketChanges = Partial<CreateBucketInput>;
