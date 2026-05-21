import type { Account, AccountWithBalance } from './Account.js';

/**
 * Contrato del repositorio de cuentas. El dominio solo conoce esta interfaz:
 * no sabe si los datos viven en SQLite, en memoria o en Postgres.
 */
export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  findAllWithBalance(): Promise<AccountWithBalance[]>;
}
