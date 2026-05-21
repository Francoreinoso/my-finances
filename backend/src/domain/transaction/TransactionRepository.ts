import type { Transaction } from './Transaction.js';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>;
  findRecent(limit: number): Promise<Transaction[]>;
}
