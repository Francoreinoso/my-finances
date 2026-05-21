import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('muestra el título y el mensaje', () => {
    render(
      <ConfirmDialog
        title="Borrar transacción"
        message="¿Seguro? No se puede deshacer."
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Borrar transacción' })).toBeInTheDocument();
    expect(screen.getByText('¿Seguro? No se puede deshacer.')).toBeInTheDocument();
  });

  it('al confirmar llama onConfirm y luego cierra', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        title="T"
        message="m"
        confirmLabel="Borrar"
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('al cancelar cierra pero NO confirma', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog title="T" message="m" onConfirm={onConfirm} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
