import type { RecurringTransferView } from '@/domain/recurring/RecurringTransfer.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';

/**
 * Lista los aportes recurrentes con su estado `pending` calculado contra
 * `today`. Recibir "hoy" como parámetro (en vez de leer el reloj acá) hace
 * el caso de uso determinista y testeable.
 */
export async function listRecurringTransfers(
  repo: RecurringTransferRepository,
  today: string,
): Promise<RecurringTransferView[]> {
  const list = await repo.findAll();
  return list.map((rt) => ({ ...rt.toJSON(), pending: rt.isPending(today) }));
}
