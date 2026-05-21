/**
 * Error de validación al crear una transacción: monto inválido, forma
 * incoherente con el tipo, o referencia a una cuenta/categoría inexistente.
 * Mapea a HTTP 400.
 */
export class TransactionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionValidationError';
  }
}
