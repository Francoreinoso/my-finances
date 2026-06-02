import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { DatePicker } from '@/components/molecules/DatePicker';
import { MoneyInput } from '@/components/molecules/MoneyInput';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import type { CreateTransactionInput, TransactionType } from '@/types/transaction';
import { todayISO } from '@/lib/format';

interface NewTransactionModalProps {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (input: CreateTransactionInput) => Promise<void>;
}

const TYPE_STYLES: Record<TransactionType, string> = {
  expense: 'bg-danger/20 text-danger',
  income: 'bg-success/20 text-success',
  transfer: 'bg-accent/20 text-accent',
};

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: 'Gasto',
  income: 'Ingreso',
  transfer: 'Transferencia',
};

export function NewTransactionModal({
  accounts,
  categories,
  onClose,
  onSubmit,
}: NewTransactionModalProps) {
  const initialActive = accounts.filter((a) => !a.isArchived);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(initialActive[0]?.id ?? '');
  const [fromAccountId, setFromAccountId] = useState(initialActive[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(initialActive[1]?.id ?? '');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountTouched, setAmountTouched] = useState(false);
  const amountErrorId = useId();

  const isTransfer = type === 'transfer';
  // Para una transacción nueva: solo cuentas y categorías activas.
  const activeAccounts = initialActive;
  const visibleCategories = categories.filter((c) => c.type === type && !c.isArchived);
  const amountNumber = Number(amount);
  const amountOk = Number.isFinite(amountNumber) && amountNumber > 0;
  const showAmountError = amountTouched && !amountOk;
  const sameAccount = isTransfer && fromAccountId !== '' && fromAccountId === toAccountId;
  const accountsOk = isTransfer
    ? fromAccountId !== '' && toAccountId !== '' && !sameAccount
    : accountId !== '';
  const canSubmit = amountOk && accountsOk && !submitting;

  // Al cambiar el tipo, la categoría elegida puede no aplicar al nuevo tipo.
  const changeType = (next: TransactionType) => {
    setType(next);
    setCategoryId('');
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const trimmed = description.trim();
      const desc = trimmed === '' ? null : trimmed;
      let input: CreateTransactionInput;
      if (type === 'transfer') {
        input = {
          type: 'transfer',
          date,
          amount: amountNumber,
          fromAccountId,
          toAccountId,
          description: desc,
        };
      } else {
        input = {
          type,
          date,
          amount: amountNumber,
          accountId,
          categoryId: categoryId === '' ? null : categoryId,
          description: desc,
        };
      }
      await onSubmit(input);
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
    <Modal title="Nueva transacción" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div role="group" aria-label="Tipo de transacción" className="grid grid-cols-3 gap-2">
          {(['expense', 'income', 'transfer'] as const).map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={type === t}
              onClick={() => changeType(t)}
              className={`rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                type === t ? TYPE_STYLES[t] : 'bg-bg-elevated text-text-muted'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto
          <MoneyInput
            value={amount}
            onChange={setAmount}
            onBlur={() => setAmountTouched(true)}
            aria-invalid={showAmountError}
            aria-describedby={showAmountError ? amountErrorId : undefined}
            placeholder="0"
            autoFocus
          />
        </label>
        {showAmountError && (
          <p id={amountErrorId} className="text-xs text-danger">
            Ingresá un monto mayor a 0.
          </p>
        )}

        {isTransfer ? (
          <>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Cuenta origen
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className={FIELD_CLASS}
              >
                {activeAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Cuenta destino
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className={FIELD_CLASS}
              >
                {activeAccounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            {sameAccount && (
              <p className="text-xs text-danger">Elegí una cuenta de destino distinta.</p>
            )}
          </>
        ) : (
          <>
            <label className="flex flex-col gap-1 text-sm text-text-muted">
              Cuenta
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={FIELD_CLASS}
              >
                {activeAccounts.map((a) => (
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
          </>
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
            placeholder="Ej: Aporte a Mudanza"
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
