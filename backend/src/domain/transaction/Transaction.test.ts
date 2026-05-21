import { describe, it, expect } from 'vitest';
import { Transaction } from './Transaction.js';
import { TransactionValidationError } from './errors.js';

describe('Transaction.create', () => {
  const baseIncome = {
    date: '2026-05-20',
    amount: 1000,
    type: 'income' as const,
    toAccountId: 'acc_1',
  };

  it('crea un ingreso válido (solo cuenta destino)', () => {
    const tx = Transaction.create(baseIncome);
    expect(tx.type).toBe('income');
    expect(tx.amount).toBe(1000);
    expect(tx.toAccountId).toBe('acc_1');
    expect(tx.fromAccountId).toBeNull();
    expect(tx.id).toBeTruthy();
  });

  it('crea un gasto válido (solo cuenta origen)', () => {
    const tx = Transaction.create({
      date: '2026-05-20',
      amount: 500,
      type: 'expense',
      fromAccountId: 'acc_1',
    });
    expect(tx.fromAccountId).toBe('acc_1');
    expect(tx.toAccountId).toBeNull();
  });

  it('crea una transferencia válida (ambas cuentas)', () => {
    const tx = Transaction.create({
      date: '2026-05-20',
      amount: 500,
      type: 'transfer',
      fromAccountId: 'acc_1',
      toAccountId: 'acc_2',
    });
    expect(tx.fromAccountId).toBe('acc_1');
    expect(tx.toAccountId).toBe('acc_2');
  });

  it('rechaza monto cero o negativo', () => {
    expect(() => Transaction.create({ ...baseIncome, amount: 0 })).toThrow(
      TransactionValidationError,
    );
    expect(() => Transaction.create({ ...baseIncome, amount: -10 })).toThrow(
      TransactionValidationError,
    );
  });

  it('rechaza monto no finito', () => {
    expect(() => Transaction.create({ ...baseIncome, amount: NaN })).toThrow(
      TransactionValidationError,
    );
  });

  it('rechaza un ingreso con cuenta de origen', () => {
    expect(() => Transaction.create({ ...baseIncome, fromAccountId: 'acc_2' })).toThrow(
      /origen/,
    );
  });

  it('rechaza un gasto con cuenta de destino', () => {
    expect(() =>
      Transaction.create({
        date: '2026-05-20',
        amount: 500,
        type: 'expense',
        fromAccountId: 'acc_1',
        toAccountId: 'acc_2',
      }),
    ).toThrow(/destino/);
  });

  it('rechaza una transferencia a la misma cuenta', () => {
    expect(() =>
      Transaction.create({
        date: '2026-05-20',
        amount: 500,
        type: 'transfer',
        fromAccountId: 'acc_1',
        toAccountId: 'acc_1',
      }),
    ).toThrow(/misma/);
  });

  it('rechaza una transferencia sin una de las cuentas', () => {
    expect(() =>
      Transaction.create({
        date: '2026-05-20',
        amount: 500,
        type: 'transfer',
        fromAccountId: 'acc_1',
      }),
    ).toThrow(TransactionValidationError);
  });

  it('rechaza una fecha con formato inválido', () => {
    expect(() => Transaction.create({ ...baseIncome, date: '20-05-2026' })).toThrow(
      TransactionValidationError,
    );
  });

  it('rechaza una fecha de calendario inexistente', () => {
    expect(() => Transaction.create({ ...baseIncome, date: '2026-02-30' })).toThrow(
      TransactionValidationError,
    );
  });

  it('una transferencia ignora la categoría: no se categoriza', () => {
    const tx = Transaction.create({
      date: '2026-05-20',
      amount: 500,
      type: 'transfer',
      fromAccountId: 'acc_1',
      toAccountId: 'acc_2',
      categoryId: 'cat_x',
    });
    expect(tx.categoryId).toBeNull();
  });

  it('recorta la descripción y vacía los espacios a string vacío', () => {
    expect(Transaction.create({ ...baseIncome, description: '  hola  ' }).description).toBe(
      'hola',
    );
    expect(Transaction.create({ ...baseIncome, description: '   ' }).description).toBe('');
  });
});

describe('Transaction.fromPersistence', () => {
  it('reconstruye una transacción desde un snapshot sin perder datos', () => {
    const snapshot = {
      id: 'tx_1',
      date: '2026-05-20',
      amount: 1000,
      type: 'income' as const,
      fromAccountId: null,
      toAccountId: 'acc_1',
      categoryId: null,
      bucketId: null,
      description: '',
      recurringId: null,
      createdAt: '2026-05-20T00:00:00.000Z',
    };
    expect(Transaction.fromPersistence(snapshot).toJSON()).toEqual(snapshot);
  });
});

describe('Transaction.withChanges', () => {
  const base = Transaction.create({
    date: '2026-05-10',
    amount: 5500,
    type: 'expense',
    fromAccountId: 'acc_1',
    categoryId: 'cat_x',
    description: 'Almuerzo',
  });

  it('cambia monto, fecha, categoría y descripción', () => {
    const edited = base.withChanges({
      amount: 5000,
      date: '2026-05-11',
      categoryId: 'cat_y',
      description: 'Cena',
    });
    expect(edited.amount).toBe(5000);
    expect(edited.date).toBe('2026-05-11');
    expect(edited.categoryId).toBe('cat_y');
    expect(edited.description).toBe('Cena');
  });

  it('conserva id, tipo, cuentas y createdAt', () => {
    const edited = base.withChanges({ amount: 5000 });
    expect(edited.id).toBe(base.id);
    expect(edited.type).toBe(base.type);
    expect(edited.fromAccountId).toBe(base.fromAccountId);
    expect(edited.createdAt).toBe(base.createdAt);
  });

  it('rechaza un monto inválido', () => {
    expect(() => base.withChanges({ amount: 0 })).toThrow(TransactionValidationError);
  });

  it('rechaza una fecha inválida', () => {
    expect(() => base.withChanges({ date: '2026-02-30' })).toThrow(TransactionValidationError);
  });

  it('no muta la transacción original', () => {
    base.withChanges({ amount: 9999 });
    expect(base.amount).toBe(5500);
  });

  it('una transferencia nunca toma categoría', () => {
    const transfer = Transaction.create({
      date: '2026-05-10',
      amount: 1000,
      type: 'transfer',
      fromAccountId: 'acc_1',
      toAccountId: 'acc_2',
    });
    expect(transfer.withChanges({ categoryId: 'cat_x' }).categoryId).toBeNull();
  });
});
