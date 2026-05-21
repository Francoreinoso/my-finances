import type { AccountWithBalance } from '@/domain/account/Account.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';

export function listAccountsWithBalance(repo: AccountRepository): Promise<AccountWithBalance[]> {
  return repo.findAllWithBalance();
}
