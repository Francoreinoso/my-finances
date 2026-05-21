import { useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Transaction, TransactionChanges } from '@/types/transaction';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import { TransactionRow } from '@/components/molecules/TransactionRow';
import { EditTransactionModal } from '@/components/molecules/EditTransactionModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';

interface TransactionTableProps {
  /** Transacciones ya filtradas; la tabla asume que hay al menos una. */
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onUpdate: (id: string, changes: TransactionChanges) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

/** Grilla de columnas compartida entre el encabezado y cada fila. */
const GRID =
  'grid grid-cols-[5.5rem_minmax(0,1fr)_minmax(0,1.5fr)_7rem_7rem_8rem] items-center gap-3 px-3';
const ROW_HEIGHT = 44;

/**
 * Tabla de transacciones virtualizada: solo renderiza las filas visibles, así
 * la lista escala sin límite. Los modales de editar y borrar viven acá (no en
 * la fila) para que sobrevivan al scroll que desmonta filas.
 */
export function TransactionTable({
  transactions,
  accounts,
  categories,
  onUpdate,
  onDelete,
}: TransactionTableProps) {
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const accountsById = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);
  const categoriesById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <>
      <div
        role="table"
        aria-label="Transacciones"
        aria-rowcount={transactions.length + 1}
        className="overflow-x-auto rounded-lg border border-border-default bg-bg-surface/70 backdrop-blur-sm"
      >
        <div className="min-w-[44rem]">
          <div
            role="row"
            aria-rowindex={1}
            className={`${GRID} border-b border-border-default py-2 text-xs uppercase tracking-wider text-text-subtle`}
          >
            <span role="columnheader">Fecha</span>
            <span role="columnheader">Categoría</span>
            <span role="columnheader">Descripción</span>
            <span role="columnheader">Cuenta</span>
            <span role="columnheader" className="text-right">
              Monto
            </span>
            <span role="columnheader" className="sr-only">
              Acciones
            </span>
          </div>

          <div ref={scrollRef} role="presentation" className="max-h-[60vh] overflow-y-auto">
            <div
              role="presentation"
              style={{
                height: `${String(rowVirtualizer.getTotalSize())}px`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((vi) => {
                const t = transactions[vi.index];
                if (t === undefined) return null;
                const account = accountsById.get(t.fromAccountId ?? t.toAccountId ?? '');
                const category = t.categoryId
                  ? (categoriesById.get(t.categoryId) ?? null)
                  : null;
                return (
                  <TransactionRow
                    key={t.id}
                    transaction={t}
                    category={category}
                    accountName={account?.name ?? '—'}
                    currency={account?.currency ?? 'CLP'}
                    ariaRowIndex={vi.index + 2}
                    gridClassName={GRID}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${String(ROW_HEIGHT)}px`,
                      transform: `translateY(${String(vi.start)}px)`,
                    }}
                    onEdit={() => setEditing(t)}
                    onDelete={() => setDeleting(t)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <EditTransactionModal
          transaction={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSubmit={(changes) => onUpdate(editing.id, changes)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Borrar transacción"
          message="Esta acción no se puede deshacer."
          confirmLabel="Borrar"
          onConfirm={() => void onDelete(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
