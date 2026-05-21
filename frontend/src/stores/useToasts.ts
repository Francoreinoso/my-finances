import { create } from 'zustand';

/** Tono de un toast: define su color y su urgencia para lectores de pantalla. */
export type ToastTone = 'success' | 'error';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastStore {
  toasts: Toast[];
  /** Encola un toast. `tone` es 'success' salvo que se indique otra cosa. */
  notify: (message: string, tone?: ToastTone) => void;
  /** Descarta el toast con ese id. */
  dismiss: (id: string) => void;
}

// Contador a nivel de módulo: alcanza para ids únicos dentro de una sesión.
let nextId = 0;

/**
 * Store global de notificaciones — el primer store de Zustand del proyecto.
 * Vive en `stores/` y no en `hooks/` a propósito: no es el estado de un
 * componente, es estado COMPARTIDO que cualquier capa (un hook de datos, una
 * página) puede disparar sin tener que pasar props. El organismo `Toaster`
 * lee `toasts` y los renderiza; los hooks de datos llaman `notify` al terminar
 * una mutación con éxito.
 */
export const useToasts = create<ToastStore>((set) => ({
  toasts: [],
  notify: (message, tone = 'success') => {
    nextId += 1;
    const toast: Toast = { id: `toast-${String(nextId)}`, message, tone };
    set((state) => ({ toasts: [...state.toasts, toast] }));
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
}));
