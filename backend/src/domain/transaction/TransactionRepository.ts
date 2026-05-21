import type { Transaction } from './Transaction.js';

export interface TransactionRepository {
  create(transaction: Transaction): Promise<void>;
  findRecent(limit: number): Promise<Transaction[]>;
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
