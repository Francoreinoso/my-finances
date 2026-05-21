import type { Request, Response } from 'express';
import type { ReportRepository } from '@/domain/report/ReportRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import { getMonthlySummary } from '@/application/report/getMonthlySummary.js';
import { QueryValidationError } from '@/infrastructure/http/errors.js';
import { todayISO } from '@/shared/date.js';

/** Valida el query param `month`. Si falta, usa el mes actual. */
function parseMonth(raw: unknown): string {
  if (raw === undefined) return todayISO().slice(0, 7);
  if (typeof raw !== 'string' || !/^\d{4}-\d{2}$/.test(raw)) {
    throw new QueryValidationError('El parámetro month debe tener formato YYYY-MM');
  }
  return raw;
}

export function makeReportController(reports: ReportRepository, categories: CategoryRepository) {
  return {
    monthly: async (req: Request, res: Response): Promise<void> => {
      const month = parseMonth(req.query['month']);
      const summary = await getMonthlySummary(reports, categories, month);
      res.json(summary);
    },
  };
}

export type ReportController = ReturnType<typeof makeReportController>;
