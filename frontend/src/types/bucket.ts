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
}
