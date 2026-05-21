import type { MonthlySummary } from '@/types/report';
import { request } from '@/api/http';

export const reportClient = {
  monthly(month: string): Promise<MonthlySummary> {
    return request<MonthlySummary>(`/reports/monthly?month=${month}`);
  },
};

export type ReportClient = typeof reportClient;
