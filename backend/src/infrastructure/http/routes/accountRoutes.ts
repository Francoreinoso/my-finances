import { Router } from 'express';
import type { AccountController } from '@/infrastructure/http/controllers/accountController.js';

export function makeAccountRouter(controller: AccountController): Router {
  const router = Router();
  router.get('/', controller.list);
  return router;
}
