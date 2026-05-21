import type { Transaction } from '@/types/transaction';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import { TransactionRow } from '@/components/molecules/TransactionRow';

interface TransactionTableProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

export function TransactionTable({ transactions, accounts, categories }: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div
        role="status"
        className="rounded-lg border border-dashed border-border-default bg-bg-surface/40 px-6 py-12 text-center text-text-muted"
      >
        <p className="font-medium text-text-primary">Sin transacciones todavía</p>
        <p className="mt-1 text-sm">Agregá la primera con el botón de arriba (o la tecla N).</p>
      </div>
    );
  }

  const accountsById = new Map(accounts.map((a) => [a.id, a]));
  const categoriesById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="overflow-x-auto rounded-lg border border-border-default bg-bg-surface/70 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-text-subtle">
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Categoría</th>
            <th className="px-3 py-2 font-medium">Descripción</th>
            <th className="px-3 py-2 font-medium">Cuenta</th>
            <th className="px-3 py-2 text-right font-medium">Monto</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const account = accountsById.get(t.fromAccountId ?? t.toAccountId ?? '');
            const category = t.categoryId ? (categoriesById.get(t.categoryId) ?? null) : null;
            return (
              <TransactionRow
                key={t.id}
                transaction={t}
                category={category}
                accountName={account?.name ?? '—'}
                currency={account?.currency ?? 'CLP'}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
