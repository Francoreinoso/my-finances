import type { Request, Response } from 'express';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import { listAccountsWithBalance } from '@/application/account/listAccountsWithBalance.js';
import { createAccount } from '@/application/account/createAccount.js';
import { deleteAccount } from '@/application/account/deleteAccount.js';
import type { CreateAccountRequest } from '@/shared/validation/accountSchemas.js';

type IdParams = { id: string };

export function makeAccountController(accounts: AccountRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listAccountsWithBalance(accounts);
      res.json(result);
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const account = await createAccount(accounts, req.body as CreateAccountRequest);
      res.status(201).json(account);
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const result = await deleteAccount(accounts, req.params.id);
      res.json(result);
    },
  };
}

export type AccountController = ReturnType<typeof makeAccountController>;
