import { Router } from 'express';
import type { CategoryController } from '@/infrastructure/http/controllers/categoryController.js';

export function makeCategoryRouter(controller: CategoryController): Router {
  const router = Router();
  router.get('/', controller.list);
  return router;
}
