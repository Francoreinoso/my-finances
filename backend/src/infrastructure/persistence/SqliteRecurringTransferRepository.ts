import { count, eq } from 'drizzle-orm';
import { RecurringTransfer } from '@/domain/recurring/RecurringTransfer.js';
import type { RecurringTransferRepository } from '@/domain/recurring/RecurringTransferRepository.js';
import type { Transaction } from '@/domain/transaction/Transaction.js';
import { recurringTransfers, transactions, type RecurringTransferRow } from './schema.js';
import type { DB } from './db.js';

function toRecurringTransfer(row: RecurringTransferRow): RecurringTransfer {
  return RecurringTransfer.fromPersistence({
    id: row.id,
    name: row.name,
    fromAccountId: row.fromAccountId,
    toAccountId: row.toAccountId,
    amount: row.amount,
    bucketId: row.bucketId,
    dayOfMonth: row.dayOfMonth,
    nextDueDate: row.nextDueDate,
    isActive: row.isActive,
    isArchived: row.isArchived,
  });
}

export class SqliteRecurringTransferRepository implements RecurringTransferRepository {
  constructor(private readonly db: DB) {}

  findAll(): Promise<RecurringTransfer[]> {
    const rows = this.db.select().from(recurringTransfers).all();
    return Promise.resolve(rows.map(toRecurringTransfer));
  }

  findById(id: string): Promise<RecurringTransfer | null> {
    const row = this.db
      .select()
      .from(recurringTransfers)
      .where(eq(recurringTransfers.id, id))
      .get();
    return Promise.resolve(row ? toRecurringTransfer(row) : null);
  }

  save(recurring: RecurringTransfer): Promise<void> {
    const rt = recurring.toJSON();
    this.db
      .insert(recurringTransfers)
      .values({
        id: rt.id,
        name: rt.name,
        fromAccountId: rt.fromAccountId,
        toAccountId: rt.toAccountId,
        amount: rt.amount,
        bucketId: rt.bucketId,
        dayOfMonth: rt.dayOfMonth,
        nextDueDate: rt.nextDueDate,
        isActive: rt.isActive,
        isArchived: rt.isArchived,
      })
      .onConflictDoUpdate({
        target: recurringTransfers.id,
        set: {
          name: rt.name,
          fromAccountId: rt.fromAccountId,
          toAccountId: rt.toAccountId,
          amount: rt.amount,
          bucketId: rt.bucketId,
          dayOfMonth: rt.dayOfMonth,
          nextDueDate: rt.nextDueDate,
          isActive: rt.isActive,
          isArchived: rt.isArchived,
        },
      })
      .run();
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.db.delete(recurringTransfers).where(eq(recurringTransfers.id, id)).run();
    return Promise.resolve();
  }

  countTransactions(id: string): Promise<number> {
    const [row] = this.db
      .select({ n: count() })
      .from(transactions)
      .where(eq(transactions.recurringId, id))
      .all();
    return Promise.resolve(Number(row?.n ?? 0));
  }

  confirm(
    generatedTransaction: Transaction,
    advancedRecurring: RecurringTransfer,
  ): Promise<void> {
    const tx = generatedTransaction.toJSON();
    const rt = advancedRecurring.toJSON();

    // db.transaction hace atómico el par INSERT + UPDATE: si algo falla,
    // SQLite revierte todo. La transacción nunca queda a medias.
    this.db.transaction((trx) => {
      trx
        .insert(transactions)
        .values({
          id: tx.id,
          date: tx.date,
          amount: tx.amount,
          type: tx.type,
          fromAccountId: tx.fromAccountId,
          toAccountId: tx.toAccountId,
          categoryId: tx.categoryId,
          bucketId: tx.bucketId,
          description: tx.description,
          recurringId: tx.recurringId,
          createdAt: tx.createdAt,
        })
        .run();
      trx
        .update(recurringTransfers)
        .set({ nextDueDate: rt.nextDueDate })
        .where(eq(recurringTransfers.id, rt.id))
        .run();
    });

    return Promise.resolve();
  }
}
