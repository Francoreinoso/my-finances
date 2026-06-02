import { Router } from 'express';
import type { BucketController } from '@/infrastructure/http/controllers/bucketController.js';
import { validateBody } from '@/infrastructure/http/middleware/validateBody.js';
import {
  createBucketSchema,
  updateBucketSchema,
} from '@/shared/validation/bucketSchemas.js';

export function makeBucketRouter(controller: BucketController): Router {
  const router = Router();
  router.get('/', controller.list);
  router.post('/', validateBody(createBucketSchema), controller.create);
  router.patch('/:id', validateBody(updateBucketSchema), controller.update);
  router.delete('/:id', controller.remove);
  return router;
}
