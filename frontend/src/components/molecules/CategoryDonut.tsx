import type { CategorySpending } from '@/types/report';
import { formatMoney } from '@/lib/format';

interface CategoryDonutProps {
  byCategory: CategorySpending[];
}

export function CategoryDonut({ byCategory }: CategoryDonutProps) {
  const total = byCategory.reduce((sum, c) => sum + c.total, 0);

  if (byCategory.length === 0 || total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-default bg-bg-surface/40 px-6 py-12 text-center text-text-muted">
        Sin gastos registrados este mes.
      </div>
    );
  }

  // Cada categoría ocupa un tramo del conic-gradient proporcional a su gasto.
  let cumulative = 0;
  const stops = byCategory.map((c) => {
    const start = (cumulative / total) * 100;
    cumulative += c.total;
    const end = (cumulative / total) * 100;
    return `${c.color} ${String(start)}% ${String(end)}%`;
  });
  const gradient = `conic-gradient(${stops.join(', ')})`;

  return (
    <div className="flex flex-col items-center gap-6 rounded-lg border border-border-default bg-bg-surface/70 p-6 backdrop-blur-sm sm:flex-row sm:gap-8">
      <div
        role="img"
        aria-label="Gasto por categoría"
        className="relative h-44 w-44 shrink-0 rounded-full"
        style={{ background: gradient }}
      >
        <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-bg-surface text-center">
          <span className="text-xs text-text-subtle">Gastado</span>
          <span className="font-mono text-sm text-text-primary">{formatMoney(total, 'CLP')}</span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-2">
        {byCategory.map((c) => (
          <li
            key={c.categoryId ?? 'sin-categoria'}
            className="flex items-center gap-3 text-sm"
          >
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: c.color }}
            />
            <span className="flex-1 text-text-primary">{c.categoryName}</span>
            <span className="font-mono text-text-muted">{formatMoney(c.total, 'CLP')}</span>
            <span className="w-10 text-right font-mono text-xs text-text-subtle">
              {Math.round((c.total / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
