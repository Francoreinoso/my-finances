import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { useToasts } from '@/stores/useToasts';
import { Button } from '@/components/atoms/Button';
import { BucketProgressCard } from '@/components/molecules/BucketProgressCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';
import { BucketFormModal } from '@/components/molecules/BucketFormModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import type { Bucket } from '@/types/bucket';

export function BucketsPage() {
  const { buckets, accounts, status, error, create, update, remove } = useBuckets();
  // null = cerrado; 'new' = crear; un Bucket = editar ese.
  const [formTarget, setFormTarget] = useState<Bucket | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Bucket | null>(null);
  const notify = useToasts((state) => state.notify);

  const visible = buckets.filter((b) => !b.isArchived);

  const handleDelete = async () => {
    if (deleting === null) return;
    try {
      await remove(deleting.id);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo eliminar el bucket');
    }
  };

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl tracking-tight text-text-primary">Buckets</h1>
          <p className="text-sm text-text-muted">Tu progreso hacia cada meta de ahorro.</p>
        </div>
        <Button onClick={() => setFormTarget('new')} disabled={status !== 'ready'}>
          + Nuevo bucket
        </Button>
      </header>

      {status === 'loading' && <PageSkeleton variant="cards" />}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar los buckets'}
        </div>
      )}

      {status === 'ready' &&
        (visible.length === 0 ? (
          <EmptyState
            title="Todavía no tenés buckets"
            hint="Crea tu primera meta de ahorro con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((bucket) => (
              <BucketProgressCard
                key={bucket.id}
                bucket={bucket}
                onEdit={() => setFormTarget(bucket)}
                onDelete={() => setDeleting(bucket)}
              />
            ))}
          </div>
        ))}

      {formTarget !== null && (
        <BucketFormModal
          bucket={formTarget === 'new' ? null : formTarget}
          accounts={accounts}
          onClose={() => setFormTarget(null)}
          onSubmit={(data) =>
            formTarget === 'new' ? create(data) : update(formTarget.id, data)
          }
        />
      )}

      {deleting !== null && (
        <ConfirmDialog
          title={`Eliminar "${deleting.name}"`}
          message="Si el bucket no fue usado, se borra definitivamente. Si tiene transacciones o aportes recurrentes, queda archivado (la historia no se pierde)."
          confirmLabel="Eliminar"
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
