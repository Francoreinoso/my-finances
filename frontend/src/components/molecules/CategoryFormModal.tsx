import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';
import { FIELD_CLASS } from '@/lib/formClasses';
import type { Category, CategoryType, CreateCategoryInput } from '@/types/category';

interface CategoryFormModalProps {
  /** null = crear una categoría nueva; una Category = editar esa. */
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
}

export function CategoryFormModal({ category, onClose, onSubmit }: CategoryFormModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<CategoryType>(category?.type ?? 'expense');
  const [color, setColor] = useState(category?.color ?? '#10b981');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const nameErrorId = useId();

  const isEdit = category !== null;
  const nameOk = name.trim() !== '';
  const showNameError = nameTouched && !nameOk;
  const canSubmit = nameOk && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), type, color });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit();
  };

  return (
    <Modal title={isEdit ? 'Editar categoría' : 'Nueva categoría'} onClose={onClose} size="sm">
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
            placeholder="Ej: Mascotas"
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
            onChange={(e) => setType(e.target.value as CategoryType)}
            disabled={isEdit}
            className={`${FIELD_CLASS} disabled:opacity-60`}
          >
            <option value="expense">Gasto</option>
            <option value="income">Ingreso</option>
          </select>
          {isEdit && (
            <span className="text-xs text-text-subtle">El tipo no se puede cambiar.</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Color
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-md border border-border-default bg-bg-surface/60"
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
