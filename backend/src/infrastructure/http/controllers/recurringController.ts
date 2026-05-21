import type { Request, Response } from 'express';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import { listRecurringTransfers } from '@/application/recurring/listRecurringTransfers.js';
import { confirmRecurringTransfer } from '@/application/recurring/confirmRecurringTransfer.js';
import { todayISO } from '@/shared/date.js';

type IdParams = { id: string };

export function makeRecurringController(recurring: RecurringTransferRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listRecurringTransfers(recurring, todayISO());
      res.json(result);
    },

    confirm: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const transaction = await confirmRecurringTransfer(recurring, req.params.id, todayISO());
      res.status(201).json(transaction.toJSON());
    },
  };
}

export type RecurringController = ReturnType<typeof makeRecurringController>;
