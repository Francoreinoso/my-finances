import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { Transaction } from '@/domain/transaction/Transaction.js';
import { exportTransactionsCsv } from './exportTransactionsCsv.js';

describe('exportTransactionsCsv', () => {
  let transactions: SqliteTransactionRepository;
  let accounts: SqliteAccountRepository;
  let categories: SqliteCategoryRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    transactions = new SqliteTransactionRepository(db);
    accounts = new SqliteAccountRepository(db);
    categories = new SqliteCategoryRepository(db);
  });

  it('arma un CSV con encabezado y una fila por transacción', async () => {
    await transactions.create(
      Transaction.create({
        type: 'expense',
        date: '2026-05-10',
        amount: 5500,
        fromAccountId: 'acc_santander',
        categoryId: 'cat_comida',
      }),
    );
    const csv = await exportTransactionsCsv(transactions, accounts, categories);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(
      'Fecha,Tipo,Monto,Cuenta origen,Cuenta destino,Categoría,Descripción',
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Gasto');
    expect(lines[1]).toContain('5500');
  });

  it('resuelve nombres de cuenta y categoría, no ids', async () => {
    await transactions.create(
      Transaction.create({
        type: 'expense',
        date: '2026-05-10',
        amount: 1000,
        fromAccountId: 'acc_santander',
        categoryId: 'cat_comida',
      }),
    );
    const csv = await exportTransactionsCsv(transactions, accounts, categories);
    expect(csv).not.toContain('acc_santander');
    expect(csv).not.toContain('cat_comida');
    expect(csv).toContain('Comida');
  });

  it('entrecomilla los valores que tienen coma', async () => {
    await transactions.create(
      Transaction.create({
        type: 'expense',
        date: '2026-05-10',
        amount: 1000,
        fromAccountId: 'acc_santander',
        description: 'Almuerzo, con coma',
      }),
    );
    const csv = await exportTransactionsCsv(transactions, accounts, categories);
    expect(csv).toContain('"Almuerzo, con coma"');
  });

  it('devuelve solo el encabezado si no hay transacciones', async () => {
    const csv = await exportTransactionsCsv(transactions, accounts, categories);
    expect(csv.split('\n')).toHaveLength(1);
  });
});
