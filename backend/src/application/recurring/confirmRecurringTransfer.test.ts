import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteRecurringTransferRepository } from '@/infrastructure/persistence/SqliteRecurringTransferRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import {
  RecurringTransferNotFoundError,
  RecurringTransferNotPendingError,
} from '@/domain/recurring/errors.js';
import { confirmRecurringTransfer } from './confirmRecurringTransfer.js';
import { listRecurringTransfers } from './listRecurringTransfers.js';

// Fecha posterior al vencimiento del seed (2026-06-08): el aporte está pendiente.
const PENDING_DATE = '2026-06-10';
// Fecha anterior al vencimiento: el aporte todavía no se puede confirmar.
const NOT_DUE_DATE = '2026-05-20';

describe('confirmRecurringTransfer', () => {
  let recurring: SqliteRecurringTransferRepository;
  let transactions: SqliteTransactionRepository;
  let accounts: SqliteAccountRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    recurring = new SqliteRecurringTransferRepository(db);
    transactions = new SqliteTransactionRepository(db);
    accounts = new SqliteAccountRepository(db);
  });

  it('confirma un aporte pendiente: genera la transacción y avanza la fecha', async () => {
    const tx = await confirmRecurringTransfer(recurring, 'rec_mudanza', PENDING_DATE);
    expect(tx.type).toBe('transfer');
    expect(tx.amount).toBe(80000);
    expect(tx.recurringId).toBe('rec_mudanza');

    expect(await transactions.findRecent(10)).toHaveLength(1);

    const list = await listRecurringTransfers(recurring, PENDING_DATE);
    expect(list.find((r) => r.id === 'rec_mudanza')?.nextDueDate).toBe('2026-07-08');
  });

  it('confirmar mueve el balance entre las cuentas del aporte', async () => {
    await confirmRecurringTransfer(recurring, 'rec_mudanza', PENDING_DATE);
    const balances = await accounts.findAllWithBalance();
    const byId = new Map(balances.map((a) => [a.id, a.balance]));
    expect(byId.get('acc_santander')).toBe(-80000);
    expect(byId.get('acc_dap')).toBe(80000);
  });

  it('rechaza un aporte que no existe', async () => {
    await expect(
      confirmRecurringTransfer(recurring, 'rec_FANTASMA', PENDING_DATE),
    ).rejects.toThrow(RecurringTransferNotFoundError);
  });

  it('rechaza un aporte cuya fecha todavía no llegó', async () => {
    await expect(
      confirmRecurringTransfer(recurring, 'rec_mudanza', NOT_DUE_DATE),
    ).rejects.toThrow(RecurringTransferNotPendingError);
  });

  it('no genera ninguna transacción si el aporte no es confirmable', async () => {
    await expect(
      confirmRecurringTransfer(recurring, 'rec_mudanza', NOT_DUE_DATE),
    ).rejects.toThrow();
    expect(await transactions.findRecent(10)).toHaveLength(0);
  });
});
