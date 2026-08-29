import { type CSSProperties } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Transaction, TransactionType } from '@/types/transaction';
import type { Category } from '@/types/category';
import type { Currency } from '@/types/account';
import { formatMoney } from '@/lib/format';

interface TransactionRowProps {
  transaction: Transaction;
  category: Category | null;
  accountName: string;
  currency: Currency;
  /** Índice 1-based para `aria-rowindex` (la tabla está virtualizada). */
  ariaRowIndex: number;
  /** Clases de grilla compartidas con el encabezado de la tabla. */
  gridClassName: string;
  /** Posicionamiento absoluto que provee el virtualizador. */
  style: CSSProperties;
  onEdit: () => void;
  onDelete: () => void;
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

/**
 * Fila presentacional de la tabla de transacciones. No tiene estado ni modales:
 * delega editar/borrar a la tabla vía callbacks, porque con virtualización la
 * fila puede desmontarse y se llevaría puesto cualquier modal que tuviera.
 */
export function TransactionRow({
  transaction,
  category,
  accountName,
  currency,
  ariaRowIndex,
  gridClassName,
  style,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  return (
    <div
      role="row"
      aria-rowindex={ariaRowIndex}
      style={style}
      className={`${gridClassName} border-t border-border-default/60 text-sm transition-colors hover:bg-bg-elevated/40`}
    >
      <span role="cell" className="font-mono text-xs text-text-muted">
        {transaction.date}
      </span>
      <span role="cell" className="min-w-0 overflow-hidden">
        {category ? (
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            />
            <span className="truncate text-text-primary" title={category.name}>
              {category.name}
            </span>
          </span>
        ) : (
          <span className="text-text-subtle">—</span>
        )}
      </span>
      <span
        role="cell"
        className="min-w-0 truncate text-text-muted"
        title={transaction.description || undefined}
      >
        {transaction.description || '—'}
      </span>
      <span role="cell" className="truncate text-text-muted" title={accountName}>
        {accountName}
      </span>
      <span
        role="cell"
        className={`text-right font-mono font-medium ${AMOUNT_COLOR[transaction.type]}`}
      >
        {SIGN[transaction.type]}
        {formatMoney(transaction.amount, currency)}
      </span>
      <span role="cell" className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" className="h-11" onClick={onEdit}>
          Editar
        </Button>
        <Button variant="danger" size="sm" className="h-11" onClick={onDelete}>
          Borrar
        </Button>
      </span>
    </div>
  );
}
