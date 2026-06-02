import { count, eq, isNotNull, or, sum } from 'drizzle-orm';
import type { Account, AccountWithBalance } from '@/domain/account/Account.js';
import type {
  AccountReferenceCounts,
  AccountRepository,
} from '@/domain/account/AccountRepository.js';
import {
  accounts,
  buckets,
  recurringTransfers,
  transactions,
  type AccountRow,
} from './schema.js';
import type { DB } from './db.js';

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    currency: row.currency,
    isArchived: row.isArchived,
    createdAt: row.createdAt,
  };
}

export class SqliteAccountRepository implements AccountRepository {
  constructor(private readonly db: DB) {}

  findById(id: string): Promise<Account | null> {
    const row = this.db.select().from(accounts).where(eq(accounts.id, id)).get();
    return Promise.resolve(row ? toAccount(row) : null);
  }

  save(account: Account): Promise<void> {
    const values = {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      isArchived: account.isArchived,
      createdAt: account.createdAt,
    };
    this.db
      .insert(accounts)
      .values(values)
      .onConflictDoUpdate({
        target: accounts.id,
        set: {
          name: values.name,
          type: values.type,
          currency: values.currency,
          isArchived: values.isArchived,
        },
      })
      .run();
    return Promise.resolve();
  }

  /**
   * El balance es derivado: entradas (transacciones con destino = cuenta)
   * menos salidas (transacciones con origen = cuenta). La fórmula vale para
   * ingresos, gastos y transferencias por igual.
   *
   * Se resuelve con 3 consultas fijas (cuentas, entradas agrupadas, salidas
   * agrupadas) y un merge en memoria — sin importar cuántas cuentas haya, son
   * siempre 3 queries: nada de N+1.
   */
  findAllWithBalance(): Promise<AccountWithBalance[]> {
    const accountRows = this.db.select().from(accounts).orderBy(accounts.createdAt).all();

    const inflows = this.db
      .select({ accountId: transactions.toAccountId, total: sum(transactions.amount) })
      .from(transactions)
      .where(isNotNull(transactions.toAccountId))
      .groupBy(transactions.toAccountId)
      .all();

    const outflows = this.db
      .select({ accountId: transactions.fromAccountId, total: sum(transactions.amount) })
      .from(transactions)
      .where(isNotNull(transactions.fromAccountId))
      .groupBy(transactions.fromAccountId)
      .all();

    const inflowByAccount = new Map(inflows.map((r) => [r.accountId, Number(r.total ?? 0)]));
    const outflowByAccount = new Map(outflows.map((r) => [r.accountId, Number(r.total ?? 0)]));

    const result: AccountWithBalance[] = accountRows.map((row) => ({
      ...toAccount(row),
      balance: (inflowByAccount.get(row.id) ?? 0) - (outflowByAccount.get(row.id) ?? 0),
    }));

    return Promise.resolve(result);
  }

  delete(id: string): Promise<void> {
    this.db.delete(accounts).where(eq(accounts.id, id)).run();
    return Promise.resolve();
  }

  findReferenceCounts(id: string): Promise<AccountReferenceCounts> {
    const [txRow] = this.db
      .select({ n: count() })
      .from(transactions)
      .where(or(eq(transactions.fromAccountId, id), eq(transactions.toAccountId, id)))
      .all();
    const [bucketRow] = this.db
      .select({ n: count() })
      .from(buckets)
      .where(eq(buckets.accountId, id))
      .all();
    const [recurringRow] = this.db
      .select({ n: count() })
      .from(recurringTransfers)
      .where(
        or(
          eq(recurringTransfers.fromAccountId, id),
          eq(recurringTransfers.toAccountId, id),
        ),
      )
      .all();
    return Promise.resolve({
      transactions: Number(txRow?.n ?? 0),
      buckets: Number(bucketRow?.n ?? 0),
      recurring: Number(recurringRow?.n ?? 0),
    });
  }
}
