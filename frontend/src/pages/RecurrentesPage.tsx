import { useRecurring } from '@/hooks/useRecurring';
import { RecurringTransferCard } from '@/components/molecules/RecurringTransferCard';

export function RecurrentesPage() {
  const { recurring, status, error, confirm, update } = useRecurring();
  const pendingCount = recurring.filter((r) => r.pending).length;

  // Los pendientes primero: lo que requiere acción flota arriba.
  const sorted = [...recurring].sort((a, b) => Number(b.pending) - Number(a.pending));

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h2 className="font-mono text-3xl tracking-tight text-text-primary">Recurrentes</h2>
        <p className="text-sm text-text-muted">
          Tus aportes programados. Cuando uno vence, confirmá que ya lo transferiste.
        </p>
      </header>

      {status === 'loading' && <p className="text-text-muted">Cargando…</p>}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar los aportes'}
        </div>
      )}

      {status === 'ready' && (
        <div className="flex flex-col gap-4">
          {pendingCount > 0 && (
            <p className="text-sm text-accent">
              Tenés {pendingCount} aporte{pendingCount === 1 ? '' : 's'} pendiente
              {pendingCount === 1 ? '' : 's'} de confirmar.
            </p>
          )}
          {sorted.map((r) => (
            <RecurringTransferCard
              key={r.id}
              recurring={r}
              onConfirm={confirm}
              onUpdate={update}
            />
          ))}
        </div>
      )}
    </section>
  );
}
