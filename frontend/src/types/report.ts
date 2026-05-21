/** Gasto acumulado de una categoría en el mes. */
export interface CategorySpending {
  categoryId: string | null;
  categoryName: string;
  color: string;
  total: number;
}

/** Resumen financiero de un mes, tal como lo devuelve GET /api/reports/monthly. */
export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
  savingsRate: number;
  byCategory: CategorySpending[];
}
