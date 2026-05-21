export class RecurringTransferNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe ningún aporte recurrente con id "${id}"`);
    this.name = 'RecurringTransferNotFoundError';
  }
}

/** Se intentó confirmar un aporte cuya fecha todavía no llegó. */
export class RecurringTransferNotPendingError extends Error {
  constructor(id: string) {
    super(`El aporte recurrente "${id}" no está pendiente de confirmación`);
    this.name = 'RecurringTransferNotPendingError';
  }
}
