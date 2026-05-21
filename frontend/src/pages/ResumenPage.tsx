import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { SummaryStat } from '@/components/molecules/SummaryStat';
import { CategoryDonut } from '@/components/molecules/CategoryDonut';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';
import { formatMoney, formatMonth } from '@/lib/format';

const NAV_BUTTON =
  'rounded-md px-3 py-1 text-lg leading-none text-text-muted hover:bg-bg-elevated hover:text-text-primary';

export function ResumenPage() {
  const { month, summary, status, error, goToPreviousMonth, goToNextMonth } = useMonthlySummary();

  return (
    <section className="mx-auto max-w-3xl">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-3xl tracking-tight text-text-primary">Resumen</h1>
          <p className="text-sm text-text-muted">
            Tus ingresos, gastos y tasa de ahorro del mes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToPreviousMonth}
            aria-label="Mes anterior"
            className={NAV_BUTTON}
          >
            ‹
          </button>
          <span className="min-w-40 text-center text-sm text-text-primary">
            {formatMonth(month)}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Mes siguiente"
            className={NAV_BUTTON}
          >
            ›
          </button>
        </div>
      </header>

      {status === 'loading' && <PageSkeleton variant="summary" />}

      {status === 'error' && (
        <div
          role="alert"
          className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
        >
          {error ?? 'Error al cargar el resumen'}
        </div>
      )}

      {status === 'ready' && summary && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryStat
              label="Ingresos"
              value={formatMoney(summary.income, 'CLP')}
              tone="positive"
            />
            <SummaryStat
              label="Gastos"
              value={formatMoney(summary.expense, 'CLP')}
              tone="negative"
            />
            <SummaryStat
              label="Neto"
              value={formatMoney(summary.net, 'CLP')}
              tone={summary.net >= 0 ? 'positive' : 'negative'}
            />
            <SummaryStat
              label="Tasa de ahorro"
              value={`${String(Math.round(summary.savingsRate * 100))}%`}
              tone={summary.savingsRate >= 0 ? 'positive' : 'negative'}
            />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-text-subtle">
              Gasto por categoría
            </h2>
            <CategoryDonut byCategory={summary.byCategory} />
          </div>
        </div>
      )}
    </section>
  );
}
