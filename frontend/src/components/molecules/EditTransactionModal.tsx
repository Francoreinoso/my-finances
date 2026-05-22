import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { DatePicker } from '@/components/molecules/DatePicker';
import { MoneyInput } from '@/components/molecules/MoneyInput';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { Category } from '@/types/category';
import type { Transaction, TransactionChanges } from '@/types/transaction';

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onClose: () => void;
  onSubmit: (changes: TransactionChanges) => Promise<void>;
}

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
  const [amountTouched, setAmountTouched] = useState(false);
  const amountErrorId = useId();

  // El tipo y las cuentas no se editan; solo monto, fecha, categoría y descripción.
  const isTransfer = transaction.type === 'transfer';
  const visibleCategories = categories.filter((c) => c.type === transaction.type);
  const amountNumber = Number(amount);
  const amountOk = Number.isFinite(amountNumber) && amountNumber > 0;
  const showAmountError = amountTouched && !amountOk;
  const canSubmit = amountOk && !submitting;

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
    <Modal title="Editar transacción" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto
          <MoneyInput
            value={amount}
            onChange={setAmount}
            onBlur={() => setAmountTouched(true)}
            aria-invalid={showAmountError}
            aria-describedby={showAmountError ? amountErrorId : undefined}
            autoFocus
          />
        </label>
        {showAmountError && (
          <p id={amountErrorId} className="text-xs text-danger">
            Ingresá un monto mayor a 0.
          </p>
        )}

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
          <DatePicker value={date} onChange={setDate} />
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
    </Modal>
  );
}
