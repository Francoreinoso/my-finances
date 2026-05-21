import { useState } from 'react';
import { Button } from '@/components/atoms/Button';
import type { RecurringTransfer } from '@/types/recurring';
import { formatMoney } from '@/lib/format';

interface RecurringTransferCardProps {
  recurring: RecurringTransfer;
  onConfirm: (id: string) => Promise<void>;
}

export function RecurringTransferCard({ recurring, onConfirm }: RecurringTransferCardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <h3 className="font-medium text-text-primary">{recurring.name}</h3>
        <span className="font-mono text-lg text-accent">
          {formatMoney(recurring.amount, 'CLP')}
        </span>
      </div>
      <p className="mt-1 text-xs text-text-subtle">
        Cada día {recurring.dayOfMonth} · próximo: {recurring.nextDueDate}
      </p>

      {recurring.pending ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={() => void handleConfirm()} disabled={submitting}>
            {submitting ? 'Confirmando…' : 'Confirmar aporte'}
          </Button>
          <span className="text-xs text-text-muted">Pendiente — ¿ya hiciste la transferencia?</span>
        </div>
      ) : (
        <p className="mt-3 text-xs text-text-subtle">
          Al día. El próximo aviso es el {recurring.nextDueDate}.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}
