import { render, screen } from '@testing-library/react';
import { EmptyState } from '@/components/molecules/EmptyState';

describe('EmptyState', () => {
  it('muestra el título', () => {
    render(<EmptyState title="Sin datos" />);
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });

  it('muestra la pista cuando se provee', () => {
    render(<EmptyState title="Sin datos" hint="Creá el primero." />);
    expect(screen.getByText('Creá el primero.')).toBeInTheDocument();
  });

  it('expone role="status" para que lo anuncien los lectores de pantalla', () => {
    render(<EmptyState title="Sin datos" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
