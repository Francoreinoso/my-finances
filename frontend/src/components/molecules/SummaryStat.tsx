type Tone = 'default' | 'positive' | 'negative';

interface SummaryStatProps {
  label: string;
  value: string;
  tone?: Tone;
}

const TONE_CLASS: Record<Tone, string> = {
  default: 'text-text-primary',
  positive: 'text-success',
  negative: 'text-danger',
};

export function SummaryStat({ label, value, tone = 'default' }: SummaryStatProps) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface/70 p-4 backdrop-blur-sm">
      <p className="text-xs uppercase tracking-wider text-text-subtle">{label}</p>
      <p className={`mt-1 font-mono text-xl ${TONE_CLASS[tone]}`}>{value}</p>
    </div>
  );
}
