import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import type { TransactionType } from '@/domain/transaction/Transaction.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';

const TYPE_LABEL: Record<TransactionType, string> = {
  income: 'Ingreso',
  expense: 'Gasto',
  transfer: 'Transferencia',
};

/** Escapa un valor para CSV: lo entrecomilla si trae coma, comilla o salto de línea. */
function csvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Exporta todas las transacciones a CSV con nombres legibles (no ids), para
 * abrir en Excel o compartir con un contador.
 */
export async function exportTransactionsCsv(
  transactions: TransactionRepository,
  accounts: AccountRepository,
  categories: CategoryRepository,
): Promise<string> {
  const [txs, accs, cats] = await Promise.all([
    transactions.findAll(),
    accounts.findAllWithBalance(),
    categories.findAll(),
  ]);

  const accountName = new Map(accs.map((a) => [a.id, a.name]));
  const categoryName = new Map(cats.map((c) => [c.id, c.name]));

  const header = [
    'Fecha',
    'Tipo',
    'Monto',
    'Cuenta origen',
    'Cuenta destino',
    'Categoría',
    'Descripción',
  ];

  const rows = txs.map((t) => [
    t.date,
    TYPE_LABEL[t.type],
    String(t.amount),
    t.fromAccountId === null ? '' : (accountName.get(t.fromAccountId) ?? ''),
    t.toAccountId === null ? '' : (accountName.get(t.toAccountId) ?? ''),
    t.categoryId === null ? '' : (categoryName.get(t.categoryId) ?? ''),
    t.description,
  ]);

  return [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}
