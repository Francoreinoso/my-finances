/** Gasto acumulado de una categoría en el mes. */
export interface CategorySpending {
  categoryId: string | null;
  categoryName: string;
  color: string;
  total: number;
}

/**
 * Resumen financiero de un mes. Las transferencias NO cuentan: mover plata
 * entre cuentas propias no es ni ingreso ni gasto.
 */
export interface MonthlySummary {
  month: string;
  income: number;
  expense: number;
  net: number;
  /**
   * net / income. Entre 0 y 1 normalmente; 0 si no hubo ingresos; negativo
   * si se gastó más de lo que entró.
   */
  savingsRate: number;
  byCategory: CategorySpending[];
}
