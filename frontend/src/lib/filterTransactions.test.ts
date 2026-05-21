import { filterTransactions, transactionMonths } from '@/lib/filterTransactions';
import type { Transaction } from '@/types/transaction';

/** Construye una Transaction completa, con overrides puntuales. */
function tx(over: Partial<Transaction>): Transaction {
  return {
    id: 'id',
    date: '2026-05-01',
    amount: 100,
    type: 'expense',
    fromAccountId: null,
    toAccountId: null,
    categoryId: null,
    bucketId: null,
    description: '',
    recurringId: null,
    createdAt: '2026-05-01',
    ...over,
  };
}

const txs: Transaction[] = [
  tx({ id: '1', date: '2026-05-10', type: 'expense', categoryId: 'c1' }),
  tx({ id: '2', date: '2026-05-20', type: 'income', categoryId: 'c2' }),
  tx({ id: '3', date: '2026-04-15', type: 'expense', categoryId: 'c1' }),
  tx({ id: '4', date: '2026-05-05', type: 'transfer', categoryId: null }),
];

describe('filterTransactions', () => {
  it('sin filtros devuelve todas', () => {
    const r = filterTransactions(txs, { month: null, type: null, categoryId: null });
    expect(r).toHaveLength(4);
  });

  it('filtra por mes', () => {
    const r = filterTransactions(txs, { month: '2026-05', type: null, categoryId: null });
    expect(r.map((t) => t.id)).toEqual(['1', '2', '4']);
  });

  it('filtra por tipo', () => {
    const r = filterTransactions(txs, { month: null, type: 'expense', categoryId: null });
    expect(r.map((t) => t.id)).toEqual(['1', '3']);
  });

  it('filtra por categoría', () => {
    const r = filterTransactions(txs, { month: null, type: null, categoryId: 'c1' });
    expect(r.map((t) => t.id)).toEqual(['1', '3']);
  });

  it('combina los filtros en conjunción (AND)', () => {
    const r = filterTransactions(txs, { month: '2026-05', type: 'expense', categoryId: 'c1' });
    expect(r.map((t) => t.id)).toEqual(['1']);
  });
});

describe('transactionMonths', () => {
  it('devuelve los meses únicos, del más reciente al más viejo', () => {
    expect(transactionMonths(txs)).toEqual(['2026-05', '2026-04']);
  });
});
