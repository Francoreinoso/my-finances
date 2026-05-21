import { Router } from 'express';
import type { BucketController } from '@/infrastructure/http/controllers/bucketController.js';

export function makeBucketRouter(controller: BucketController): Router {
  const router = Router();
  router.get('/', controller.list);
  return router;
}
