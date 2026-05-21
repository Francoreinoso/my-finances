/**
 * Error de validación al crear o editar una transacción: monto inválido, forma
 * incoherente con el tipo, o referencia a una cuenta/categoría inexistente.
 * Mapea a HTTP 400.
 */
export class TransactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionValidationError';
  }
}

/** Se intentó editar o borrar una transacción que no existe. Mapea a HTTP 404. */
export class TransactionNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe ninguna transacción con id "${id}"`);
    this.name = 'TransactionNotFoundError';
  }
}
