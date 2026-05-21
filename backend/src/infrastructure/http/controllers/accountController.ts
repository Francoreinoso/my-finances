import type { Request, Response } from 'express';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import { listAccountsWithBalance } from '@/application/account/listAccountsWithBalance.js';

export function makeAccountController(accounts: AccountRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listAccountsWithBalance(accounts);
      res.json(result);
    },
  };
}

export type AccountController = ReturnType<typeof makeAccountController>;
