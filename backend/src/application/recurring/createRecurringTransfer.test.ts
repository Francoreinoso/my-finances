import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { SqliteRecurringTransferRepository } from '@/infrastructure/persistence/SqliteRecurringTransferRepository.js';
import { RecurringTransferValidationError } from '@/domain/recurring/errors.js';
import { createRecurringTransfer } from './createRecurringTransfer.js';

describe('createRecurringTransfer', () => {
  let accounts: SqliteAccountRepository;
  let buckets: SqliteBucketRepository;
  let recurring: SqliteRecurringTransferRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    accounts = new SqliteAccountRepository(db);
    buckets = new SqliteBucketRepository(db);
    recurring = new SqliteRecurringTransferRepository(db);
  });

  it('crea un aporte recurrente con id, isActive=true y nextDueDate calculado', async () => {
    const created = await createRecurringTransfer(recurring, accounts, buckets, {
      name: 'Aporte test',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
      amount: 50000,
      bucketId: 'bk_mudanza',
      dayOfMonth: 8,
      today: '2026-05-24',
    });
    expect(created.id).toBeTruthy();
    expect(created.name).toBe('Aporte test');
    expect(created.amount).toBe(50000);
    expect(created.isActive).toBe(true);
    // Hoy es 24 mayo, día 8 ya pasó → próximo es 8 de junio.
    expect(created.nextDueDate).toBe('2026-06-08');
    expect(await recurring.findById(created.id)).not.toBeNull();
  });

  it('si el dayOfMonth todavía no llegó este mes, nextDueDate cae este mes', async () => {
    const created = await createRecurringTransfer(recurring, accounts, buckets, {
      name: 'Aporte temprano',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
      amount: 10000,
      bucketId: null,
      dayOfMonth: 15,
      today: '2026-05-10',
    });
    expect(created.nextDueDate).toBe('2026-05-15');
  });

  it('si el dayOfMonth no existe en el mes destino, recorta al último día', async () => {
    // Hoy es 28 feb 2027, día 31 ya pasó este mes (porque feb no tiene 31) → mes siguiente (marzo).
    // Marzo sí tiene 31 → nextDueDate = 31 marzo.
    const created = await createRecurringTransfer(recurring, accounts, buckets, {
      name: 'Aporte fin de mes',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
      amount: 10000,
      bucketId: null,
      dayOfMonth: 31,
      today: '2027-02-28',
    });
    expect(created.nextDueDate).toBe('2027-03-31');
  });

  it('permite bucketId null', async () => {
    const created = await createRecurringTransfer(recurring, accounts, buckets, {
      name: 'Aporte sin bucket',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
      amount: 10000,
      bucketId: null,
      dayOfMonth: 8,
      today: '2026-05-24',
    });
    expect(created.bucketId).toBeNull();
  });

  it('rechaza fromAccountId == toAccountId', async () => {
    await expect(
      createRecurringTransfer(recurring, accounts, buckets, {
        name: 'X',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_santander',
        amount: 10000,
        bucketId: null,
        dayOfMonth: 8,
        today: '2026-05-24',
      }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });

  it('rechaza una cuenta origen inexistente', async () => {
    await expect(
      createRecurringTransfer(recurring, accounts, buckets, {
        name: 'X',
        fromAccountId: 'acc_FANTASMA',
        toAccountId: 'acc_dap',
        amount: 10000,
        bucketId: null,
        dayOfMonth: 8,
        today: '2026-05-24',
      }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });

  it('rechaza un bucket inexistente', async () => {
    await expect(
      createRecurringTransfer(recurring, accounts, buckets, {
        name: 'X',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_dap',
        amount: 10000,
        bucketId: 'bk_FANTASMA',
        dayOfMonth: 8,
        today: '2026-05-24',
      }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });

  it('rechaza un monto cero o negativo', async () => {
    await expect(
      createRecurringTransfer(recurring, accounts, buckets, {
        name: 'X',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_dap',
        amount: 0,
        bucketId: null,
        dayOfMonth: 8,
        today: '2026-05-24',
      }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });

  it('rechaza dayOfMonth fuera de [1,31]', async () => {
    await expect(
      createRecurringTransfer(recurring, accounts, buckets, {
        name: 'X',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_dap',
        amount: 10000,
        bucketId: null,
        dayOfMonth: 32,
        today: '2026-05-24',
      }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });

  it('rechaza un nombre vacío', async () => {
    await expect(
      createRecurringTransfer(recurring, accounts, buckets, {
        name: '   ',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_dap',
        amount: 10000,
        bucketId: null,
        dayOfMonth: 8,
        today: '2026-05-24',
      }),
    ).rejects.toThrow(RecurringTransferValidationError);
  });
});
