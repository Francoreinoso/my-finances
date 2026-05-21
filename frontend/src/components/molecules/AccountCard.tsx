import type { Account, AccountType } from '@/types/account';
import { formatMoney } from '@/lib/format';

const TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Cuenta corriente',
  savings: 'Ahorro',
  investment: 'Inversión',
  cash: 'Efectivo',
};

export function AccountCard({ account }: { account: Account }) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-surface/70 p-4 backdrop-blur-sm">
      <p className="truncate text-sm font-medium text-text-primary" title={account.name}>
        {account.name}
      </p>
      <p className="text-xs text-text-subtle">{TYPE_LABELS[account.type]}</p>
      <p className="mt-2 font-mono text-xl text-accent">
        {formatMoney(account.balance, account.currency)}
      </p>
    </div>
  );
}
