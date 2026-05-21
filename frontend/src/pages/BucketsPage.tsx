import { useState } from 'react';
import { useBuckets } from '@/hooks/useBuckets';
import { Button } from '@/components/atoms/Button';
import { BucketProgressCard } from '@/components/molecules/BucketProgressCard';
import { EmptyState } from '@/components/molecules/EmptyState';
import { BucketFormModal } from '@/components/molecules/BucketFormModal';
import type { Bucket } from '@/types/bucket';

export function BucketsPage() {
  const { buckets, accounts, status, error, create, update } = useBuckets();
  // null = cerrado; 'new' = crear; un Bucket = editar ese.
  const [formTarget, setFormTarget] = useState<Bucket | 'new' | null>(null);

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

      {status === 'loading' && <p className="text-text-muted">Cargando…</p>}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar los buckets'}
        </div>
      )}

      {status === 'ready' &&
        (buckets.length === 0 ? (
          <EmptyState
            title="Todavía no tenés buckets"
            hint="Creá tu primera meta de ahorro con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {buckets.map((bucket) => (
              <BucketProgressCard
                key={bucket.id}
                bucket={bucket}
                onEdit={() => setFormTarget(bucket)}
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
    </section>
  );
}
