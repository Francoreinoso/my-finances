import type { RecurringTransfer } from './RecurringTransfer.js';
import type { Transaction } from '@/domain/transaction/Transaction.js';

export interface RecurringTransferRepository {
  findAll(): Promise<RecurringTransfer[]>;
  findById(id: string): Promise<RecurringTransfer | null>;
  /** Inserta un aporte nuevo o actualiza uno existente (upsert por id). */
  save(recurring: RecurringTransfer): Promise<void>;
  /** Elimina el aporte. NO valida dependencias — eso va en el caso de uso. */
  delete(id: string): Promise<void>;
  /** Cuántas transacciones fueron generadas por este aporte (vía recurringId). */
  countTransactions(id: string): Promise<number>;
  /**
   * Confirma un aporte: persiste la transacción generada y guarda el aporte
   * con su fecha avanzada — todo en una transacción SQL atómica. O pasan las
   * dos cosas, o no pasa ninguna.
   */
  confirm(generatedTransaction: Transaction, advancedRecurring: RecurringTransfer): Promise<void>;
}
