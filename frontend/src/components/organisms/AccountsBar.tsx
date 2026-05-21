import type { Account } from '@/types/account';
import { AccountCard } from '@/components/molecules/AccountCard';

export function AccountsBar({ accounts }: { accounts: Account[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {accounts.map((account) => (
        <AccountCard key={account.id} account={account} />
      ))}
    </div>
  );
}
