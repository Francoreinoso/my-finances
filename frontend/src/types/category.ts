export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
}

/** Datos para crear una categoría (body de POST). */
export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color: string;
}

/** Campos editables de una categoría (body de PATCH). El tipo no se edita. */
export interface CategoryChanges {
  name?: string;
  color?: string;
}
