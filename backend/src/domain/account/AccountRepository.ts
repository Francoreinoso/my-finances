import type { Account, AccountWithBalance } from './Account.js';

/**
 * Contrato del repositorio de cuentas. El dominio solo conoce esta interfaz:
 * no sabe si los datos viven en SQLite, en memoria o en Postgres.
 */
/** Conteo de referencias a una cuenta desde otras tablas. */
export interface AccountReferenceCounts {
  transactions: number;
  buckets: number;
  recurring: number;
}

export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findAllWithBalance(): Promise<AccountWithBalance[]>;
  /** Inserta una cuenta nueva o actualiza una existente (upsert por id). */
  save(account: Account): Promise<void>;
  /** Elimina la cuenta de la base. NO valida dependencias — eso va en el caso de uso. */
  delete(id: string): Promise<void>;
  /** Cuántas filas en cada tabla apuntan a esta cuenta. */
  findReferenceCounts(id: string): Promise<AccountReferenceCounts>;
}
