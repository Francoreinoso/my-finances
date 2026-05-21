import { render, screen, fireEvent } from '@testing-library/react';
import { TransactionFilters } from '@/components/molecules/TransactionFilters';
import { EMPTY_FILTER } from '@/lib/filterTransactions';
import type { Category } from '@/types/category';

const categories: Category[] = [{ id: 'c1', name: 'Comida', type: 'expense', color: '#abcdef' }];

describe('TransactionFilters', () => {
  it('al cambiar el tipo notifica el filtro actualizado', () => {
    const onChange = vi.fn();
    render(
      <TransactionFilters
        months={['2026-05']}
        categories={categories}
        filter={EMPTY_FILTER}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'expense' } });

    expect(onChange).toHaveBeenCalledWith({ month: null, type: 'expense', categoryId: null });
  });

  it('al elegir "Todos" en el tipo, vuelve a null', () => {
    const onChange = vi.fn();
    render(
      <TransactionFilters
        months={['2026-05']}
        categories={categories}
        filter={{ month: null, type: 'expense', categoryId: null }}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: '' } });

    expect(onChange).toHaveBeenCalledWith({ month: null, type: null, categoryId: null });
  });
});
