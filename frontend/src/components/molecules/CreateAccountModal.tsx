import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { AccountType, CreateAccountInput, Currency } from '@/types/account';

interface CreateAccountModalProps {
  onClose: () => void;
  onSubmit: (data: CreateAccountInput) => Promise<void>;
}

export function CreateAccountModal({ onClose, onSubmit }: CreateAccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [currency, setCurrency] = useState<Currency>('CLP');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const nameErrorId = useId();

  const nameOk = name.trim() !== '';
  const showNameError = nameTouched && !nameOk;
  const canSubmit = nameOk && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), type, currency });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <Modal title="Nueva cuenta" onClose={onClose} size="sm">
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
            placeholder="Ej: Banco Estado"
            maxLength={60}
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
          Tipo
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AccountType)}
            className={FIELD_CLASS}
          >
            <option value="checking">Cuenta corriente</option>
            <option value="savings">Ahorro</option>
            <option value="investment">Inversión</option>
            <option value="cash">Efectivo</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Moneda
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className={FIELD_CLASS}
          >
            <option value="CLP">CLP</option>
            <option value="UF">UF</option>
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
