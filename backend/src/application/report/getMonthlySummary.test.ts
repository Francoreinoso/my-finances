import { describe, it, expect, beforeEach } from 'vitest';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { SqliteReportRepository } from '@/infrastructure/persistence/SqliteReportRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { Transaction, type CreateTransactionInput } from '@/domain/transaction/Transaction.js';
import { getMonthlySummary } from './getMonthlySummary.js';

describe('getMonthlySummary', () => {
  let transactions: SqliteTransactionRepository;
  let reports: SqliteReportRepository;
  let categories: SqliteCategoryRepository;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    transactions = new SqliteTransactionRepository(db);
    reports = new SqliteReportRepository(db);
    categories = new SqliteCategoryRepository(db);
  });

  const add = (input: CreateTransactionInput): Promise<void> =>
    transactions.create(Transaction.create(input));

  it('suma ingresos y gastos del mes y calcula el neto', async () => {
    await add({ type: 'income', date: '2026-05-08', amount: 250000, toAccountId: 'acc_santander' });
    await add({ type: 'expense', date: '2026-05-10', amount: 50000, fromAccountId: 'acc_santander' });
    const summary = await getMonthlySummary(reports, categories, '2026-05');
    expect(summary.income).toBe(250000);
    expect(summary.expense).toBe(50000);
    expect(summary.net).toBe(200000);
  });

  it('calcula la tasa de ahorro como net / income', async () => {
    await add({ type: 'income', date: '2026-05-08', amount: 250000, toAccountId: 'acc_santander' });
    await add({ type: 'expense', date: '2026-05-10', amount: 50000, fromAccountId: 'acc_santander' });
    const summary = await getMonthlySummary(reports, categories, '2026-05');
    expect(summary.savingsRate).toBeCloseTo(0.8);
  });

  it('NO cuenta las transferencias como ingreso ni gasto', async () => {
    await add({ type: 'income', date: '2026-05-08', amount: 100000, toAccountId: 'acc_santander' });
    await add({
      type: 'transfer',
      date: '2026-05-12',
      amount: 80000,
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
    });
    const summary = await getMonthlySummary(reports, categories, '2026-05');
    expect(summary.income).toBe(100000);
    expect(summary.expense).toBe(0);
  });

  it('agrupa el gasto por categoría, resuelto y de mayor a menor', async () => {
    await add({
      type: 'expense',
      date: '2026-05-10',
      amount: 20000,
      fromAccountId: 'acc_santander',
      categoryId: 'cat_transporte',
    });
    await add({
      type: 'expense',
      date: '2026-05-11',
      amount: 50000,
      fromAccountId: 'acc_santander',
      categoryId: 'cat_comida',
    });
    const summary = await getMonthlySummary(reports, categories, '2026-05');
    expect(summary.byCategory).toHaveLength(2);
    expect(summary.byCategory[0]?.categoryName).toBe('Comida');
    expect(summary.byCategory[0]?.total).toBe(50000);
    expect(summary.byCategory[1]?.categoryName).toBe('Transporte');
  });

  it('un mes sin movimientos da todo en cero y tasa de ahorro 0', async () => {
    const summary = await getMonthlySummary(reports, categories, '2026-09');
    expect(summary.income).toBe(0);
    expect(summary.expense).toBe(0);
    expect(summary.savingsRate).toBe(0);
    expect(summary.byCategory).toEqual([]);
  });
});
