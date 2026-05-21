export type AccountType = 'checking' | 'savings' | 'investment' | 'cash';
export type Currency = 'CLP' | 'UF';

/**
 * Una cuenta es un "lugar donde vive plata". El balance NO es parte de la
 * entidad: es un valor derivado (la suma de las transacciones de la cuenta).
 */
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  isArchived: boolean;
  createdAt: string;
}

/** Cuenta junto a su balance derivado. Modelo de lectura, no se persiste. */
export interface AccountWithBalance extends Account {
  balance: number;
}
