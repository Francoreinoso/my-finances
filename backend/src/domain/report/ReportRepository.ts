/** Totales de ingresos y gastos de un mes (sin transferencias). */
export interface MonthlyCashflow {
  income: number;
  expense: number;
}

/** Gasto total de una categoría (categoryId null = gasto sin categoría). */
export interface CategoryTotal {
  categoryId: string | null;
  total: number;
}

/**
 * Repositorio de agregaciones para reportes. Devuelve datos crudos: el caso
 * de uso los combina, resuelve nombres y calcula la tasa de ahorro.
 * `month` tiene formato YYYY-MM.
 */
export interface ReportRepository {
  monthlyCashflow(month: string): Promise<MonthlyCashflow>;
  expensesByCategory(month: string): Promise<CategoryTotal[]>;
}
