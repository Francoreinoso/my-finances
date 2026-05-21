import express, { type Express } from 'express';
import cors from 'cors';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import { makeAccountController } from './controllers/accountController.js';
import { makeAccountRouter } from './routes/accountRoutes.js';
import { makeCategoryController } from './controllers/categoryController.js';
import { makeCategoryRouter } from './routes/categoryRoutes.js';
import { makeTransactionController } from './controllers/transactionController.js';
import { makeTransactionRouter } from './routes/transactionRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export interface ServerDeps {
  accountRepository: AccountRepository;
  categoryRepository: CategoryRepository;
  transactionRepository: TransactionRepository;
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

  app.use(errorHandler);

  return app;
}
