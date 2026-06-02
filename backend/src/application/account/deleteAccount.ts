import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import { AccountNotFoundError, AccountValidationError } from '@/domain/account/errors.js';

export interface DeleteAccountResult {
  /** `deleted` = hard delete (sin deps). `archived` = soft delete (con deps preservadas). */
  mode: 'deleted' | 'archived';
}

/**
 * Elimina una cuenta. Política híbrida:
 * - bloquea si la cuenta tiene saldo distinto de cero (vaciar antes)
 * - hard delete si no hay ninguna referencia (transactions, buckets, recurring)
 * - soft delete (archivar) si hay referencias — preserva la historia
 */
export async function deleteAccount(
  accounts: AccountRepository,
  id: string,
): Promise<DeleteAccountResult> {
  const account = await accounts.findById(id);
  if (account === null) {
    throw new AccountNotFoundError(id);
  }

  // Balance derivado: lo lee del listado para no duplicar la lógica de cálculo.
  const all = await accounts.findAllWithBalance();
  const withBalance = all.find((a) => a.id === id);
  if (withBalance && withBalance.balance !== 0) {
    throw new AccountValidationError(
      `La cuenta "${account.name}" tiene saldo distinto de cero; transferí o registrá los movimientos antes de eliminarla`,
    );
  }

  const refs = await accounts.findReferenceCounts(id);
  const hasDeps = refs.transactions > 0 || refs.buckets > 0 || refs.recurring > 0;

  if (hasDeps) {
    await accounts.save({ ...account, isArchived: true });
    return { mode: 'archived' };
  }

  await accounts.delete(id);
  return { mode: 'deleted' };
}
