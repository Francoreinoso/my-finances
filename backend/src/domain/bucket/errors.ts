/** Se intentó editar un bucket que no existe. Mapea a HTTP 404. */
export class BucketNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe ningún bucket con id "${id}"`);
    this.name = 'BucketNotFoundError';
  }
}
