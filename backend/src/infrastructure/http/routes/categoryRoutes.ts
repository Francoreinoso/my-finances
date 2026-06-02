import { Router } from 'express';
import type { CategoryController } from '@/infrastructure/http/controllers/categoryController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '@/shared/validation/categorySchemas.js';

export function makeCategoryRouter(controller: CategoryController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validateBody(createCategorySchema), controller.create);
  router.patch('/:id', validateBody(updateCategorySchema), controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
