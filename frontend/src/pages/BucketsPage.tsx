import { useBuckets } from '@/hooks/useBuckets';
import { BucketProgressCard } from '@/components/molecules/BucketProgressCard';

export function BucketsPage() {
  const { buckets, status, error } = useBuckets();

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Buckets</h2>
        <p className="text-sm text-text-muted">Tu progreso hacia cada meta de ahorro.</p>
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

      {status === 'ready' && (
        <div className="flex flex-col gap-4">
          {buckets.map((bucket) => (
            <BucketProgressCard key={bucket.id} bucket={bucket} />
          ))}
        </div>
      )}
    </section>
  );
}
