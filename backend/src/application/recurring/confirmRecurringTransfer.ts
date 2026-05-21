import { Transaction } from '@/domain/transaction/Transaction.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import {
  RecurringTransferNotFoundError,
  RecurringTransferNotPendingError,
} from '@/domain/recurring/errors.js';

/**
 * Confirma un aporte recurrente: el usuario ya hizo la transferencia en el
 * banco, esto la registra. Genera la transacción (fechada en la fecha de
 * vencimiento) y avanza el aporte al mes siguiente — atómicamente.
 */
export async function confirmRecurringTransfer(
  repo: RecurringTransferRepository,
  id: string,
  today: string,
): Promise<Transaction> {
  const recurring = await repo.findById(id);
  if (recurring === null) {
    throw new RecurringTransferNotFoundError(id);
  }
  if (!recurring.isPending(today)) {
    throw new RecurringTransferNotPendingError(id);
  }

  const transaction = Transaction.create({
    type: 'transfer',
    date: recurring.nextDueDate,
    amount: recurring.amount,
    fromAccountId: recurring.fromAccountId,
    toAccountId: recurring.toAccountId,
    bucketId: recurring.bucketId,
    description: recurring.name,
    recurringId: recurring.id,
  });

  await repo.confirm(transaction, recurring.advanced());
  return transaction;
}
