import { useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { useToasts } from '@/stores/useToasts';
import { Button } from '@/components/atoms/Button';
import { CategoryRow } from '@/components/molecules/CategoryRow';
import { EmptyState } from '@/components/molecules/EmptyState';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';
import { CategoryFormModal } from '@/components/molecules/CategoryFormModal';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';
import type { Category } from '@/types/category';

export function CategoriasPage() {
  const { categories, status, error, create, update, remove } = useCategories();
  // null = cerrado; 'new' = crear; una Category = editar esa.
  const [formTarget, setFormTarget] = useState<Category | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const notify = useToasts((state) => state.notify);

  // Ingresos primero, gastos después. Filtramos archivadas (decisión del proyecto).
  const sorted = categories
    .filter((c) => !c.isArchived)
    .sort((a, b) => (a.type === b.type ? 0 : a.type === 'income' ? -1 : 1));

  const handleDelete = async () => {
    if (deleting === null) return;
    try {
      await remove(deleting.id);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'No se pudo eliminar la categoría');
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl tracking-tight text-text-primary">Categorías</h1>
          <p className="text-sm text-text-muted">Las etiquetas de tus ingresos y gastos.</p>
        </div>
        <Button onClick={() => setFormTarget('new')} disabled={status !== 'ready'}>
          + Nueva
        </Button>
      </header>

      {status === 'loading' && <PageSkeleton variant="rows" />}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar las categorías'}
        </div>
      )}

      {status === 'ready' &&
        (sorted.length === 0 ? (
          <EmptyState
            title="Todavía no tenés categorías"
            hint="Creá la primera con el botón de arriba."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onEdit={() => setFormTarget(category)}
                onDelete={() => setDeleting(category)}
              />
            ))}
          </div>
        ))}

      {formTarget !== null && (
        <CategoryFormModal
          category={formTarget === 'new' ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSubmit={(data) =>
            formTarget === 'new'
              ? create(data)
              : update(formTarget.id, { name: data.name, color: data.color })
          }
        />
      )}

      {deleting !== null && (
        <ConfirmDialog
          title={`Eliminar "${deleting.name}"`}
          message="Si la categoría no fue usada en ninguna transacción, se borra definitivamente. Si tiene historia, queda archivada (no se pierde nada)."
          confirmLabel="Eliminar"
          onConfirm={() => void handleDelete()}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  );
}
