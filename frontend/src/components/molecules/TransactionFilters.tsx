import { FIELD_CLASS } from '@/lib/formClasses';
import { formatMonth } from '@/lib/format';
import type { TransactionFilter } from '@/lib/filterTransactions';
import type { Category } from '@/types/category';
import type { TransactionType } from '@/types/transaction';

interface TransactionFiltersProps {
  /** Meses disponibles ('YYYY-MM'), más reciente primero. */
  months: string[];
  categories: Category[];
  filter: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
}

/** Controles para filtrar la tabla de transacciones por mes, tipo y categoría. */
export function TransactionFilters({
  months,
  categories,
  filter,
  onChange,
}: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Mes
        <select
          value={filter.month ?? ''}
          onChange={(e) => onChange({ ...filter, month: e.target.value || null })}
          className={FIELD_CLASS}
        >
          <option value="">Todos</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Tipo
        <select
          value={filter.type ?? ''}
          onChange={(e) =>
            onChange({ ...filter, type: (e.target.value || null) as TransactionType | null })
          }
          className={FIELD_CLASS}
        >
          <option value="">Todos</option>
          <option value="expense">Gastos</option>
          <option value="income">Ingresos</option>
          <option value="transfer">Transferencias</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Categoría
        <select
          value={filter.categoryId ?? ''}
          onChange={(e) => onChange({ ...filter, categoryId: e.target.value || null })}
          className={FIELD_CLASS}
        >
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
