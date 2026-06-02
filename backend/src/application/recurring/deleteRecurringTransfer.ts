import { RecurringTransfer } from '@/domain/recurring/RecurringTransfer.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import { RecurringTransferNotFoundError } from '@/domain/recurring/errors.js';

export interface DeleteRecurringTransferResult {
  mode: 'deleted' | 'archived';
}

/**
 * Elimina un aporte recurrente. Política híbrida:
 * - hard delete si nunca generó transacciones (vía confirm)
 * - soft delete (archivar) si tiene transacciones — preserva la historia
 */
export async function deleteRecurringTransfer(
  recurring: RecurringTransferRepository,
  id: string,
): Promise<DeleteRecurringTransferResult> {
  const transfer = await recurring.findById(id);
  if (transfer === null) {
    throw new RecurringTransferNotFoundError(id);
  }

  const count = await recurring.countTransactions(id);
  if (count > 0) {
    const archived = RecurringTransfer.fromPersistence({ ...transfer.toJSON(), isArchived: true });
    await recurring.save(archived);
    return { mode: 'archived' };
  }

  await recurring.delete(id);
  return { mode: 'deleted' };
}
