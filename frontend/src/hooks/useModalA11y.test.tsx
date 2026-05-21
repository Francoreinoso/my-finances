import { render, screen, fireEvent } from '@testing-library/react';
import { useModalA11y } from '@/hooks/useModalA11y';

/** Diálogo mínimo para ejercitar el hook. */
function Dialog({ onClose }: { onClose: () => void }) {
  const dialogRef = useModalA11y(onClose);
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true">
      <button type="button">primero</button>
      <button type="button">medio</button>
      <button type="button">último</button>
    </div>
  );
}

describe('useModalA11y', () => {
  it('llama a onClose al presionar Escape', () => {
    const onClose = vi.fn();
    render(<Dialog onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('atrapa el foco: Tab desde el último elemento vuelve al primero', () => {
    render(<Dialog onClose={vi.fn()} />);
    const primero = screen.getByRole('button', { name: 'primero' });
    const ultimo = screen.getByRole('button', { name: 'último' });

    ultimo.focus();
    fireEvent.keyDown(window, { key: 'Tab' });

    expect(primero).toHaveFocus();
  });

  it('atrapa el foco: Shift+Tab desde el primer elemento va al último', () => {
    render(<Dialog onClose={vi.fn()} />);
    const primero = screen.getByRole('button', { name: 'primero' });
    const ultimo = screen.getByRole('button', { name: 'último' });

    primero.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });

    expect(ultimo).toHaveFocus();
  });

  it('restaura el foco al elemento que abrió el modal cuando se desmonta', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();
    expect(trigger).toHaveFocus();

    const { unmount } = render(<Dialog onClose={vi.fn()} />);
    const medio = screen.getByRole('button', { name: 'medio' });
    medio.focus();
    expect(medio).toHaveFocus();

    unmount();

    expect(trigger).toHaveFocus();
    trigger.remove();
  });
});
