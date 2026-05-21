export type CategoryType = 'income' | 'expense';

/** Categoría de ingreso o gasto. */
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
}

/** Datos para crear una categoría nueva (el id lo genera el caso de uso). */
export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color: string;
}

/** Campos editables de una categoría. El tipo NO se edita: cambiarlo dejaría
 * inconsistentes las transacciones que ya usan la categoría. */
export interface CategoryChanges {
  name?: string;
  color?: string;
}
