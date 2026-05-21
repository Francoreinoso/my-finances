import { useEffect, useState } from 'react';
import { useFinances } from '@/hooks/useFinances';
import { Button } from '@/components/atoms/Button';
import { AccountsBar } from '@/components/organisms/AccountsBar';
import { TransactionTable } from '@/components/organisms/TransactionTable';
import { NewTransactionModal } from '@/components/molecules/NewTransactionModal';

export function TransaccionesPage() {
  const { accounts, categories, transactions, status, error, createTransaction } = useFinances();
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <section className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-mono text-3xl tracking-tight text-text-primary">Transacciones</h2>
          <p className="text-sm text-text-muted">Tus ingresos y gastos, cuenta por cuenta.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={status !== 'ready'}>
          + Nueva <span className="ml-1 text-xs opacity-70">(N)</span>
        </Button>
      </header>

      {status === 'loading' && <p className="text-text-muted">Cargando…</p>}

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
          <AccountsBar accounts={accounts} />
          <TransactionTable
            transactions={transactions}
            accounts={accounts}
            categories={categories}
          />
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
