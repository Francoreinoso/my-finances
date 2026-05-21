import { TransactionNotFoundError } from '@/domain/transaction/errors.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';

/**
 * Borra una transacción. Verifica que exista primero, para que la API pueda
 * responder 404 en vez de aceptar en silencio un id que no existe.
 */
export async function deleteTransaction(
  transactions: TransactionRepository,
  id: string,
): Promise<void> {
  const existing = await transactions.findById(id);
  if (existing === null) {
    throw new TransactionNotFoundError(id);
  }
  await transactions.delete(id);
}
