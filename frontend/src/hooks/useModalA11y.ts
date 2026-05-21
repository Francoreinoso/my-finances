import { useEffect, useRef, useState } from 'react';

/** Elementos que pueden recibir foco con Tab dentro del diálogo. */
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accesibilidad para un modal. Hace tres cosas que `aria-modal` por sí solo
 * NO hace:
 *  - cierra el modal con la tecla Escape;
 *  - atrapa el foco dentro del diálogo (Tab no se escapa al fondo);
 *  - restaura el foco al elemento que abrió el modal cuando este se desmonta.
 *
 * Devuelve un ref para enganchar al contenedor con `role="dialog"`.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(onClose: () => void) {
  const dialogRef = useRef<T | null>(null);

  // El elemento con foco en el primer render es el que abrió el modal.
  // Se captura acá, antes de que `autoFocus` mueva el foco a un campo.
  const [trigger] = useState<HTMLElement | null>(
    () => document.activeElement as HTMLElement | null,
  );

  // Ref a onClose para leer siempre la última versión sin re-suscribir el
  // listener (ni re-disparar la restauración de foco) en cada render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || dialogRef.current === null) return;

      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (first === undefined || last === undefined) return;

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Al cerrar, devolvemos el foco a donde estaba: nada de dejarlo perdido.
      trigger?.focus();
    };
  }, [trigger]);

  return dialogRef;
}
