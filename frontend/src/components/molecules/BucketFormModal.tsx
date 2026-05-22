import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { DatePicker } from '@/components/molecules/DatePicker';
import { MoneyInput } from '@/components/molecules/MoneyInput';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { Account } from '@/types/account';
import type { Bucket, CreateBucketInput } from '@/types/bucket';

interface BucketFormModalProps {
  /** null = crear un bucket nuevo; un Bucket = editar ese. */
  bucket: Bucket | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: CreateBucketInput) => Promise<void>;
}

export function BucketFormModal({ bucket, accounts, onClose, onSubmit }: BucketFormModalProps) {
  const [name, setName] = useState(bucket?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(
    bucket?.targetAmount != null ? String(bucket.targetAmount) : '',
  );
  const [targetDate, setTargetDate] = useState(bucket?.targetDate ?? '');
  const [accountId, setAccountId] = useState(bucket?.accountId ?? accounts[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const nameErrorId = useId();

  const nameOk = name.trim() !== '';
  const showNameError = nameTouched && !nameOk;
  const trimmedAmount = targetAmount.trim();
  const amountNumber = trimmedAmount === '' ? null : Number(trimmedAmount);
  const amountValid =
    amountNumber === null || (Number.isFinite(amountNumber) && amountNumber > 0);
  const canSubmit = nameOk && amountValid && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        targetAmount: amountNumber,
        targetDate: targetDate === '' ? null : targetDate,
        accountId: accountId === '' ? null : accountId,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar el bucket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <Modal title={bucket ? 'Editar bucket' : 'Nuevo bucket'} onClose={onClose}>
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
            placeholder="Ej: Viaje"
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
          Monto objetivo <span className="text-text-subtle">(opcional)</span>
          <MoneyInput
            value={targetAmount}
            onChange={setTargetAmount}
            placeholder="Sin meta fija"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Fecha objetivo <span className="text-text-subtle">(opcional)</span>
          <DatePicker value={targetDate} onChange={setTargetDate} />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Cuenta vinculada
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className={FIELD_CLASS}
          >
            <option value="">Sin cuenta</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
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
