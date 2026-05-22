import { caretAfterDigits, maskAmount, unmaskAmount } from '@/lib/amountMask';

describe('maskAmount', () => {
  it('agrupa los miles con punto', () => {
    expect(maskAmount('1000000')).toBe('1.000.000');
  });

  it('no agrupa números menores a mil', () => {
    expect(maskAmount('100')).toBe('100');
  });

  it('agrupa solo la parte entera y usa coma para el decimal', () => {
    expect(maskAmount('1234.5')).toBe('1.234,5');
  });

  it('conserva una coma decimal al final mientras se tipea', () => {
    expect(maskAmount('1234.')).toBe('1.234,');
  });

  it('devuelve cadena vacía para un monto vacío', () => {
    expect(maskAmount('')).toBe('');
  });
});

describe('unmaskAmount', () => {
  it('saca los puntos de miles y deja el número crudo', () => {
    expect(unmaskAmount('1.000.000')).toBe('1000000');
  });

  it('convierte la coma decimal en punto', () => {
    expect(unmaskAmount('1.234,5')).toBe('1234.5');
  });

  it('ignora cualquier carácter que no sea dígito ni coma', () => {
    expect(unmaskAmount('$ 1.000 abc')).toBe('1000');
  });

  it('toma solo la primera coma como decimal', () => {
    expect(unmaskAmount('1,2,3')).toBe('1.23');
  });

  it('devuelve cadena vacía si no hay dígitos', () => {
    expect(unmaskAmount('')).toBe('');
  });

  it('es consistente: unmask(mask(x)) recupera el crudo', () => {
    expect(unmaskAmount(maskAmount('1234567'))).toBe('1234567');
  });
});

describe('caretAfterDigits', () => {
  it('ubica el cursor justo después de la cantidad de dígitos indicada', () => {
    expect(caretAfterDigits('1.000.000', 4)).toBe(5); // tras "1.000"
  });

  it('lo ubica al inicio cuando son 0 dígitos', () => {
    expect(caretAfterDigits('1.000', 0)).toBe(0);
  });

  it('lo ubica al final cuando se piden más dígitos de los que hay', () => {
    expect(caretAfterDigits('1.000', 9)).toBe(5);
  });
});
