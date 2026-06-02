import type { Currency } from '@/domain/account/Account.js';

/**
 * Un bucket es una meta de ahorro: un nombre, un monto objetivo y la cuenta
 * donde vive esa plata.
 */
export interface Bucket {
  id: string;
  name: string;
  targetAmount: number | null;
  targetDate: string | null;
  accountId: string | null;
  isArchived: boolean;
}

/**
 * Bucket con su progreso. El progreso NO se persiste: es el balance de la
 * cuenta vinculada, y la moneda es la de esa cuenta. Esa regla vive en el
 * caso de uso, no acá ni en el repositorio.
 */
export interface BucketWithProgress extends Bucket {
  progress: number;
  currency: Currency;
}

/** Datos para crear un bucket nuevo (el id lo genera el caso de uso). */
export interface CreateBucketInput {
  name: string;
  targetAmount: number | null;
  targetDate: string | null;
  accountId: string | null;
}

/** Campos editables de un bucket. */
export interface BucketChanges {
  name?: string;
  targetAmount?: number | null;
  targetDate?: string | null;
  accountId?: string | null;
}
