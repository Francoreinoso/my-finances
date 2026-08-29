import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { RecurringTransfer, RecurringTransferChanges } from '@/types/recurring';

interface EditRecurringModalProps {
  recurring: RecurringTransfer;
  onClose: () => void;
  onSubmit: (changes: RecurringTransferChanges) => Promise<void>;
}

export function EditRecurringModal({ recurring, onClose, onSubmit }: EditRecurringModalProps) {
  const [amount, setAmount] = useState(String(recurring.amount));
  const [isActive, setIsActive] = useState(recurring.isActive);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const amountErrorId = useId();

  const amountNumber = Number(amount);
  const amountOk = Number.isFinite(amountNumber) && amountNumber > 0;
  const showAmountError = amountTouched && !amountOk;
  const canSubmit = amountOk && !submitting;

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
    <Modal title={`Editar ${recurring.name}`} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto del aporte
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => setAmountTouched(true)}
            aria-invalid={showAmountError}
            aria-describedby={showAmountError ? amountErrorId : undefined}
            autoFocus
            className={FIELD_CLASS}
          />
        </label>
        {showAmountError && (
          <p id={amountErrorId} className="text-xs text-danger">
            Ingresa un monto mayor a 0.
          </p>
        )}

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-accent"
          />
          Aporte activo (si lo desmarcas, queda pausado)
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
    </Modal>
  );
}
