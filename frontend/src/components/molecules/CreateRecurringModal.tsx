import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { MoneyInput } from '@/components/molecules/MoneyInput';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { Account } from '@/types/account';
import type { Bucket } from '@/types/bucket';
import type { CreateRecurringTransferInput } from '@/types/recurring';

interface CreateRecurringModalProps {
  accounts: Account[];
  buckets: Bucket[];
  onClose: () => void;
  onSubmit: (data: CreateRecurringTransferInput) => Promise<void>;
}

export function CreateRecurringModal({
  accounts,
  buckets,
  onClose,
  onSubmit,
}: CreateRecurringModalProps) {
  // Para crear un aporte nuevo: solo cuentas y buckets activos.
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const activeBuckets = buckets.filter((b) => !b.isArchived);
  const [name, setName] = useState('');
  const [fromAccountId, setFromAccountId] = useState(activeAccounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(
    activeAccounts[1]?.id ?? activeAccounts[0]?.id ?? '',
  );
  const [amount, setAmount] = useState('');
  const [bucketId, setBucketId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const nameErrorId = useId();
  const amountErrorId = useId();
  const sameAccountsErrorId = useId();
  const dayErrorId = useId();

  const nameOk = name.trim() !== '';
  const amountNumber = Number(amount.trim());
  const amountOk = amount.trim() !== '' && Number.isFinite(amountNumber) && amountNumber > 0;
  const dayNumber = Number(dayOfMonth);
  const dayOk = Number.isInteger(dayNumber) && dayNumber >= 1 && dayNumber <= 31;
  const accountsDistinct = fromAccountId !== '' && fromAccountId !== toAccountId;
  const showNameError = nameTouched && !nameOk;
  const showAmountError = amountTouched && !amountOk;
  const canSubmit = nameOk && amountOk && dayOk && accountsDistinct && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        fromAccountId,
        toAccountId,
        amount: amountNumber,
        bucketId: bucketId === '' ? null : bucketId,
        dayOfMonth: dayNumber,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el aporte');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <Modal title="Nuevo aporte recurrente" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setNameTouched(true)}
            aria-invalid={showNameError}
            aria-describedby={showNameError ? nameErrorId : undefined}
            placeholder="Ej: Aporte Mudanza"
            maxLength={80}
            autoFocus
            className={FIELD_CLASS}
          />
        </label>
        {showNameError && (
          <p id={nameErrorId} className="text-xs text-danger">
            El nombre no puede estar vacío.
          </p>
        )}

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
            aria-invalid={!accountsDistinct}
            aria-describedby={!accountsDistinct ? sameAccountsErrorId : undefined}
            className={FIELD_CLASS}
          >
            {activeAccounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        {!accountsDistinct && (
          <p id={sameAccountsErrorId} className="text-xs text-danger">
            La cuenta de origen y la de destino deben ser distintas.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto del aporte
          <MoneyInput
            value={amount}
            onChange={(v) => {
              setAmount(v);
              setAmountTouched(true);
            }}
            placeholder="0"
          />
        </label>
        {showAmountError && (
          <p id={amountErrorId} className="text-xs text-danger">
            Ingresá un monto mayor a 0.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Día del mes
          <input
            type="number"
            min={1}
            max={31}
            step={1}
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            aria-invalid={!dayOk}
            aria-describedby={!dayOk ? dayErrorId : undefined}
            className={FIELD_CLASS}
          />
          <span className="text-xs text-text-subtle">
            Si el mes no tiene ese día (ej: 31 en febrero), se ajusta al último día disponible.
          </span>
        </label>
        {!dayOk && (
          <p id={dayErrorId} className="text-xs text-danger">
            El día debe ser un entero entre 1 y 31.
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Bucket vinculado <span className="text-text-subtle">(opcional)</span>
          <select
            value={bucketId}
            onChange={(e) => setBucketId(e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Sin bucket</option>
            {activeBuckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
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
