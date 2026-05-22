import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { formatDateReadable, formatISODate, parseISODate } from '@/lib/isoDate';
import { FIELD_CLASS } from '@/lib/formClasses';

interface DatePickerProps {
  /** Fecha seleccionada en formato YYYY-MM-DD; cadena vacía si no hay ninguna. */
  value: string;
  onChange: (value: string) => void;
  /** id del control, para asociarlo al `<label>` del formulario. */
  id?: string;
}

/**
 * Selector de fecha custom sobre react-day-picker. Reemplaza al `<input
 * type="date">` nativo: un trigger con la fecha legible + un popover con el
 * calendario, tematizado con la paleta de la app.
 *
 * Vive habitualmente DENTRO de un modal — por eso el Escape del calendario
 * corta la propagación: cierra el popover SIN cerrar el modal contenedor,
 * cuyo `useModalA11y` también escucha Escape (en `window`).
 */
export function DatePicker({ value, onChange, id }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = parseISODate(value);

  // Cerrar al hacer clic afuera. (Escape se maneja en el onKeyDown del root,
  // para poder frenar su propagación antes de que llegue al modal.)
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? formatISODate(date) : '');
    close();
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(e) => {
        if (open && e.key === 'Escape') {
          // Sin esto, el Escape sigue hasta `window` y cierra el modal entero.
          e.stopPropagation();
          close();
        }
      }}
    >
      <button
        type="button"
        id={id}
        ref={triggerRef}
        onClick={() => {
          setOpen((o) => !o);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`${FIELD_CLASS} flex w-full items-center justify-between gap-2 text-left`}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-subtle'}>
          {selected ? formatDateReadable(value) : 'Elegí una fecha'}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Calendario"
          className="mf-calendar mf-fade-in-up absolute left-0 top-full z-20 mt-2 rounded-lg border border-border-default bg-bg-surface p-3 shadow-2xl"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected ?? new Date()}
            locale={es}
            showOutsideDays={false}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}
