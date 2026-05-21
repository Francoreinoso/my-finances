import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/molecules/Modal';

describe('Modal', () => {
  it('muestra el título como encabezado y el contenido', () => {
    render(
      <Modal title="Mi modal" onClose={vi.fn()}>
        <p>contenido</p>
      </Modal>,
    );

    expect(screen.getByRole('heading', { name: 'Mi modal' })).toBeInTheDocument();
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('expone un diálogo accesible con role="dialog" y nombre', () => {
    render(
      <Modal title="Mi modal" onClose={vi.fn()}>
        <p>x</p>
      </Modal>,
    );

    expect(screen.getByRole('dialog', { name: 'Mi modal' })).toBeInTheDocument();
  });

  it('cierra al hacer click en el backdrop', () => {
    const onClose = vi.fn();
    render(
      <Modal title="T" onClose={onClose}>
        <p>x</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('dialog'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('NO cierra al hacer click dentro del panel', () => {
    const onClose = vi.fn();
    render(
      <Modal title="T" onClose={onClose}>
        <p>adentro</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText('adentro'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('cierra con la tecla Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal title="T" onClose={onClose}>
        <p>x</p>
      </Modal>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
