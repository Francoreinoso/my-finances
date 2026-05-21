import type { Request, Response } from 'express';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import type { CreateTransactionInput } from '@/domain/transaction/Transaction.js';
import { addTransaction } from '@/application/transaction/addTransaction.js';
import { listRecentTransactions } from '@/application/transaction/listRecentTransactions.js';
import type { CreateTransactionRequest } from '@/shared/validation/transactionSchemas.js';
import { QueryValidationError } from '@/infrastructure/http/errors.js';

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
 * Adapta el body HTTP al input del dominio. En Fase 1 el cliente manda una
 * sola cuenta: en un ingreso es el destino, en un gasto es el origen.
 */
function toCreateInput(body: CreateTransactionRequest): CreateTransactionInput {
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
  };
}

export type TransactionController = ReturnType<typeof makeTransactionController>;
