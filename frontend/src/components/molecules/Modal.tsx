import { type ReactNode } from 'react';
import { useModalA11y } from '@/hooks/useModalA11y';

type ModalSize = 'sm' | 'md';

interface ModalProps {
  /** Título visible del diálogo; también es su nombre accesible. */
  title: string;
  onClose: () => void;
  /** Ancho máximo del panel. 'md' por defecto. */
  size?: ModalSize;
  children: ReactNode;
}

const SIZE_CLASS: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
};

/**
 * Shell de un diálogo modal: backdrop oscuro, panel centrado y título. La
 * accesibilidad (Escape, focus trap, restauración de foco) la aporta
 * `useModalA11y`. El contenido —un formulario, un mensaje, lo que sea— se
 * pasa como children.
 */
export function Modal({ title, onClose, size = 'md', children }: ModalProps) {
  const dialogRef = useModalA11y(onClose);

  return (
    <div
      role="dialog"
      ref={dialogRef}
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`flex w-full ${SIZE_CLASS[size]} flex-col gap-4 rounded-lg border border-border-default bg-bg-surface p-6 shadow-2xl`}
      >
        <h3 className="font-mono text-xl text-text-primary">{title}</h3>
        {children}
      </div>
    </div>
  );
}
