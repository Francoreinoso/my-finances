import type { Transaction, TransactionType } from '@/types/transaction';
import type { Category } from '@/types/category';
import type { Currency } from '@/types/account';
import { formatMoney } from '@/lib/format';

interface TransactionRowProps {
  transaction: Transaction;
  category: Category | null;
  accountName: string;
  currency: Currency;
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
}: TransactionRowProps) {
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
    </tr>
  );
}
