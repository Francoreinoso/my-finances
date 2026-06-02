import { Router } from 'express';
import type { RecurringController } from '@/infrastructure/http/controllers/recurringController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createRecurringSchema,
  updateRecurringSchema,
} from '@/shared/validation/recurringSchemas.js';

export function makeRecurringRouter(controller: RecurringController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validateBody(createRecurringSchema), controller.create);
  router.post('/:id/confirm', controller.confirm);
  router.patch('/:id', validateBody(updateRecurringSchema), controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
