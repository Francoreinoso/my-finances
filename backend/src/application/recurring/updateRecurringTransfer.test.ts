import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteRecurringTransferRepository } from '@/infrastructure/persistence/SqliteRecurringTransferRepository.js';
import {
  RecurringTransferNotFoundError,
  RecurringTransferValidationError,
} from '@/domain/recurring/errors.js';
import { updateRecurringTransfer } from './updateRecurringTransfer.js';

describe('updateRecurringTransfer', () => {
  let repo: SqliteRecurringTransferRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    repo = new SqliteRecurringTransferRepository(db);
  });

  it('cambia y persiste el monto', async () => {
    const updated = await updateRecurringTransfer(repo, 'rec_mudanza', { amount: 120000 });
    expect(updated.amount).toBe(120000);
    expect((await repo.findById('rec_mudanza'))?.amount).toBe(120000);
  });

  it('pausa un aporte', async () => {
    await updateRecurringTransfer(repo, 'rec_mudanza', { isActive: false });
    expect((await repo.findById('rec_mudanza'))?.isActive).toBe(false);
  });

  it('rechaza un aporte inexistente', async () => {
    await expect(
      updateRecurringTransfer(repo, 'rec_FANTASMA', { amount: 1 }),
    ).rejects.toThrow(RecurringTransferNotFoundError);
  });

  it('rechaza un monto inválido', async () => {
    await expect(
      updateRecurringTransfer(repo, 'rec_mudanza', { amount: 0 }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });
});
