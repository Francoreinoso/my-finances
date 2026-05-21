import { resolve } from 'node:path';
import { createDb } from '@/infrastructure/persistence/db.js';
import { seedIfEmpty } from '@/infrastructure/persistence/seed.js';
import { SqliteAccountRepository } from '@/infrastructure/persistence/SqliteAccountRepository.js';
import { SqliteCategoryRepository } from '@/infrastructure/persistence/SqliteCategoryRepository.js';
import { SqliteTransactionRepository } from '@/infrastructure/persistence/SqliteTransactionRepository.js';
import { SqliteBucketRepository } from '@/infrastructure/persistence/SqliteBucketRepository.js';
import { SqliteRecurringTransferRepository } from '@/infrastructure/persistence/SqliteRecurringTransferRepository.js';
import { createApp } from '@/infrastructure/http/server.js';

const PORT = Number(process.env['PORT'] ?? 4001);
const DB_PATH = resolve(process.env['DB_PATH'] ?? 'data/finanzas.db');
const FRONTEND_ORIGIN = process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:5174';

// Composition root: acá se crean las dependencias concretas y se inyectan.
const db = createDb(DB_PATH);
const seeded = seedIfEmpty(db);

const app = createApp({
  accountRepository: new SqliteAccountRepository(db),
  categoryRepository: new SqliteCategoryRepository(db),
  transactionRepository: new SqliteTransactionRepository(db),
  bucketRepository: new SqliteBucketRepository(db),
  recurringRepository: new SqliteRecurringTransferRepository(db),
  corsOrigin: FRONTEND_ORIGIN,
});

app.listen(PORT, () => {
  console.log(`my-finanzas backend escuchando en http://localhost:${String(PORT)}`);
  console.log(`Base de datos: ${DB_PATH}`);
  console.log(seeded ? 'Seed inicial aplicado.' : 'Base ya tenía datos, seed omitido.');
  console.log(`CORS permitido para: ${FRONTEND_ORIGIN}`);
});
