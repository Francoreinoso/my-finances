import { render, screen, fireEvent } from '@testing-library/react';
import { DatePicker } from '@/components/molecules/DatePicker';

describe('DatePicker', () => {
  it('muestra la fecha seleccionada en formato legible', () => {
    render(<DatePicker value="2026-05-21" onChange={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent('21 de mayo de 2026');
  });

  it('muestra un placeholder cuando no hay fecha', () => {
    render(<DatePicker value="" onChange={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveTextContent(/eleg/i);
  });

  it('abre el calendario al hacer clic en el trigger', () => {
    render(<DatePicker value="2026-05-21" onChange={vi.fn()} />);
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('cierra el calendario con Escape', () => {
    render(<DatePicker value="2026-05-21" onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.keyDown(screen.getByRole('grid'), { key: 'Escape' });
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('al elegir un día llama onChange con la fecha ISO y cierra el calendario', () => {
    const onChange = vi.fn();
    render(<DatePicker value="2026-05-21" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByText('10'));
    expect(onChange).toHaveBeenCalledWith('2026-05-10');
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});
