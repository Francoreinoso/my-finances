/**
 * Máscara de los campos de monto: convierte entre el valor CRUDO (numérico,
 * con punto decimal — el que se guarda y se manda al backend) y el valor de
 * DISPLAY (con puntos de mil y coma decimal, formato es-CL — el que se ve).
 *
 * No usamos `<input type="number">` porque no admite separadores de miles;
 * el input es `type="text"` y nosotros formateamos lo que se muestra.
 */

/** Agrupa la parte entera de cada 3 dígitos: "1234567" → "1.234.567". */
function groupThousands(intPart: string): string {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** Crudo ("1000000", "1234.5") → display es-CL ("1.000.000", "1.234,5"). */
export function maskAmount(raw: string): string {
  if (raw === '') return '';
  const [intPart, decPart] = raw.split('.');
  const grouped = groupThousands(intPart ?? '');
  // `raw` incluye un punto ⇒ hay parte decimal (aunque esté vacía: "1234.").
  return raw.includes('.') ? `${grouped},${decPart ?? ''}` : grouped;
}

/** Texto tipeado (con o sin separadores) → crudo numérico. */
export function unmaskAmount(text: string): string {
  let digits = '';
  let decimals: string | null = null;
  for (const char of text) {
    if (char >= '0' && char <= '9') {
      if (decimals === null) digits += char;
      else decimals += char;
    } else if (char === ',' && decimals === null) {
      // Solo la primera coma abre la parte decimal; los puntos se ignoran
      // (son separadores de miles, no los tipea el usuario).
      decimals = '';
    }
  }
  return decimals === null ? digits : `${digits}.${decimals}`;
}

/**
 * Posición del cursor en `display` justo después de `n` dígitos. Al reformatear
 * mientras se tipea, los dígitos son el ancla estable (los separadores cambian);
 * contar dígitos a la izquierda del cursor evita que el cursor salte.
 */
export function caretAfterDigits(display: string, n: number): number {
  if (n <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < display.length; i += 1) {
    const char = display[i];
    if (char !== undefined && char >= '0' && char <= '9') {
      seen += 1;
      if (seen === n) return i + 1;
    }
  }
  return display.length;
}
