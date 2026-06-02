import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

/**
 * Schema de la base de datos (SQLite + Drizzle).
 *
 * Convenciones:
 * - `amount` se guarda SIEMPRE positivo. El signo lo determina `type` + cuentas.
 * - Las fechas son texto en formato ISO (YYYY-MM-DD para fechas, ISO completo
 *   para timestamps). SQLite no tiene tipo date nativo.
 * - El balance de una cuenta NO se almacena: es la suma de sus transacciones.
 */

export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['checking', 'savings', 'investment', 'cash'] }).notNull(),
  currency: text('currency', { enum: ['CLP', 'UF'] })
    .notNull()
    .default('CLP'),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  color: text('color').notNull(),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
});

export const buckets = sqliteTable('buckets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  targetAmount: real('target_amount'),
  targetDate: text('target_date'),
  accountId: text('account_id').references(() => accounts.id),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
});

export const recurringTransfers = sqliteTable('recurring_transfers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  fromAccountId: text('from_account_id')
    .notNull()
    .references(() => accounts.id),
  toAccountId: text('to_account_id')
    .notNull()
    .references(() => accounts.id),
  amount: real('amount').notNull(),
  bucketId: text('bucket_id').references(() => buckets.id),
  dayOfMonth: integer('day_of_month').notNull(),
  nextDueDate: text('next_due_date').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
});

export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  amount: real('amount').notNull(),
  type: text('type', { enum: ['income', 'expense', 'transfer'] }).notNull(),
  fromAccountId: text('from_account_id').references(() => accounts.id),
  toAccountId: text('to_account_id').references(() => accounts.id),
  categoryId: text('category_id').references(() => categories.id),
  bucketId: text('bucket_id').references(() => buckets.id),
  description: text('description').notNull().default(''),
  recurringId: text('recurring_id').references(() => recurringTransfers.id),
  createdAt: text('created_at').notNull(),
});

export type AccountRow = typeof accounts.$inferSelect;
export type NewAccountRow = typeof accounts.$inferInsert;
export type CategoryRow = typeof categories.$inferSelect;
export type NewCategoryRow = typeof categories.$inferInsert;
export type BucketRow = typeof buckets.$inferSelect;
export type NewBucketRow = typeof buckets.$inferInsert;
export type RecurringTransferRow = typeof recurringTransfers.$inferSelect;
export type NewRecurringTransferRow = typeof recurringTransfers.$inferInsert;
export type TransactionRow = typeof transactions.$inferSelect;
export type NewTransactionRow = typeof transactions.$inferInsert;
