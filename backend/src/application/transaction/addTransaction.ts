import {
  Transaction,
  type CreateTransactionInput,
  type TransactionType,
} from '@/domain/transaction/Transaction.js';
import { TransactionValidationError } from '@/domain/transaction/errors.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';

async function assertAccountExists(
  repo: AccountRepository,
  accountId: string | null,
  rol: string,
): Promise<void> {
  if (accountId === null) return;
  const account = await repo.findById(accountId);
  if (account === null) {
    throw new TransactionValidationError(`La cuenta de ${rol} "${accountId}" no existe`);
  }
}

async function assertCategoryMatches(
  repo: CategoryRepository,
  categoryId: string | null,
  transactionType: TransactionType,
): Promise<void> {
  if (categoryId === null) return;
  const category = await repo.findById(categoryId);
  if (category === null) {
    throw new TransactionValidationError(`La categoría "${categoryId}" no existe`);
  }
  if (category.type !== transactionType) {
    throw new TransactionValidationError(
      `La categoría "${category.name}" es de tipo ${category.type}, ` +
        `no corresponde a una transacción de tipo ${transactionType}`,
    );
  }
}

/**
 * Crea una transacción. La entidad valida la FORMA (monto, fecha, coherencia
 * tipo/cuentas); este caso de uso valida la INTEGRIDAD REFERENCIAL — que las
 * cuentas y la categoría referenciadas existan de verdad, algo que la entidad
 * no puede saber sola porque no tiene acceso a la base.
 */
export async function addTransaction(
  transactions: TransactionRepository,
  accounts: AccountRepository,
  categories: CategoryRepository,
  input: CreateTransactionInput,
): Promise<Transaction> {
  const transaction = Transaction.create(input);

  await assertAccountExists(accounts, transaction.fromAccountId, 'origen');
  await assertAccountExists(accounts, transaction.toAccountId, 'destino');
  await assertCategoryMatches(categories, transaction.categoryId, transaction.type);

  await transactions.create(transaction);
  return transaction;
}
