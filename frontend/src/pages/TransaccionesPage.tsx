import { useEffect, useMemo, useState } from 'react';
import { useFinances } from '@/hooks/useFinances';
import { Button } from '@/components/atoms/Button';
import { AccountsBar } from '@/components/organisms/AccountsBar';
import { TransactionTable } from '@/components/organisms/TransactionTable';
import { TransactionFilters } from '@/components/molecules/TransactionFilters';
import { NewTransactionModal } from '@/components/molecules/NewTransactionModal';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';
import {
  EMPTY_FILTER,
  filterTransactions,
  transactionMonths,
  type TransactionFilter,
} from '@/lib/filterTransactions';

export function TransaccionesPage() {
  const {
    accounts,
    categories,
    transactions,
    status,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinances();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<TransactionFilter>(EMPTY_FILTER);

  // Hotkey "N" para abrir el modal, salvo que se esté escribiendo en un campo.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'n' && e.key !== 'N') return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (modalOpen || status !== 'ready') return;
      e.preventDefault();
      setModalOpen(true);
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [modalOpen, status]);

  const months = useMemo(() => transactionMonths(transactions), [transactions]);
  const filtered = useMemo(
    () => filterTransactions(transactions, filter),
    [transactions, filter],
  );

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl tracking-tight text-text-primary">Transacciones</h1>
          <p className="text-sm text-text-muted">Tus ingresos y gastos, cuenta por cuenta.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={status !== 'ready'}>
          + Nueva <span className="ml-1 text-xs opacity-70">(N)</span>
        </Button>
      </header>

      {status === 'loading' && <PageSkeleton variant="table" />}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar los datos'}
        </div>
      )}

      {status === 'ready' && (
        <div className="flex flex-col gap-6">
          <AccountsBar accounts={accounts.filter((a) => !a.isArchived)} />
          {transactions.length === 0 ? (
            <EmptyState
              title="Sin transacciones todavía"
              hint="Agrega la primera con el botón de arriba (o la tecla N)."
            />
          ) : (
            <div className="flex flex-col gap-3">
              <TransactionFilters
                months={months}
                categories={categories}
                filter={filter}
                onChange={setFilter}
              />
              {filtered.length === 0 ? (
                <EmptyState
                  title="Sin resultados"
                  hint="Ninguna transacción coincide con los filtros elegidos."
                />
              ) : (
                <TransactionTable
                  transactions={filtered}
                  accounts={accounts}
                  categories={categories}
                  onUpdate={updateTransaction}
                  onDelete={deleteTransaction}
                />
              )}
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <NewTransactionModal
          accounts={accounts}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSubmit={createTransaction}
        />
      )}
    </section>
  );
}
