import type { RecurringTransfer } from './RecurringTransfer.js';
import type { Transaction } from '@/domain/transaction/Transaction.js';

export interface RecurringTransferRepository {
  findAll(): Promise<RecurringTransfer[]>;
  findById(id: string): Promise<RecurringTransfer | null>;
  /** Guarda los cambios de un aporte ya existente (monto, estado activo). */
  save(recurring: RecurringTransfer): Promise<void>;
  /**
   * Confirma un aporte: persiste la transacción generada y guarda el aporte
   * con su fecha avanzada — todo en una transacción SQL atómica. O pasan las
   * dos cosas, o no pasa ninguna.
   */
  confirm(generatedTransaction: Transaction, advancedRecurring: RecurringTransfer): Promise<void>;
}
