import type { Account, CreateAccountInput } from '@/domain/account/Account.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';

/** Crea una cuenta nueva. El input ya viene validado por Zod en el borde. */
export async function createAccount(
  accounts: AccountRepository,
  input: CreateAccountInput,
): Promise<Account> {
  const account: Account = {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    currency: input.currency,
    isArchived: false,
    createdAt: new Date().toISOString(),
  };
  await accounts.save(account);
  return account;
}
