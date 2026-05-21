import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { createDb } from './db.js';
import { seedIfEmpty } from './seed.js';
import { SqliteAccountRepository } from './SqliteAccountRepository.js';
import { SqliteTransactionRepository } from './SqliteTransactionRepository.js';

describe('SqliteAccountRepository.findAllWithBalance', () => {
  let accounts: SqliteAccountRepository;
  let transactions: SqliteTransactionRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    accounts = new SqliteAccountRepository(db);
    transactions = new SqliteTransactionRepository(db);
  });

  const balanceOf = async (id: string): Promise<number> => {
    const list = await accounts.findAllWithBalance();
    const found = list.find((a) => a.id === id);
    if (!found) throw new Error(`cuenta ${id} no encontrada`);
    return found.balance;
  };

  it('arranca con las 4 cuentas del seed en balance cero', async () => {
    const list = await accounts.findAllWithBalance();
    expect(list).toHaveLength(4);
    expect(list.every((a) => a.balance === 0)).toBe(true);
  });

  it('un ingreso aumenta el balance de la cuenta destino', async () => {
    await transactions.create(
      Transaction.create({
        date: '2026-05-20',
        amount: 250000,
        type: 'income',
        toAccountId: 'acc_santander',
      }),
    );
    expect(await balanceOf('acc_santander')).toBe(250000);
  });

  it('un gasto disminuye el balance de la cuenta origen', async () => {
    await transactions.create(
      Transaction.create({
        date: '2026-05-20',
        amount: 250000,
        type: 'income',
        toAccountId: 'acc_santander',
      }),
    );
    await transactions.create(
      Transaction.create({
        date: '2026-05-20',
        amount: 5500,
        type: 'expense',
        fromAccountId: 'acc_santander',
      }),
    );
    expect(await balanceOf('acc_santander')).toBe(244500);
  });

  it('una transferencia mueve el balance de una cuenta a la otra', async () => {
    await transactions.create(
      Transaction.create({
        date: '2026-05-20',
        amount: 100000,
        type: 'income',
        toAccountId: 'acc_santander',
      }),
    );
    await transactions.create(
      Transaction.create({
        date: '2026-05-20',
        amount: 80000,
        type: 'transfer',
        fromAccountId: 'acc_santander',
        toAccountId: 'acc_dap',
      }),
    );
    expect(await balanceOf('acc_santander')).toBe(20000);
    expect(await balanceOf('acc_dap')).toBe(80000);
  });

  it('findById devuelve la cuenta existente y null para una inexistente', async () => {
    expect(await accounts.findById('acc_santander')).not.toBeNull();
    expect(await accounts.findById('acc_inexistente')).toBeNull();
  });
});
