import express, { type Express } from 'express';
import cors from 'cors';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import type { ReportRepository } from '@/domain/report/ReportRepository.js';
import { backupDatabase } from '@/infrastructure/backup/backupDatabase.js';
import { makeAccountController } from './controllers/accountController.js';
import { makeAccountRouter } from './routes/accountRoutes.js';
import { makeCategoryController } from './controllers/categoryController.js';
import { makeCategoryRouter } from './routes/categoryRoutes.js';
import { makeTransactionController } from './controllers/transactionController.js';
import { makeTransactionRouter } from './routes/transactionRoutes.js';
import { makeBucketController } from './controllers/bucketController.js';
import { makeBucketRouter } from './routes/bucketRoutes.js';
import { makeRecurringController } from './controllers/recurringController.js';
import { makeRecurringRouter } from './routes/recurringRoutes.js';
import { makeReportController } from './controllers/reportController.js';
import { makeReportRouter } from './routes/reportRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface ServerDeps {
  accountRepository: AccountRepository;
  categoryRepository: CategoryRepository;
  transactionRepository: TransactionRepository;
  bucketRepository: BucketRepository;
  recurringRepository: RecurringTransferRepository;
  reportRepository: ReportRepository;
  dbPath: string;
  corsOrigin: string | string[];
}

/**
 * Construye la app Express. NO la arranca — solo la devuelve, para que pueda
 * usarse tanto desde index.ts (producción) como desde tests.
 */
export function createApp(deps: ServerDeps): Express {
  const app = express();

  app.use(cors({ origin: deps.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Respaldo: copia el archivo .db. Endpoint utilitario, sin recurso propio.
  app.post('/api/backup', (_req, res) => {
    res.status(201).json(backupDatabase(deps.dbPath));
  });

  const accountController = makeAccountController(deps.accountRepository);
  app.use('/api/accounts', makeAccountRouter(accountController));

  const categoryController = makeCategoryController(deps.categoryRepository);
  app.use('/api/categories', makeCategoryRouter(categoryController));

  const transactionController = makeTransactionController(
    deps.transactionRepository,
    deps.accountRepository,
    deps.categoryRepository,
  );
  app.use('/api/transactions', makeTransactionRouter(transactionController));

  const bucketController = makeBucketController(deps.bucketRepository, deps.accountRepository);
  app.use('/api/buckets', makeBucketRouter(bucketController));

  const recurringController = makeRecurringController(deps.recurringRepository);
  app.use('/api/recurring', makeRecurringRouter(recurringController));

  const reportController = makeReportController(deps.reportRepository, deps.categoryRepository);
  app.use('/api/reports', makeReportRouter(reportController));

  app.use(errorHandler);

  return app;
}
