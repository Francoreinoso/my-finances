import { useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useToasts } from '@/stores/useToasts';
import { Button } from '@/components/atoms/Button';
import { AccountRow } from '@/components/molecules/AccountRow';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';
import { CreateAccountModal } from '@/components/molecules/CreateAccountModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import type { Account } from '@/types/account';

export function CuentasPage() {
  const { accounts, status, error, create, remove } = useAccounts();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Account | null>(null);
  const notify = useToasts((state) => state.notify);

  // Las archivadas desaparecen de la UI: la decisión del proyecto es no
  // exponerlas. El listado completo sigue cargado para resolver nombres en
  // la historia de transacciones (eso lo usan otras vistas).
  const visible = accounts.filter((a) => !a.isArchived);

  const handleDelete = async () => {
    if (deleting === null) return;
    try {
      await remove(deleting.id);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo eliminar la cuenta');
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl tracking-tight text-text-primary">Cuentas</h1>
          <p className="text-sm text-text-muted">Los lugares donde vive tu plata.</p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={status !== 'ready'}>
          + Nueva
        </Button>
      </header>

      {status === 'loading' && <PageSkeleton variant="rows" />}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar las cuentas'}
        </div>
      )}

      {status === 'ready' &&
        (visible.length === 0 ? (
          <EmptyState
            title="Todavía no tenés cuentas"
            hint="Creá la primera con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {visible.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                onDelete={() => setDeleting(account)}
              />
            ))}
          </div>
        ))}

      {creating && (
        <CreateAccountModal onClose={() => setCreating(false)} onSubmit={create} />
      )}

      {deleting !== null && (
        <ConfirmDialog
          title={`Eliminar "${deleting.name}"`}
          message="Si la cuenta no tiene movimientos, se borra definitivamente. Si tiene historia, queda archivada (no se pierde nada). Necesita saldo en cero — si tiene plata, transferí primero."
          confirmLabel="Eliminar"
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
