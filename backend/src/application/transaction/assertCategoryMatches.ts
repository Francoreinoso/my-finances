import { TransactionValidationError } from '@/domain/transaction/errors.js';
import type { TransactionType } from '@/domain/transaction/Transaction.js';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';

/**
 * Valida que la categoría referenciada exista y que su tipo coincida con el de
 * la transacción (un ingreso no puede usar una categoría de gasto). Si no hay
 * categoría, no hay nada que validar. Compartido por addTransaction y
 * updateTransaction — la regla vive en un solo lugar.
 */
export async function assertCategoryMatches(
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
