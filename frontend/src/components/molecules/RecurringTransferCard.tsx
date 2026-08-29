import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import { EditRecurringModal } from '@/components/molecules/EditRecurringModal';
import type { RecurringTransfer, RecurringTransferChanges } from '@/types/recurring';
import { formatMoney } from '@/lib/format';

interface RecurringTransferCardProps {
  recurring: RecurringTransfer;
  onConfirm: (id: string) => Promise<void>;
  onUpdate: (id: string, changes: RecurringTransferChanges) => Promise<void>;
  onDelete: () => void;
}

export function RecurringTransferCard({
  recurring,
  onConfirm,
  onUpdate,
  onDelete,
}: RecurringTransferCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(recurring.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo confirmar el aporte');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-5 backdrop-blur-sm ${
        recurring.pending
          ? 'border-accent/50 bg-accent/5'
          : 'border-border-default bg-bg-surface/70'
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3
          className="min-w-0 truncate font-medium text-text-primary"
          title={recurring.name}
        >
          {recurring.name}
        </h3>
        <span className="shrink-0 font-mono text-lg text-accent">
          {formatMoney(recurring.amount, 'CLP')}
        </span>
      </div>
      <p className="mt-1 text-xs text-text-subtle">
        Cada día {recurring.dayOfMonth} · próximo: {recurring.nextDueDate}
      </p>

      {!recurring.isActive ? (
        <p className="mt-3 text-xs text-warning">Pausado — no genera avisos.</p>
      ) : recurring.pending ? (
        <p className="mt-3 text-xs text-text-muted">
          Pendiente — confirma cuando hayas hecho la transferencia.
        </p>
      ) : (
        <p className="mt-3 text-xs text-text-subtle">
          Al día. El próximo aviso es el {recurring.nextDueDate}.
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {recurring.pending && (
          <Button onClick={() => void handleConfirm()} disabled={submitting}>
            {submitting ? 'Confirmando…' : 'Confirmar aporte'}
          </Button>
        )}
        <Button variant="ghost" type="button" onClick={() => setEditing(true)}>
          Editar
        </Button>
        <Button variant="danger" size="sm" type="button" onClick={onDelete}>
          Eliminar
        </Button>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {editing && (
        <EditRecurringModal
          recurring={recurring}
          onClose={() => setEditing(false)}
          onSubmit={(changes) => onUpdate(recurring.id, changes)}
        />
      )}
    </div>
  );
}
