import { TransactionValidationError } from './errors.js';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface CreateTransactionInput {
  date: string;
  amount: number;
  type: TransactionType;
  fromAccountId?: string | null;
  toAccountId?: string | null;
  categoryId?: string | null;
  bucketId?: string | null;
  description?: string | null;
  recurringId?: string | null;
}

export interface TransactionSnapshot {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  fromAccountId: string | null;
  toAccountId: string | null;
  categoryId: string | null;
  bucketId: string | null;
  description: string;
  recurringId: string | null;
  createdAt: string;
}

/** Campos editables de una transacción. El tipo y las cuentas NO se editan. */
export interface TransactionChanges {
  amount?: number;
  date?: string;
  categoryId?: string | null;
  description?: string | null;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DESCRIPTION_LENGTH = 280;

function normalizeAmount(raw: number): number {
  if (!Number.isFinite(raw)) {
    throw new TransactionValidationError('El monto debe ser un número válido');
  }
  if (raw <= 0) {
    throw new TransactionValidationError('El monto debe ser mayor a cero');
  }
  return raw;
}

/**
 * Valida una fecha ISO (YYYY-MM-DD). El round-trip por Date detecta fechas
 * de calendario inválidas tipo "2026-02-30" que el constructor "corrige".
 */
function normalizeDate(raw: string): string {
  const trimmed = raw.trim();
  if (!ISO_DATE_REGEX.test(trimmed)) {
    throw new TransactionValidationError(
      `La fecha debe estar en formato YYYY-MM-DD (recibido: "${raw}")`,
    );
  }
  const parsed = new Date(`${trimmed}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== trimmed) {
    throw new TransactionValidationError(`Fecha inválida: "${raw}"`);
  }
  return trimmed;
}

function normalizeDescription(raw: string | null | undefined): string {
  if (raw === null || raw === undefined) return '';
  const trimmed = raw.trim();
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    throw new TransactionValidationError(
      `La descripción no puede superar los ${String(MAX_DESCRIPTION_LENGTH)} caracteres`,
    );
  }
  return trimmed;
}

interface ResolvedAccounts {
  fromAccountId: string | null;
  toAccountId: string | null;
}

/**
 * Reglas de forma según el tipo. Es la invariante central del dominio:
 * - ingreso: solo cuenta destino
 * - gasto: solo cuenta origen
 * - transferencia: ambas, y distintas entre sí
 */
function resolveAccounts(
  type: TransactionType,
  fromAccountId: string | null | undefined,
  toAccountId: string | null | undefined,
): ResolvedAccounts {
  const from = fromAccountId ?? null;
  const to = toAccountId ?? null;

  switch (type) {
    case 'income':
      if (!to) throw new TransactionValidationError('Un ingreso requiere una cuenta de destino');
      if (from) throw new TransactionValidationError('Un ingreso no puede tener cuenta de origen');
      return { fromAccountId: null, toAccountId: to };
    case 'expense':
      if (!from) throw new TransactionValidationError('Un gasto requiere una cuenta de origen');
      if (to) throw new TransactionValidationError('Un gasto no puede tener cuenta de destino');
      return { fromAccountId: from, toAccountId: null };
    case 'transfer':
      if (!from || !to) {
        throw new TransactionValidationError(
          'Una transferencia requiere cuenta de origen y destino',
        );
      }
      if (from === to) {
        throw new TransactionValidationError(
          'La cuenta de origen y la de destino no pueden ser la misma',
        );
      }
      return { fromAccountId: from, toAccountId: to };
  }
}

/**
 * Una transacción se crea válida o no se crea, y es inmutable: `withChanges`
 * devuelve una nueva, nunca modifica. El monto se guarda siempre positivo;
 * el signo lo determina el tipo más las cuentas origen/destino.
 */
export class Transaction {
  readonly id: string;
  readonly date: string;
  readonly amount: number;
  readonly type: TransactionType;
  readonly fromAccountId: string | null;
  readonly toAccountId: string | null;
  readonly categoryId: string | null;
  readonly bucketId: string | null;
  readonly description: string;
  readonly recurringId: string | null;
  readonly createdAt: string;

  private constructor(snapshot: TransactionSnapshot) {
    this.id = snapshot.id;
    this.date = snapshot.date;
    this.amount = snapshot.amount;
    this.type = snapshot.type;
    this.fromAccountId = snapshot.fromAccountId;
    this.toAccountId = snapshot.toAccountId;
    this.categoryId = snapshot.categoryId;
    this.bucketId = snapshot.bucketId;
    this.description = snapshot.description;
    this.recurringId = snapshot.recurringId;
    this.createdAt = snapshot.createdAt;
  }

  static create(input: CreateTransactionInput): Transaction {
    const amount = normalizeAmount(input.amount);
    const date = normalizeDate(input.date);
    const { fromAccountId, toAccountId } = resolveAccounts(
      input.type,
      input.fromAccountId,
      input.toAccountId,
    );
    const description = normalizeDescription(input.description);
    // Una transferencia entre cuentas propias no es un gasto categorizable.
    const categoryId = input.type === 'transfer' ? null : (input.categoryId ?? null);

    return new Transaction({
      id: crypto.randomUUID(),
      date,
      amount,
      type: input.type,
      fromAccountId,
      toAccountId,
      categoryId,
      bucketId: input.bucketId ?? null,
      description,
      recurringId: input.recurringId ?? null,
      createdAt: new Date().toISOString(),
    });
  }

  static fromPersistence(snapshot: TransactionSnapshot): Transaction {
    return new Transaction(snapshot);
  }

  /**
   * Devuelve una transacción editada (inmutable). Solo cambian monto, fecha,
   * categoría y descripción — el tipo, las cuentas, el id y la fecha de
   * creación se conservan. Re-valida monto y fecha.
   */
  withChanges(changes: TransactionChanges): Transaction {
    const amount = changes.amount === undefined ? this.amount : normalizeAmount(changes.amount);
    const date = changes.date === undefined ? this.date : normalizeDate(changes.date);
    const description =
      changes.description === undefined
        ? this.description
        : normalizeDescription(changes.description);
    const categoryId =
      this.type === 'transfer'
        ? null
        : changes.categoryId === undefined
          ? this.categoryId
          : (changes.categoryId ?? null);

    return new Transaction({ ...this.toJSON(), amount, date, categoryId, description });
  }

  toJSON(): TransactionSnapshot {
    return {
      id: this.id,
      date: this.date,
      amount: this.amount,
      type: this.type,
      fromAccountId: this.fromAccountId,
      toAccountId: this.toAccountId,
      categoryId: this.categoryId,
      bucketId: this.bucketId,
      description: this.description,
      recurringId: this.recurringId,
      createdAt: this.createdAt,
    };
  }
}
