import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { AccountNotFoundError, AccountValidationError } from '@/domain/account/errors.js';
import { createAccount } from './createAccount.js';
import { deleteAccount } from './deleteAccount.js';

describe('deleteAccount', () => {
  let accounts: SqliteAccountRepository;
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    accounts = new SqliteAccountRepository(db);
    transactions = new SqliteTransactionRepository(db);
  });

  it('hard delete cuando la cuenta no tiene ninguna referencia', async () => {
    const account = await createAccount(accounts, {
      name: 'Banco Estado',
      type: 'checking',
      currency: 'CLP',
    });
    const result = await deleteAccount(accounts, account.id);
    expect(result.mode).toBe('deleted');
    expect(await accounts.findById(account.id)).toBeNull();
  });

  it('soft delete (archivar) cuando hay transacciones referenciando la cuenta', async () => {
    // El seed deja acc_santander con balance 0 pero sin transacciones.
    // Creamos un ingreso y un gasto para que balance final = 0 y haya 2 txs.
    await transactions.create(
      Transaction.create({
        type: 'income',
        date: '2026-05-20',
        amount: 10000,
        toAccountId: 'acc_santander',
      }),
    );
    await transactions.create(
      Transaction.create({
        type: 'expense',
        date: '2026-05-20',
        amount: 10000,
        fromAccountId: 'acc_santander',
      }),
    );

    const result = await deleteAccount(accounts, 'acc_santander');
    expect(result.mode).toBe('archived');
    const account = await accounts.findById('acc_santander');
    expect(account?.isArchived).toBe(true);
  });

  it('bloquea (AccountValidationError) si la cuenta tiene balance != 0', async () => {
    await transactions.create(
      Transaction.create({
        type: 'income',
        date: '2026-05-20',
        amount: 50000,
        toAccountId: 'acc_santander',
      }),
    );
    await expect(deleteAccount(accounts, 'acc_santander')).rejects.toThrow(
      AccountValidationError,
    );
  });

  it('rechaza una cuenta inexistente con AccountNotFoundError', async () => {
    await expect(deleteAccount(accounts, 'acc_FANTASMA')).rejects.toThrow(AccountNotFoundError);
  });

  it('soft delete cuando la cuenta del seed está referenciada por buckets/recurring', async () => {
    // acc_dap está en bucket bk_mudanza Y en recurring rec_mudanza. Balance 0.
    const result = await deleteAccount(accounts, 'acc_dap');
    expect(result.mode).toBe('archived');
    expect((await accounts.findById('acc_dap'))?.isArchived).toBe(true);
  });
});
