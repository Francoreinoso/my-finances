import type { Request, Response } from 'express';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import type { RecurringTransferChanges } from '@/domain/recurring/RecurringTransfer.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import { listRecurringTransfers } from '@/application/recurring/listRecurringTransfers.js';
import { confirmRecurringTransfer } from '@/application/recurring/confirmRecurringTransfer.js';
import { updateRecurringTransfer } from '@/application/recurring/updateRecurringTransfer.js';
import { createRecurringTransfer } from '@/application/recurring/createRecurringTransfer.js';
import { deleteRecurringTransfer } from '@/application/recurring/deleteRecurringTransfer.js';
import type {
  CreateRecurringRequest,
  UpdateRecurringRequest,
} from '@/shared/validation/recurringSchemas.js';
import { todayISO } from '@/shared/date.js';

type IdParams = { id: string };

export function makeRecurringController(
  recurring: RecurringTransferRepository,
  accounts: AccountRepository,
  buckets: BucketRepository,
) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listRecurringTransfers(recurring, todayISO());
      res.json(result);
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as CreateRecurringRequest;
      const created = await createRecurringTransfer(recurring, accounts, buckets, {
        name: body.name,
        fromAccountId: body.fromAccountId,
        toAccountId: body.toAccountId,
        amount: body.amount,
        bucketId: body.bucketId,
        dayOfMonth: body.dayOfMonth,
        today: todayISO(),
      });
      res.status(201).json(created.toJSON());
    },

    confirm: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const transaction = await confirmRecurringTransfer(recurring, req.params.id, todayISO());
      res.status(201).json(transaction.toJSON());
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateRecurringRequest;
      const changes: RecurringTransferChanges = {};
      if (body.amount !== undefined) changes.amount = body.amount;
      if (body.isActive !== undefined) changes.isActive = body.isActive;
      const updated = await updateRecurringTransfer(recurring, req.params.id, changes);
      res.json(updated.toJSON());
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const result = await deleteRecurringTransfer(recurring, req.params.id);
      res.json(result);
    },
  };
}

export type RecurringController = ReturnType<typeof makeRecurringController>;
