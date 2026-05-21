import { render, screen } from '@testing-library/react';
import { PageSkeleton } from '@/components/molecules/PageSkeleton';

const VARIANTS = ['cards', 'rows', 'table', 'summary'] as const;

describe('PageSkeleton', () => {
  it('expone role="status" para que la carga la anuncien los lectores de pantalla', () => {
    render(<PageSkeleton variant="cards" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('incluye texto accesible "Cargando…" (los bloques visuales son decorativos)', () => {
    render(<PageSkeleton variant="rows" />);
    expect(screen.getByText('Cargando…')).toBeInTheDocument();
  });

  it('renderiza cada variante sin romper', () => {
    for (const variant of VARIANTS) {
      const { unmount } = render(<PageSkeleton variant={variant} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      unmount();
    }
  });
});
