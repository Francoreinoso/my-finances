import { Router } from 'express';
import type { ReportController } from '@/infrastructure/http/controllers/reportController.js';

export function makeReportRouter(controller: ReportController): Router {
  const router = Router();
  router.get('/monthly', controller.monthly);
  return router;
}
