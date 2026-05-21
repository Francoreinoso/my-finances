import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { SqliteRecurringTransferRepository } from '@/infrastructure/persistence/SqliteRecurringTransferRepository.js';
import { SqliteReportRepository } from '@/infrastructure/persistence/SqliteReportRepository.js';
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
      bucketRepository: new SqliteBucketRepository(db),
      recurringRepository: new SqliteRecurringTransferRepository(db),
      reportRepository: new SqliteReportRepository(db),
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

  it('GET /api/buckets devuelve los 3 buckets con su progreso', async () => {
    const res = await request(app).get('/api/buckets');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect((res.body as { progress: number }[]).every((b) => b.progress === 0)).toBe(true);
  });

  it('POST /api/transactions crea una transferencia y mueve ambos balances', async () => {
    await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: 100000,
      type: 'income',
      accountId: 'acc_santander',
    });
    const res = await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: 80000,
      type: 'transfer',
      fromAccountId: 'acc_santander',
      toAccountId: 'acc_dap',
    });
    expect(res.status).toBe(201);

    const accountsRes = await request(app).get('/api/accounts');
    const byId = new Map(
      (accountsRes.body as { id: string; balance: number }[]).map((a) => [a.id, a.balance]),
    );
    expect(byId.get('acc_santander')).toBe(20000);
    expect(byId.get('acc_dap')).toBe(80000);
  });

  it('POST /api/transactions transferencia sin cuenta destino devuelve 400', async () => {
    const res = await request(app).post('/api/transactions').send({
      date: '2026-05-20',
      amount: 80000,
      type: 'transfer',
      fromAccountId: 'acc_santander',
    });
    expect(res.status).toBe(400);
  });

  it('GET /api/recurring devuelve los 3 aportes recurrentes', async () => {
    const res = await request(app).get('/api/recurring');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('POST /api/recurring/:id/confirm de un aporte inexistente devuelve 404', async () => {
    const res = await request(app).post('/api/recurring/rec_FANTASMA/confirm');
    expect(res.status).toBe(404);
  });

  it('GET /api/reports/monthly devuelve el resumen del mes', async () => {
    await request(app).post('/api/transactions').send({
      type: 'income',
      date: '2026-05-08',
      amount: 250000,
      accountId: 'acc_santander',
    });
    await request(app).post('/api/transactions').send({
      type: 'expense',
      date: '2026-05-10',
      amount: 50000,
      accountId: 'acc_santander',
      categoryId: 'cat_comida',
    });
    const res = await request(app).get('/api/reports/monthly?month=2026-05');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ income: 250000, expense: 50000, net: 200000 });
  });

  it('GET /api/reports/monthly con month mal formado devuelve 400', async () => {
    const res = await request(app).get('/api/reports/monthly?month=mayo');
    expect(res.status).toBe(400);
  });

  it('PATCH /api/recurring/:id cambia el monto del aporte', async () => {
    const res = await request(app).patch('/api/recurring/rec_mudanza').send({ amount: 120000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ amount: 120000 });
  });

  it('PATCH /api/recurring/:id con body vacío devuelve 400', async () => {
    const res = await request(app).patch('/api/recurring/rec_mudanza').send({});
    expect(res.status).toBe(400);
  });

  it('PATCH /api/recurring/:id de un aporte inexistente devuelve 404', async () => {
    const res = await request(app).patch('/api/recurring/rec_FANTASMA').send({ amount: 1 });
    expect(res.status).toBe(404);
  });

  it('PATCH /api/transactions/:id edita una transacción', async () => {
    const created = await request(app).post('/api/transactions').send({
      type: 'expense',
      date: '2026-05-10',
      amount: 5500,
      accountId: 'acc_santander',
    });
    const id = (created.body as { id: string }).id;
    const res = await request(app).patch(`/api/transactions/${id}`).send({ amount: 5000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ amount: 5000 });
  });

  it('DELETE /api/transactions/:id borra una transacción', async () => {
    const created = await request(app).post('/api/transactions').send({
      type: 'expense',
      date: '2026-05-10',
      amount: 5500,
      accountId: 'acc_santander',
    });
    const id = (created.body as { id: string }).id;
    const res = await request(app).delete(`/api/transactions/${id}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/transactions/:id inexistente devuelve 404', async () => {
    const res = await request(app).delete('/api/transactions/tx_FANTASMA');
    expect(res.status).toBe(404);
  });
});
