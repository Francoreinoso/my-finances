import { useLayoutEffect, useRef, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { caretAfterDigits, maskAmount, unmaskAmount } from '@/lib/amountMask';
import { FIELD_CLASS } from '@/lib/formClasses';

type MoneyInputProps = {
  /** Monto CRUDO, sin separadores (ej. "1000000"). Cadena vacía si no hay. */
  value: string;
  onChange: (rawValue: string) => void;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'inputMode' | 'className'
>;

/**
 * Input de monto que muestra los miles con punto (1.000.000) mientras se tipea.
 * El padre solo ve el valor CRUDO: `value` entra crudo y `onChange` lo devuelve
 * crudo — el formateo es interno.
 *
 * Al reformatear, el cursor saltaría: lo recolocamos contando los dígitos a su
 * izquierda (los separadores se mueven, los dígitos son el ancla estable). La
 * reposición va en `useLayoutEffect` para aplicarse tras el re-render, antes
 * de que el navegador pinte.
 */
export function MoneyInput({ value, onChange, ...rest }: MoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // Posición de cursor pendiente de aplicar tras el re-render que reformatea.
  const caretRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    if (caretRef.current !== null && inputRef.current !== null) {
      inputRef.current.setSelectionRange(caretRef.current, caretRef.current);
      caretRef.current = null;
    }
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    const caret = e.target.selectionStart ?? text.length;
    const digitsLeft = (text.slice(0, caret).match(/\d/g) ?? []).length;
    const raw = unmaskAmount(text);
    caretRef.current = caretAfterDigits(maskAmount(raw), digitsLeft);
    onChange(raw);
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={maskAmount(value)}
      onChange={handleChange}
      className={FIELD_CLASS}
    />
  );
}
