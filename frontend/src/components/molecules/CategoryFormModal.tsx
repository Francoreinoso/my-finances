import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button';
import type { Category, CategoryType, CreateCategoryInput } from '@/types/category';

interface CategoryFormModalProps {
  /** null = crear una categoría nueva; una Category = editar esa. */
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput) => Promise<void>;
}

const FIELD_CLASS =
  'rounded-md border border-border-default bg-bg-surface/60 px-3 py-2 text-text-primary placeholder:text-text-subtle focus:border-accent focus:outline-none';

export function CategoryFormModal({ category, onClose, onSubmit }: CategoryFormModalProps) {
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<CategoryType>(category?.type ?? 'expense');
  const [color, setColor] = useState(category?.color ?? '#10b981');
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

  const isEdit = category !== null;
  const canSubmit = name.trim() !== '' && !submitting;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Editar categoría' : 'Nueva categoría'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl"
      >
        <h3 className="font-mono text-xl text-text-primary">
          {isEdit ? 'Editar categoría' : 'Nueva categoría'}
        </h3>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Nombre
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Mascotas"
            maxLength={60}
            autoFocus
            className={FIELD_CLASS}
          />
        </label>

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
    </div>
  );
}
