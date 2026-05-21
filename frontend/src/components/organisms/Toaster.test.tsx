import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toaster } from '@/components/organisms/Toaster';
import { useToasts } from '@/stores/useToasts';

describe('Toaster', () => {
  beforeEach(() => {
    useToasts.setState({ toasts: [] });
  });

  it('no renderiza nada cuando no hay toasts', () => {
    const { container } = render(<Toaster />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra el mensaje de un toast encolado', () => {
    render(<Toaster />);
    act(() => {
      useToasts.getState().notify('Bucket creado');
    });
    expect(screen.getByText('Bucket creado')).toBeInTheDocument();
  });

  it('un toast de éxito se anuncia con role="status" (cortés)', () => {
    render(<Toaster />);
    act(() => {
      useToasts.getState().notify('Listo');
    });
    expect(screen.getByRole('status')).toHaveTextContent('Listo');
  });

  it('un toast de error se anuncia con role="alert" (asertivo)', () => {
    render(<Toaster />);
    act(() => {
      useToasts.getState().notify('Algo falló', 'error');
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Algo falló');
  });

  it('el botón de cerrar descarta el toast', () => {
    render(<Toaster />);
    act(() => {
      useToasts.getState().notify('Chau');
    });
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(screen.queryByText('Chau')).not.toBeInTheDocument();
  });

  it('el toast se auto-descarta tras la espera', () => {
    vi.useFakeTimers();
    try {
      render(<Toaster />);
      act(() => {
        useToasts.getState().notify('Efímero');
      });
      expect(screen.getByText('Efímero')).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.queryByText('Efímero')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
