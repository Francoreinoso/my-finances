export type AccountType = 'checking' | 'savings' | 'investment' | 'cash';
export type Currency = 'CLP' | 'UF';

/**
 * Cuenta tal como la devuelve GET /api/accounts: siempre con su balance
 * derivado incluido (el frontend nunca necesita una cuenta sin balance).
 */
export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  isArchived: boolean;
  createdAt: string;
  balance: number;
}

/** Datos para crear una cuenta nueva (el id, isArchived y createdAt los pone el backend). */
export interface CreateAccountInput {
  name: string;
  type: AccountType;
  currency: Currency;
}
