import { desc } from 'drizzle-orm';
import { Transaction } from '@/domain/transaction/Transaction.js';
import type { TransactionRepository } from '@/domain/transaction/TransactionRepository.js';
import { transactions, type TransactionRow } from './schema.js';
import type { DB } from './db.js';

function toTransaction(row: TransactionRow): Transaction {
  return Transaction.fromPersistence({
    id: row.id,
    date: row.date,
    amount: row.amount,
    type: row.type,
    fromAccountId: row.fromAccountId,
    toAccountId: row.toAccountId,
    categoryId: row.categoryId,
    bucketId: row.bucketId,
    description: row.description,
    recurringId: row.recurringId,
    createdAt: row.createdAt,
  });
}

export class SqliteTransactionRepository implements TransactionRepository {
  constructor(private readonly db: DB) {}

  create(transaction: Transaction): Promise<void> {
    const snap = transaction.toJSON();
    this.db
      .insert(transactions)
      .values({
        id: snap.id,
        date: snap.date,
        amount: snap.amount,
        type: snap.type,
        fromAccountId: snap.fromAccountId,
        toAccountId: snap.toAccountId,
        categoryId: snap.categoryId,
        bucketId: snap.bucketId,
        description: snap.description,
        recurringId: snap.recurringId,
        createdAt: snap.createdAt,
      })
      .run();
    return Promise.resolve();
  }

  /** Más recientes primero. Ordena por fecha y desempata por createdAt. */
  findRecent(limit: number): Promise<Transaction[]> {
    const rows = this.db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.date), desc(transactions.createdAt))
      .limit(limit)
      .all();
    return Promise.resolve(rows.map(toTransaction));
  }
}
