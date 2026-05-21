import type { MonthlySummary, CategorySpending } from '@/domain/report/MonthlySummary.js';
import type { ReportRepository } from '@/domain/report/ReportRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';

const UNCATEGORIZED_COLOR = '#6b7280';

/**
 * Arma el resumen de un mes. Cruza los agregados crudos del ReportRepository
 * con los nombres/colores de las categorías, y calcula net y tasa de ahorro.
 *
 * La tasa de ahorro (net / income) es una regla de negocio: vive acá, no en
 * el repositorio ni en la base.
 */
export async function getMonthlySummary(
  reports: ReportRepository,
  categories: CategoryRepository,
  month: string,
): Promise<MonthlySummary> {
  const [cashflow, byCategoryRaw, allCategories] = await Promise.all([
    reports.monthlyCashflow(month),
    reports.expensesByCategory(month),
    categories.findAll(),
  ]);

  const categoryById = new Map(allCategories.map((c) => [c.id, c]));

  const byCategory: CategorySpending[] = byCategoryRaw
    .map((row) => {
      const category = row.categoryId === null ? undefined : categoryById.get(row.categoryId);
      return {
        categoryId: row.categoryId,
        categoryName: category?.name ?? 'Sin categoría',
        color: category?.color ?? UNCATEGORIZED_COLOR,
        total: row.total,
      };
    })
    .sort((a, b) => b.total - a.total);

  const net = cashflow.income - cashflow.expense;
  const savingsRate = cashflow.income > 0 ? net / cashflow.income : 0;

  return {
    month,
    income: cashflow.income,
    expense: cashflow.expense,
    net,
    savingsRate,
    byCategory,
  };
}
