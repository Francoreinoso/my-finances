import { RecurringTransferValidationError } from './errors.js';

export interface RecurringTransferSnapshot {
  id: string;
  name: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  bucketId: string | null;
  dayOfMonth: number;
  nextDueDate: string;
  isActive: boolean;
}

/**
 * Aporte recurrente con su estado `pending`. `pending` se deriva de la fecha
 * contra "hoy" — no se persiste. Es lo que la API expone al cliente.
 */
export interface RecurringTransferView extends RecurringTransferSnapshot {
  pending: boolean;
}

/** Campos editables de un aporte recurrente. */
export interface RecurringTransferChanges {
  amount?: number;
  isActive?: boolean;
}

const pad = (n: number): string => String(n).padStart(2, '0');

/**
 * Fecha del mes siguiente para un día dado. Si el día no existe en ese mes
 * (ej: 31 en un mes de 30), recorta al último día disponible.
 */
function nextMonthDate(currentDate: string, dayOfMonth: number): string {
  const year = Number(currentDate.slice(0, 4));
  const month = Number(currentDate.slice(5, 7));

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  // new Date(año, mes1indexado, 0) → último día de ese mes.
  const daysInMonth = new Date(nextYear, nextMonth, 0).getDate();
  const day = Math.min(dayOfMonth, daysInMonth);
  return `${String(nextYear)}-${pad(nextMonth)}-${pad(day)}`;
}

/**
 * Un aporte recurrente: una transferencia programada que se repite cada mes.
 * El estado "pendiente" NO se persiste — se deriva de la fecha (ver isPending).
 */
export class RecurringTransfer {
  readonly id: string;
  readonly name: string;
  readonly fromAccountId: string;
  readonly toAccountId: string;
  readonly amount: number;
  readonly bucketId: string | null;
  readonly dayOfMonth: number;
  readonly nextDueDate: string;
  readonly isActive: boolean;

  private constructor(snapshot: RecurringTransferSnapshot) {
    this.id = snapshot.id;
    this.name = snapshot.name;
    this.fromAccountId = snapshot.fromAccountId;
    this.toAccountId = snapshot.toAccountId;
    this.amount = snapshot.amount;
    this.bucketId = snapshot.bucketId;
    this.dayOfMonth = snapshot.dayOfMonth;
    this.nextDueDate = snapshot.nextDueDate;
    this.isActive = snapshot.isActive;
  }

  static fromPersistence(snapshot: RecurringTransferSnapshot): RecurringTransfer {
    return new RecurringTransfer(snapshot);
  }

  /** Pendiente = activo y con la fecha ya cumplida (las fechas ISO se comparan como texto). */
  isPending(today: string): boolean {
    return this.isActive && this.nextDueDate <= today;
  }

  /** El mismo aporte con la fecha avanzada un mes. Inmutable: devuelve uno nuevo. */
  advanced(): RecurringTransfer {
    return new RecurringTransfer({
      ...this.toJSON(),
      nextDueDate: nextMonthDate(this.nextDueDate, this.dayOfMonth),
    });
  }

  /**
   * Aplica cambios y devuelve un aporte nuevo (inmutable). Valida el monto:
   * un aporte de cero o negativo no tiene sentido.
   */
  withChanges(changes: RecurringTransferChanges): RecurringTransfer {
    const amount = changes.amount ?? this.amount;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new RecurringTransferValidationError('El monto del aporte debe ser mayor a cero');
    }
    return new RecurringTransfer({
      ...this.toJSON(),
      amount,
      isActive: changes.isActive ?? this.isActive,
    });
  }

  toJSON(): RecurringTransferSnapshot {
    return {
      id: this.id,
      name: this.name,
      fromAccountId: this.fromAccountId,
      toAccountId: this.toAccountId,
      amount: this.amount,
      bucketId: this.bucketId,
      dayOfMonth: this.dayOfMonth,
      nextDueDate: this.nextDueDate,
      isActive: this.isActive,
    };
  }
}
