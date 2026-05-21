import type { Transaction, TransactionChanges } from '@/domain/transaction/Transaction.js';
import { TransactionNotFoundError } from '@/domain/transaction/errors.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import { assertCategoryMatches } from './assertCategoryMatches.js';

/**
 * Edita una transacción: monto, fecha, categoría o descripción. La entidad
 * valida la forma (withChanges); este caso de uso valida que la transacción
 * exista y que la categoría —si cambió— exista y coincida con el tipo.
 */
export async function updateTransaction(
  transactions: TransactionRepository,
  categories: CategoryRepository,
  id: string,
  changes: TransactionChanges,
): Promise<Transaction> {
  const existing = await transactions.findById(id);
  if (existing === null) {
    throw new TransactionNotFoundError(id);
  }

  const updated = existing.withChanges(changes);
  await assertCategoryMatches(categories, updated.categoryId, updated.type);

  await transactions.update(updated);
  return updated;
}
