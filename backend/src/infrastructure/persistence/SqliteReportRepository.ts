import { and, eq, inArray, like, sum } from 'drizzle-orm';
import type {
  ReportRepository,
  MonthlyCashflow,
  CategoryTotal,
} from '@/domain/report/ReportRepository.js';
import { transactions } from './schema.js';
import type { DB } from './db.js';

export class SqliteReportRepository implements ReportRepository {
  constructor(private readonly db: DB) {}

  monthlyCashflow(month: string): Promise<MonthlyCashflow> {
    const rows = this.db
      .select({ type: transactions.type, total: sum(transactions.amount) })
      .from(transactions)
      .where(
        and(
          inArray(transactions.type, ['income', 'expense']),
          like(transactions.date, `${month}-%`),
        ),
      )
      .groupBy(transactions.type)
      .all();

    let income = 0;
    let expense = 0;
    for (const row of rows) {
      const total = Number(row.total ?? 0);
      if (row.type === 'income') income = total;
      else if (row.type === 'expense') expense = total;
    }
    return Promise.resolve({ income, expense });
  }

  expensesByCategory(month: string): Promise<CategoryTotal[]> {
    const rows = this.db
      .select({ categoryId: transactions.categoryId, total: sum(transactions.amount) })
      .from(transactions)
      .where(and(eq(transactions.type, 'expense'), like(transactions.date, `${month}-%`)))
      .groupBy(transactions.categoryId)
      .all();

    return Promise.resolve(
      rows.map((r) => ({ categoryId: r.categoryId, total: Number(r.total ?? 0) })),
    );
  }
}
