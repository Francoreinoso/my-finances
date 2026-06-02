import { Button } from '@/components/atoms/Button';
import type { Account, AccountType } from '@/types/account';
import { formatMoney } from '@/lib/format';

const TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Cuenta corriente',
  savings: 'Ahorro',
  investment: 'Inversión',
  cash: 'Efectivo',
};

interface AccountRowProps {
  account: Account;
  onDelete: () => void;
}

export function AccountRow({ account, onDelete }: AccountRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border-default bg-bg-surface/70 px-4 py-3 backdrop-blur-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-text-primary" title={account.name}>
          {account.name}
        </p>
        <p className="text-xs text-text-subtle">{TYPE_LABELS[account.type]}</p>
      </div>
      <p className="shrink-0 font-mono text-lg text-accent">
        {formatMoney(account.balance, account.currency)}
      </p>
      <Button variant="danger" size="sm" onClick={onDelete} className="shrink-0">
        Eliminar
      </Button>
    </div>
  );
}
