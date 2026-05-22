import { formatDateReadable, formatISODate, parseISODate } from '@/lib/isoDate';

describe('parseISODate', () => {
  it('convierte un YYYY-MM-DD a Date en hora local, sin corrimiento UTC', () => {
    const date = parseISODate('2026-05-21');
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(4); // mayo
    expect(date?.getDate()).toBe(21);
  });

  it('devuelve undefined para una cadena vacía', () => {
    expect(parseISODate('')).toBeUndefined();
  });

  it('devuelve undefined para un formato que no es YYYY-MM-DD', () => {
    expect(parseISODate('21/05/2026')).toBeUndefined();
  });

  it('devuelve undefined para una fecha que no existe', () => {
    expect(parseISODate('2026-02-31')).toBeUndefined();
  });
});

describe('formatISODate', () => {
  it('convierte un Date local a YYYY-MM-DD', () => {
    expect(formatISODate(new Date(2026, 4, 21))).toBe('2026-05-21');
  });

  it('rellena con ceros el mes y el día de un dígito', () => {
    expect(formatISODate(new Date(2026, 0, 9))).toBe('2026-01-09');
  });

  it('es la inversa exacta de parseISODate', () => {
    const parsed = parseISODate('2026-12-31');
    expect(parsed && formatISODate(parsed)).toBe('2026-12-31');
  });
});

describe('formatDateReadable', () => {
  it('convierte un YYYY-MM-DD a texto legible en español', () => {
    expect(formatDateReadable('2026-05-21')).toBe('21 de mayo de 2026');
  });

  it('devuelve cadena vacía para una fecha vacía o inválida', () => {
    expect(formatDateReadable('')).toBe('');
    expect(formatDateReadable('chau')).toBe('');
  });
});
