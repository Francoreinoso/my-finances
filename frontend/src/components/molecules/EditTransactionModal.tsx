import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Category } from '@/types/category';
import type { Transaction, TransactionChanges } from '@/types/transaction';

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onClose: () => void;
  onSubmit: (changes: TransactionChanges) => Promise<void>;
}

const FIELD_CLASS =
  'rounded-md border border-border-default bg-bg-surface/60 px-3 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none';

export function EditTransactionModal({
  transaction,
  categories,
  onClose,
  onSubmit,
}: EditTransactionModalProps) {
  const [amount, setAmount] = useState(String(transaction.amount));
  const [date, setDate] = useState(transaction.date);
  const [categoryId, setCategoryId] = useState(transaction.categoryId ?? '');
  const [description, setDescription] = useState(transaction.description);
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

  // El tipo y las cuentas no se editan; solo monto, fecha, categoría y descripción.
  const isTransfer = transaction.type === 'transfer';
  const visibleCategories = categories.filter((c) => c.type === transaction.type);
  const amountNumber = Number(amount);
  const canSubmit = Number.isFinite(amountNumber) && amountNumber > 0 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const trimmed = description.trim();
      const changes: TransactionChanges = {
        amount: amountNumber,
        date,
        description: trimmed === '' ? null : trimmed,
      };
      if (!isTransfer) {
        changes.categoryId = categoryId === '' ? null : categoryId;
      }
      await onSubmit(changes);
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
      aria-label="Editar transacción"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl"
      >
        <h3 className="font-mono text-xl text-text-primary">Editar transacción</h3>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto
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

        {!isTransfer && (
          <label className="flex flex-col gap-1 text-sm text-text-muted">
            Categoría <span className="text-text-subtle">(opcional)</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={FIELD_CLASS}
            >
              <option value="">Sin categoría</option>
              {visibleCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Fecha
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Descripción <span className="text-text-subtle">(opcional)</span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={280}
            className={FIELD_CLASS}
          />
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
