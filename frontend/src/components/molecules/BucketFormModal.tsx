import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Account } from '@/types/account';
import type { Bucket, CreateBucketInput } from '@/types/bucket';

interface BucketFormModalProps {
  /** null = crear un bucket nuevo; un Bucket = editar ese. */
  bucket: Bucket | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (data: CreateBucketInput) => Promise<void>;
}

const FIELD_CLASS =
  'rounded-md border border-border-default bg-bg-surface/60 px-3 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none';

export function BucketFormModal({ bucket, accounts, onClose, onSubmit }: BucketFormModalProps) {
  const [name, setName] = useState(bucket?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(
    bucket?.targetAmount != null ? String(bucket.targetAmount) : '',
  );
  const [targetDate, setTargetDate] = useState(bucket?.targetDate ?? '');
  const [accountId, setAccountId] = useState(bucket?.accountId ?? accounts[0]?.id ?? '');
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

  const trimmedAmount = targetAmount.trim();
  const amountNumber = trimmedAmount === '' ? null : Number(trimmedAmount);
  const amountValid =
    amountNumber === null || (Number.isFinite(amountNumber) && amountNumber > 0);
  const canSubmit = name.trim() !== '' && amountValid && !submitting;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={bucket ? 'Editar bucket' : 'Nuevo bucket'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl"
      >
        <h3 className="font-mono text-xl text-text-primary">
          {bucket ? 'Editar bucket' : 'Nuevo bucket'}
        </h3>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Viaje"
            maxLength={80}
            autoFocus
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Monto objetivo <span className="text-text-subtle">(opcional)</span>
          <input
            type="number"
            inputMode="decimal"
            min="1"
            step="any"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="Sin meta fija"
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Fecha objetivo <span className="text-text-subtle">(opcional)</span>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={FIELD_CLASS}
          />
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
    </div>
  );
}
