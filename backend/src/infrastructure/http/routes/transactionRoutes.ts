import { Router } from 'express';
import type { TransactionController } from '@/infrastructure/http/controllers/transactionController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from '@/shared/validation/transactionSchemas.js';

export function makeTransactionRouter(controller: TransactionController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.get('/export', controller.exportCsv);
  router.post('/', validateBody(createTransactionSchema), controller.create);
  router.patch('/:id', validateBody(updateTransactionSchema), controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
