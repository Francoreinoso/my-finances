import { eq, isNotNull, sum } from 'drizzle-orm';
import type { Account, AccountWithBalance } from '@/domain/account/Account.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import { accounts, transactions, type AccountRow } from './schema.js';
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
}
