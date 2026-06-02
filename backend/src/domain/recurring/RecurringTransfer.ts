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
  isArchived: boolean;
}

/** Datos para crear un aporte recurrente nuevo. */
export interface CreateRecurringTransferInput {
  name: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  bucketId: string | null;
  dayOfMonth: number;
  /** Fecha ISO YYYY-MM-DD desde la que calcular el nextDueDate. */
  today: string;
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
 * Próxima ocurrencia futura de `dayOfMonth` desde `today`. Si el día ya pasó
 * o es HOY, salta al mes siguiente (no asumimos que la transferencia ya se
 * hizo hoy). Si el día no existe en el mes destino, recorta al último día.
 */
function firstDueDateFrom(today: string, dayOfMonth: number): string {
  const year = Number(today.slice(0, 4));
  const month = Number(today.slice(5, 7));
  const todayDay = Number(today.slice(8, 10));

  // Si pediste el 31 y el mes solo tiene 30, "este mes" para vos es el 30.
  const daysInThisMonth = new Date(year, month, 0).getDate();
  const dayThisMonth = Math.min(dayOfMonth, daysInThisMonth);

  let targetYear = year;
  let targetMonth = month;
  if (todayDay >= dayThisMonth) {
    targetMonth += 1;
    if (targetMonth > 12) {
      targetMonth = 1;
      targetYear += 1;
    }
  }

  const daysInTarget = new Date(targetYear, targetMonth, 0).getDate();
  const day = Math.min(dayOfMonth, daysInTarget);
  return `${String(targetYear)}-${pad(targetMonth)}-${pad(day)}`;
}

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
  readonly isArchived: boolean;

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
    this.isArchived = snapshot.isArchived;
  }

  static fromPersistence(snapshot: RecurringTransferSnapshot): RecurringTransfer {
    return new RecurringTransfer(snapshot);
  }

  /**
   * Crea un aporte recurrente nuevo. Valida la FORMA: nombre no vacío, monto
   * positivo, dayOfMonth ∈ [1,31], cuentas distintas. La existencia de las
   * cuentas/bucket la valida el caso de uso (acceso a repositorios).
   */
  static create(input: CreateRecurringTransferInput): RecurringTransfer {
    const name = input.name.trim();
    if (name === '') {
      throw new RecurringTransferValidationError('El nombre es requerido');
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new RecurringTransferValidationError('El monto del aporte debe ser mayor a cero');
    }
    if (
      !Number.isInteger(input.dayOfMonth) ||
      input.dayOfMonth < 1 ||
      input.dayOfMonth > 31
    ) {
      throw new RecurringTransferValidationError('El día del mes debe ser un entero entre 1 y 31');
    }
    if (input.fromAccountId === input.toAccountId) {
      throw new RecurringTransferValidationError(
        'La cuenta de origen y la de destino no pueden ser la misma',
      );
    }
    if (!ISO_DATE_REGEX.test(input.today)) {
      throw new RecurringTransferValidationError(
        `today debe estar en formato YYYY-MM-DD (recibido: "${input.today}")`,
      );
    }

    return new RecurringTransfer({
      id: crypto.randomUUID(),
      name,
      fromAccountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      amount: input.amount,
      bucketId: input.bucketId,
      dayOfMonth: input.dayOfMonth,
      nextDueDate: firstDueDateFrom(input.today, input.dayOfMonth),
      isActive: true,
      isArchived: false,
    });
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
      isArchived: this.isArchived,
    };
  }
}
