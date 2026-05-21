import type { Request, Response } from 'express';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import type {
  CreateTransactionInput,
  TransactionChanges,
} from '@/domain/transaction/Transaction.js';
import { addTransaction } from '@/application/transaction/addTransaction.js';
import { listRecentTransactions } from '@/application/transaction/listRecentTransactions.js';
import { updateTransaction } from '@/application/transaction/updateTransaction.js';
import { deleteTransaction } from '@/application/transaction/deleteTransaction.js';
import { exportTransactionsCsv } from '@/application/transaction/exportTransactionsCsv.js';
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '@/shared/validation/transactionSchemas.js';
import { QueryValidationError } from '@/infrastructure/http/errors.js';

type IdParams = { id: string };

/** Convierte el query param `limit` a número, o lanza si es basura. */
function parseLimit(raw: unknown): number | undefined {
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') {
    throw new QueryValidationError('El parámetro limit debe ser un número');
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new QueryValidationError(`limit inválido: "${raw}"`);
  }
  return parsed;
}

/**
 * Adapta el body HTTP al input del dominio.
 * - Transferencia: dos cuentas explícitas, sin categoría.
 * - Ingreso/gasto: una sola cuenta — en un ingreso es el destino, en un
 *   gasto es el origen.
 */
function toCreateInput(body: CreateTransactionRequest): CreateTransactionInput {
  if (body.type === 'transfer') {
    const input: CreateTransactionInput = {
      date: body.date,
      amount: body.amount,
      type: 'transfer',
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
    };
    if (body.description !== undefined) input.description = body.description;
    return input;
  }

  const input: CreateTransactionInput = {
    date: body.date,
    amount: body.amount,
    type: body.type,
  };
  if (body.type === 'income') {
    input.toAccountId = body.accountId;
  } else {
    input.fromAccountId = body.accountId;
  }
  if (body.categoryId !== undefined) input.categoryId = body.categoryId;
  if (body.description !== undefined) input.description = body.description;
  return input;
}

/** Arma los cambios del dominio desde el body de PATCH (solo lo que vino). */
function toChanges(body: UpdateTransactionRequest): TransactionChanges {
  const changes: TransactionChanges = {};
  if (body.amount !== undefined) changes.amount = body.amount;
  if (body.date !== undefined) changes.date = body.date;
  if (body.categoryId !== undefined) changes.categoryId = body.categoryId;
  if (body.description !== undefined) changes.description = body.description;
  return changes;
}

export function makeTransactionController(
  transactions: TransactionRepository,
  accounts: AccountRepository,
  categories: CategoryRepository,
) {
  return {
    list: async (req: Request, res: Response): Promise<void> => {
      const limit = parseLimit(req.query['limit']);
      const result = await listRecentTransactions(transactions, limit);
      res.json(result.map((t) => t.toJSON()));
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const body = req.body as CreateTransactionRequest;
      const transaction = await addTransaction(
        transactions,
        accounts,
        categories,
        toCreateInput(body),
      );
      res.status(201).json(transaction.toJSON());
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateTransactionRequest;
      const updated = await updateTransaction(
        transactions,
        categories,
        req.params.id,
        toChanges(body),
      );
      res.json(updated.toJSON());
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      await deleteTransaction(transactions, req.params.id);
      res.status(204).send();
    },

    exportCsv: async (_req: Request, res: Response): Promise<void> => {
      const csv = await exportTransactionsCsv(transactions, accounts, categories);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="transacciones.csv"');
      res.send(csv);
    },
  };
}

export type TransactionController = ReturnType<typeof makeTransactionController>;
