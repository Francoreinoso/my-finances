export type CategoryType = 'income' | 'expense';

/** Categoría de ingreso o gasto. Modelo de lectura: en Fase 1 viene del seed. */
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
}
