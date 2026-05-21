import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/molecules/Modal';

interface ConfirmDialogProps {
  title: string;
  message: string;
  /** Texto del botón que ejecuta la acción. 'Confirmar' por defecto. */
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Diálogo de confirmación para acciones destructivas. Reemplaza a
 * `window.confirm`, que no se puede estilar y rompe el tema oscuro.
 * El foco arranca en Cancelar: confirmar una acción destructiva debe
 * ser deliberado, no un Enter de reflejo.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onClose} size="sm">
      <p className="text-sm text-text-muted">{message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} autoFocus>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
