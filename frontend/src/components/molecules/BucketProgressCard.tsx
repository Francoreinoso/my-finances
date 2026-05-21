import type { Currency } from '@/types/account';
import type { Bucket } from '@/types/bucket';
import { formatMoney } from '@/lib/format';

function ProgressBar({
  progress,
  target,
  currency,
}: {
  progress: number;
  target: number;
  currency: Currency;
}) {
  const pct = Math.min(100, Math.round((progress / target) * 100));
  const remaining = Math.max(0, target - progress);

  return (
    <>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className="h-full rounded-full"
          style={{ width: `${String(pct)}%`, background: 'var(--gradient-prism)' }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-text-muted">
        <span>{pct}% alcanzado</span>
        <span>Faltan {formatMoney(remaining, currency)}</span>
      </div>
    </>
  );
}

interface BucketProgressCardProps {
  bucket: Bucket;
  onEdit: () => void;
}

export function BucketProgressCard({ bucket, onEdit }: BucketProgressCardProps) {
  const { name, targetAmount, targetDate, progress, currency } = bucket;
  const hasTarget = targetAmount !== null && targetAmount > 0;

  return (
    <div className="rounded-lg border border-border-default bg-bg-surface/70 p-5 backdrop-blur-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate font-medium text-text-primary" title={name}>
          {name}
        </h3>
        <div className="flex shrink-0 items-center gap-3">
          {targetDate !== null && (
            <span className="font-mono text-xs text-text-subtle">meta: {targetDate}</span>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-text-muted hover:text-accent"
          >
            Editar
          </button>
        </div>
      </div>

      <p className="mt-2 font-mono text-lg text-text-primary">
        {formatMoney(progress, currency)}
        {hasTarget && (
          <span className="text-sm text-text-subtle">
            {' / '}
            {formatMoney(targetAmount, currency)}
          </span>
        )}
      </p>

      {hasTarget ? (
        <ProgressBar progress={progress} target={targetAmount} currency={currency} />
      ) : (
        <p className="mt-3 text-xs text-text-subtle">Sin meta fija — se acumula sin tope.</p>
      )}
    </div>
  );
}
