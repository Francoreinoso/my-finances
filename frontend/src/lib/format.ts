import type { Currency } from '@/types/account';

const clpFormatter = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
});

const ufFormatter = new Intl.NumberFormat('es-CL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const monthFormatter = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' });

/** Formatea un monto según la moneda: CLP sin decimales, UF con decimales. */
export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'UF') return `${ufFormatter.format(amount)} UF`;
  return clpFormatter.format(amount);
}

/** Fecha de hoy en formato YYYY-MM-DD, en hora LOCAL (no UTC). */
export function todayISO(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${String(d.getFullYear())}-${month}-${day}`;
}

/** Convierte un mes YYYY-MM a texto legible, ej: "mayo de 2026". */
export function formatMonth(month: string): string {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  return monthFormatter.format(new Date(year, monthIndex, 1));
}
