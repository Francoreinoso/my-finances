import type {
  RecurringTransfer,
  RecurringTransferChanges,
} from '@/domain/recurring/RecurringTransfer.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import { RecurringTransferNotFoundError } from '@/domain/recurring/errors.js';

/**
 * Edita un aporte recurrente: cambia el monto y/o lo activa/pausa.
 * La validación del monto la hace la entidad (withChanges).
 */
export async function updateRecurringTransfer(
  repo: RecurringTransferRepository,
  id: string,
  changes: RecurringTransferChanges,
): Promise<RecurringTransfer> {
  const recurring = await repo.findById(id);
  if (recurring === null) {
    throw new RecurringTransferNotFoundError(id);
  }

  const updated = recurring.withChanges(changes);
  await repo.save(updated);
  return updated;
}
