import { useState } from 'react';
import type { Transaction, TransactionType, TransactionChanges } from '@/types/transaction';
import type { Category } from '@/types/category';
import type { Currency } from '@/types/account';
import { formatMoney } from '@/lib/format';
import { EditTransactionModal } from '@/components/molecules/EditTransactionModal';

interface TransactionRowProps {
  transaction: Transaction;
  category: Category | null;
  accountName: string;
  currency: Currency;
  categories: Category[];
  onUpdate: (id: string, changes: TransactionChanges) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const SIGN: Record<TransactionType, string> = {
  income: '+',
  expense: '-',
  transfer: '',
};

const AMOUNT_COLOR: Record<TransactionType, string> = {
  income: 'text-success',
  expense: 'text-danger',
  transfer: 'text-text-muted',
};

export function TransactionRow({
  transaction,
  category,
  accountName,
  currency,
  categories,
  onUpdate,
  onDelete,
}: TransactionRowProps) {
  const [editing, setEditing] = useState(false);

  const handleDelete = () => {
    if (window.confirm('¿Borrar esta transacción? No se puede deshacer.')) {
      void onDelete(transaction.id);
    }
  };

  return (
    <tr className="border-t border-border-default/60">
      <td className="px-3 py-2 font-mono text-xs text-text-muted">{transaction.date}</td>
      <td className="px-3 py-2">
        {category ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <span className="text-text-primary">{category.name}</span>
          </span>
        ) : (
          <span className="text-text-subtle">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-text-muted">{transaction.description || '—'}</td>
      <td className="px-3 py-2 text-text-muted">{accountName}</td>
      <td
        className={`px-3 py-2 text-right font-mono font-medium ${AMOUNT_COLOR[transaction.type]}`}
      >
        {SIGN[transaction.type]}
        {formatMoney(transaction.amount, currency)}
      </td>
      <td className="whitespace-nowrap px-3 py-2 text-right">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-text-muted hover:text-accent"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="ml-3 text-xs text-text-muted hover:text-danger"
        >
          Borrar
        </button>
        {editing && (
          <EditTransactionModal
            transaction={transaction}
            categories={categories}
            onClose={() => setEditing(false)}
            onSubmit={(changes) => onUpdate(transaction.id, changes)}
          />
        )}
      </td>
    </tr>
  );
}
