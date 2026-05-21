import type { Category } from '@/types/category';

interface CategoryRowProps {
  category: Category;
  onEdit: () => void;
}

export function CategoryRow({ category, onEdit }: CategoryRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-default bg-bg-surface/70 px-4 py-3 backdrop-blur-sm">
      <span
        aria-hidden="true"
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <span className="flex-1 text-text-primary">{category.name}</span>
      <span className="text-xs uppercase tracking-wider text-text-subtle">
        {category.type === 'income' ? 'ingreso' : 'gasto'}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="text-xs text-text-muted hover:text-accent"
      >
        Editar
      </button>
    </div>
  );
}
