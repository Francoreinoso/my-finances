import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { createApp } from './server.js';

describe('API HTTP', () => {
  let app: Express;

  beforeEach(() => {
    const db = createDb(':memory:');
    seedIfEmpty(db);
    app = createApp({
      accountRepository: new SqliteAccountRepository(db),
      categoryRepository: new SqliteCategoryRepository(db),
      transactionRepository: new SqliteTransactionRepository(db),
      corsOrigin: '*',
    });
  });

  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/accounts devuelve las 4 cuentas con balance cero', async () => {
    const res = await request(app).get('/api/accounts');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(4);
    expect((res.body as { balance: number }[]).every((a) => a.balance === 0)).toBe(true);
  });

  it('GET /api/categories devuelve las categorías del seed', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
  });

  it('POST /api/transactions crea un ingreso y actualiza el balance', async () => {
    const res = await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: 250000,
      type: 'income',
      accountId: 'acc_santander',
      categoryId: 'cat_sueldo',
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      amount: 250000,
      type: 'income',
      toAccountId: 'acc_santander',
    });

    const accountsRes = await request(app).get('/api/accounts');
    const santander = (accountsRes.body as { id: string; balance: number }[]).find(
      (a) => a.id === 'acc_santander',
    );
    expect(santander?.balance).toBe(250000);
  });

  it('POST /api/transactions con cuenta inexistente devuelve 400', async () => {
    const res = await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: 1000,
      type: 'expense',
      accountId: 'acc_FANTASMA',
    });
    expect(res.status).toBe(400);
  });

  it('POST /api/transactions con monto negativo lo rechaza Zod con 400', async () => {
    const res = await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: -5,
      type: 'expense',
      accountId: 'acc_santander',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/transactions devuelve las transacciones creadas', async () => {
    await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: 1000,
      type: 'expense',
      accountId: 'acc_santander',
      categoryId: 'cat_comida',
    });
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});
