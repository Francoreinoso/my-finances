/**
 * Conversión entre fechas ISO (YYYY-MM-DD) y objetos `Date`, SIEMPRE en hora
 * local. Es a propósito: `new Date('2026-05-21')` parsea como UTC, y en Chile
 * (UTC-3/-4) eso se corre al día anterior. Parseamos y formateamos a mano para
 * que el día nunca cambie. Misma convención que `todayISO()` en `format.ts`.
 */

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

const readableFormatter = new Intl.DateTimeFormat('es-CL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Parsea un YYYY-MM-DD a un `Date` local. `undefined` si no es una fecha válida. */
export function parseISODate(iso: string): Date | undefined {
  const match = ISO_DATE.exec(iso);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  // Reconstruir verifica que la fecha exista de verdad: si el día se desbordó
  // (ej. 2026-02-31 → 3 de marzo), los componentes no coinciden y la rechazamos.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/** Formatea un `Date` local como YYYY-MM-DD. */
export function formatISODate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Convierte un YYYY-MM-DD a texto legible, ej: "21 de mayo de 2026". Vacío si no es válido. */
export function formatDateReadable(iso: string): string {
  const date = parseISODate(iso);
  return date ? readableFormatter.format(date) : '';
}
