import { Router } from 'express';
import type { RecurringController } from '@/infrastructure/http/controllers/recurringController.js';

export function makeRecurringRouter(controller: RecurringController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/:id/confirm', controller.confirm);
  return router;
}
