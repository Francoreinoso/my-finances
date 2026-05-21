import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import type { RecurringTransfer, RecurringTransferChanges } from '@/types/recurring';

interface EditRecurringModalProps {
  recurring: RecurringTransfer;
  onClose: () => void;
  onSubmit: (changes: RecurringTransferChanges) => Promise<void>;
}

const FIELD_CLASS =
  'rounded-md border border-border-default bg-bg-surface/60 px-3 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none';

export function EditRecurringModal({ recurring, onClose, onSubmit }: EditRecurringModalProps) {
  const [amount, setAmount] = useState(String(recurring.amount));
  const [isActive, setIsActive] = useState(recurring.isActive);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const amountNumber = Number(amount);
  const canSubmit = Number.isFinite(amountNumber) && amountNumber > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ amount: amountNumber, isActive });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el cambio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Editar ${recurring.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl"
      >
        <h3 className="font-mono text-xl text-text-primary">Editar {recurring.name}</h3>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto del aporte
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-accent"
          />
          Aporte activo (si lo destildás, queda pausado)
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </div>
  );
}
