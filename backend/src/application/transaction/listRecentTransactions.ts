import type { Transaction } from '@/domain/transaction/Transaction.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * Normaliza el límite pedido por el cliente: descarta valores inválidos,
 * aplica el default y topea en MAX_LIMIT para no devolver respuestas enormes.
 */
function normalizeLimit(requested: number | undefined): number {
  if (requested === undefined || !Number.isFinite(requested)) return DEFAULT_LIMIT;
  const floored = Math.floor(requested);
  if (floored < 1) return DEFAULT_LIMIT;
  return Math.min(floored, MAX_LIMIT);
}

export function listRecentTransactions(
  repo: TransactionRepository,
  requestedLimit?: number,
): Promise<Transaction[]> {
  return repo.findRecent(normalizeLimit(requestedLimit));
}
