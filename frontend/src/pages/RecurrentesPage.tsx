import { useState } from 'react';
import { useRecurring } from '@/hooks/useRecurring';
import { useToasts } from '@/stores/useToasts';
import { Button } from '@/components/atoms/Button';
import { RecurringTransferCard } from '@/components/molecules/RecurringTransferCard';
import { CreateRecurringModal } from '@/components/molecules/CreateRecurringModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';
import type { RecurringTransfer } from '@/types/recurring';

export function RecurrentesPage() {
  const { recurring, accounts, buckets, status, error, create, confirm, update, remove } =
    useRecurring();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<RecurringTransfer | null>(null);
  const notify = useToasts((state) => state.notify);
  const canCreate = status === 'ready' && accounts.filter((a) => !a.isArchived).length >= 2;

  // Filtramos archivados (siguen existiendo en la base para preservar historia).
  const visible = recurring.filter((r) => !r.isArchived);
  const pendingCount = visible.filter((r) => r.pending).length;

  // Los pendientes primero: lo que requiere acción flota arriba.
  const sorted = [...visible].sort((a, b) => Number(b.pending) - Number(a.pending));

  const handleDelete = async () => {
    if (deleting === null) return;
    try {
      await remove(deleting.id);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo eliminar el aporte');
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl tracking-tight text-text-primary">Recurrentes</h1>
          <p className="text-sm text-text-muted">
            Tus aportes programados. Cuando uno vence, confirma que ya lo transferiste.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} disabled={!canCreate}>
          + Nuevo
        </Button>
      </header>

      {status === 'loading' && <PageSkeleton variant="cards" />}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar los aportes'}
        </div>
      )}

      {status === 'ready' &&
        (sorted.length === 0 ? (
          <EmptyState
            title="Todavía no hay aportes recurrentes"
            hint="Crea el primero con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {pendingCount > 0 && (
              <p className="text-sm text-accent">
                Tienes {pendingCount} aporte{pendingCount === 1 ? '' : 's'} pendiente
                {pendingCount === 1 ? '' : 's'} de confirmar.
              </p>
            )}
            {sorted.map((r) => (
              <RecurringTransferCard
                key={r.id}
                recurring={r}
                onConfirm={confirm}
                onUpdate={update}
                onDelete={() => setDeleting(r)}
              />
            ))}
          </div>
        ))}

      {creating && (
        <CreateRecurringModal
          accounts={accounts}
          buckets={buckets}
          onClose={() => setCreating(false)}
          onSubmit={create}
        />
      )}

      {deleting !== null && (
        <ConfirmDialog
          title={`Eliminar "${deleting.name}"`}
          message="Si nunca confirmaste un aporte de este recurrente, se borra definitivamente. Si tiene transferencias confirmadas, queda archivado (la historia no se pierde). Si solo querés pausarlo, mejor usá Editar."
          confirmLabel="Eliminar"
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
