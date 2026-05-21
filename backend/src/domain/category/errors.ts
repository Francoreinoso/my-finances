/** Se intentó editar una categoría que no existe. Mapea a HTTP 404. */
export class CategoryNotFoundError extends Error {
  constructor(id: string) {
    super(`No existe ninguna categoría con id "${id}"`);
    this.name = 'CategoryNotFoundError';
  }
}
