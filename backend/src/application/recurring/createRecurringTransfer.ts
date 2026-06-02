import {
  RecurringTransfer,
  type CreateRecurringTransferInput,
} from '@/domain/recurring/RecurringTransfer.js';
import { RecurringTransferValidationError } from '@/domain/recurring/errors.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';

async function assertAccountExistsAndActive(
  repo: AccountRepository,
  accountId: string,
  rol: string,
): Promise<void> {
  const account = await repo.findById(accountId);
  if (account === null) {
    throw new RecurringTransferValidationError(`La cuenta de ${rol} "${accountId}" no existe`);
  }
  if (account.isArchived) {
    throw new RecurringTransferValidationError(
      `La cuenta de ${rol} "${account.name}" está archivada`,
    );
  }
}

async function assertBucketExists(
  repo: BucketRepository,
  bucketId: string | null,
): Promise<void> {
  if (bucketId === null) return;
  const bucket = await repo.findById(bucketId);
  if (bucket === null) {
    throw new RecurringTransferValidationError(`El bucket "${bucketId}" no existe`);
  }
}

/**
 * Crea un aporte recurrente. La entidad valida la FORMA (nombre, monto,
 * dayOfMonth, cuentas distintas); este caso de uso valida la INTEGRIDAD
 * REFERENCIAL — que las cuentas existan, estén activas, y el bucket exista
 * si se referenció.
 */
export async function createRecurringTransfer(
  recurring: RecurringTransferRepository,
  accounts: AccountRepository,
  buckets: BucketRepository,
  input: CreateRecurringTransferInput,
): Promise<RecurringTransfer> {
  const transfer = RecurringTransfer.create(input);

  await assertAccountExistsAndActive(accounts, transfer.fromAccountId, 'origen');
  await assertAccountExistsAndActive(accounts, transfer.toAccountId, 'destino');
  await assertBucketExists(buckets, transfer.bucketId);

  await recurring.save(transfer);
  return transfer;
}
