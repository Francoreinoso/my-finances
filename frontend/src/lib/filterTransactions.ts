import type { Transaction, TransactionType } from '@/types/transaction';

/** Criterios de filtrado de la tabla de transacciones. `null` = sin filtrar. */
export interface TransactionFilter {
  /** Mes en formato 'YYYY-MM'. */
  month: string | null;
  type: TransactionType | null;
  categoryId: string | null;
}

/** El filtro neutro: no descarta ninguna transacción. */
export const EMPTY_FILTER: TransactionFilter = {
  month: null,
  type: null,
  categoryId: null,
};

/** Aplica los criterios activos en conjunción (AND). */
export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter,
): Transaction[] {
  return transactions.filter((t) => {
    if (filter.month !== null && !t.date.startsWith(filter.month)) return false;
    if (filter.type !== null && t.type !== filter.type) return false;
    if (filter.categoryId !== null && t.categoryId !== filter.categoryId) return false;
    return true;
  });
}

/** Meses únicos presentes en las transacciones, del más reciente al más viejo. */
export function transactionMonths(transactions: Transaction[]): string[] {
  const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
  return [...months].sort((a, b) => b.localeCompare(a));
}
