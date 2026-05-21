import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import type { CreateTransactionInput } from '@/types/transaction';
import { todayISO } from '@/lib/format';

type TxType = 'income' | 'expense';

interface NewTransactionModalProps {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: CreateTransactionInput) => Promise<void>;
}

const FIELD_CLASS =
  'rounded-md border border-border-default bg-bg-surface/60 px-3 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none';

export function NewTransactionModal({
  accounts,
  categories,
  onClose,
  onSubmit,
}: NewTransactionModalProps) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
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

  const visibleCategories = categories.filter((c) => c.type === type);
  const amountNumber = Number(amount);
  const canSubmit =
    Number.isFinite(amountNumber) && amountNumber > 0 && accountId !== '' && !submitting;

  // Al cambiar el tipo, la categoría elegida puede no aplicar al nuevo tipo.
  const changeType = (next: TxType) => {
    setType(next);
    setCategoryId('');
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        date,
        amount: amountNumber,
        type,
        accountId,
        categoryId: categoryId === '' ? null : categoryId,
        description: description.trim() === '' ? null : description.trim(),
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la transacción');
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
      aria-label="Nueva transacción"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl"
      >
        <h3 className="font-mono text-xl text-text-primary">Nueva transacción</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changeType('expense')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              type === 'expense' ? 'bg-danger/20 text-danger' : 'bg-bg-elevated text-text-muted'
            }`}
          >
            Gasto
          </button>
          <button
            type="button"
            onClick={() => changeType('income')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              type === 'income' ? 'bg-success/20 text-success' : 'bg-bg-elevated text-text-muted'
            }`}
          >
            Ingreso
          </button>
        </div>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Cuenta
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={FIELD_CLASS}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>

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
            placeholder="Ej: Almuerzo"
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
