import { Router } from 'express';
import type { AccountController } from '@/infrastructure/http/controllers/accountController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import { createAccountSchema } from '@/shared/validation/accountSchemas.js';

export function makeAccountRouter(controller: AccountController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validateBody(createAccountSchema), controller.create);
  router.delete('/:id', controller.remove);
  return router;
}
