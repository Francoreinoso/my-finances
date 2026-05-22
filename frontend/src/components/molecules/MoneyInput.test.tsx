import { render, screen, fireEvent } from '@testing-library/react';
import { MoneyInput } from '@/components/molecules/MoneyInput';

describe('MoneyInput', () => {
  it('muestra el valor crudo formateado con separadores de miles', () => {
    render(<MoneyInput value="1000000" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('1.000.000');
  });

  it('muestra el campo vacío cuando no hay valor', () => {
    render(<MoneyInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });

  it('al tipear, llama onChange con el monto crudo sin separadores', () => {
    const onChange = vi.fn();
    render(<MoneyInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1500000' } });
    expect(onChange).toHaveBeenCalledWith('1500000');
  });

  it('descarta los caracteres que no son dígito ni coma decimal', () => {
    const onChange = vi.fn();
    render(<MoneyInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '1.234,5' } });
    expect(onChange).toHaveBeenCalledWith('1234.5');
  });

  it('usa inputMode decimal (es un type=text, no un type=number)', () => {
    render(<MoneyInput value="" onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', 'decimal');
  });
});
