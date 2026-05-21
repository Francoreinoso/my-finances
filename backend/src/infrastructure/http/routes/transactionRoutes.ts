import { Router } from 'express';
import type { TransactionController } from '@/infrastructure/http/controllers/transactionController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import { createTransactionSchema } from '@/shared/validation/transactionSchemas.js';

export function makeTransactionRouter(controller: TransactionController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validateBody(createTransactionSchema), controller.create);
  return router;
}
