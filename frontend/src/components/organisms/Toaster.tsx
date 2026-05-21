import { useEffect } from 'react';
import { useToasts, type Toast } from '@/stores/useToasts';

/** Tiempo que un toast permanece visible antes de auto-descartarse. */
const AUTO_DISMISS_MS = 4000;

const TONE_CLASS: Record<Toast['tone'], string> = {
  success: 'border-success/40 bg-success/10 text-success',
  error: 'border-danger/40 bg-danger/10 text-danger',
};

/**
 * Un toast individual. Maneja su propio temporizador de auto-descarte con
 * `useEffect`: un temporizador es un efecto del ciclo de vida de React, no
 * estado del store — por eso vive acá y `useToasts` se mantiene puro.
 */
function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToasts((state) => state.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => {
      dismiss(toast.id);
    }, AUTO_DISMISS_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, dismiss]);

  return (
    <div
      // Cada toast es su propia región viva: 'status' (cortés) no interrumpe
      // al lector de pantalla; 'alert' (asertivo) sí — reservado a errores.
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className={`mf-fade-in-up pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm ${TONE_CLASS[toast.tone]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          dismiss(toast.id);
        }}
        aria-label="Cerrar notificación"
        className="-mr-1 shrink-0 rounded p-1 text-text-muted transition-colors hover:text-text-primary"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * Pila de notificaciones efímeras, anclada abajo a la derecha. Se monta una
 * sola vez (en `AppLayout`) y escucha el store `useToasts`. Cada acción que
 * termina con éxito o error aparece acá como un toast que se anuncia a los
 * lectores de pantalla y se auto-descarta.
 */
export function Toaster() {
  const toasts = useToasts((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
