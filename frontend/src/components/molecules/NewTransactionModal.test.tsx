import { render, screen, fireEvent } from '@testing-library/react';
import { NewTransactionModal } from '@/components/molecules/NewTransactionModal';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';

const accounts: Account[] = [
  {
    id: 'a1',
    name: 'Santander',
    type: 'checking',
    currency: 'CLP',
    isArchived: false,
    createdAt: '2026-01-01',
    balance: 1000,
  },
  {
    id: 'a2',
    name: 'Fintual',
    type: 'investment',
    currency: 'CLP',
    isArchived: false,
    createdAt: '2026-01-01',
    balance: 500,
  },
];

const categories: Category[] = [
  { id: 'c1', name: 'Comida', type: 'expense', color: '#abcdef' },
];

function renderModal() {
  return render(
    <NewTransactionModal
      accounts={accounts}
      categories={categories}
      onClose={vi.fn()}
      onSubmit={vi.fn()}
    />,
  );
}

describe('NewTransactionModal', () => {
  it('el selector de tipo refleja la selección con aria-pressed', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Gasto', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ingreso', pressed: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ingreso' }));

    expect(screen.getByRole('button', { name: 'Ingreso', pressed: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gasto', pressed: false })).toBeInTheDocument();
  });

  it('muestra un error inline al dejar el monto vacío', () => {
    renderModal();
    const monto = screen.getByLabelText('Monto');
    expect(screen.queryByText('Ingresá un monto mayor a 0.')).not.toBeInTheDocument();

    fireEvent.blur(monto);

    expect(screen.getByText('Ingresá un monto mayor a 0.')).toBeInTheDocument();
    expect(monto).toHaveAttribute('aria-invalid', 'true');
  });
});
