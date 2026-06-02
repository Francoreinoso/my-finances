/** Se intentó editar o borrar una cuenta que no existe. Mapea a HTTP 404. */
export class AccountNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe ninguna cuenta con id "${id}"`);
    this.name = 'AccountNotFoundError';
  }
}

/**
 * Una operación sobre una cuenta es inválida en el dominio (ej: eliminar con
 * saldo distinto de cero). Mapea a HTTP 400.
 */
export class AccountValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountValidationError';
  }
}
