import { describe, it, expect } from 'vitest';
import { RecurringTransfer, type RecurringTransferSnapshot } from './RecurringTransfer.js';
import { RecurringTransferValidationError } from './errors.js';

function make(overrides: Partial<RecurringTransferSnapshot> = {}): RecurringTransfer {
  return RecurringTransfer.fromPersistence({
    id: 'rec_1',
    name: 'Aporte test',
    fromAccountId: 'acc_a',
    toAccountId: 'acc_b',
    amount: 80000,
    bucketId: null,
    dayOfMonth: 8,
    nextDueDate: '2026-06-08',
    isActive: true,
    ...overrides,
  });
}

describe('RecurringTransfer.isPending', () => {
  it('no está pendiente si la fecha es futura', () => {
    expect(make({ nextDueDate: '2026-06-08' }).isPending('2026-05-20')).toBe(false);
  });

  it('está pendiente si la fecha es exactamente hoy', () => {
    expect(make({ nextDueDate: '2026-06-08' }).isPending('2026-06-08')).toBe(true);
  });

  it('está pendiente si la fecha ya pasó', () => {
    expect(make({ nextDueDate: '2026-06-08' }).isPending('2026-07-01')).toBe(true);
  });

  it('no está pendiente si está inactivo, aunque la fecha haya pasado', () => {
    expect(make({ nextDueDate: '2026-06-08', isActive: false }).isPending('2026-07-01')).toBe(
      false,
    );
  });
});

describe('RecurringTransfer.advanced', () => {
  it('avanza la fecha un mes', () => {
    expect(make({ nextDueDate: '2026-06-08', dayOfMonth: 8 }).advanced().nextDueDate).toBe(
      '2026-07-08',
    );
  });

  it('salta de diciembre a enero del año siguiente', () => {
    expect(make({ nextDueDate: '2026-12-08', dayOfMonth: 8 }).advanced().nextDueDate).toBe(
      '2027-01-08',
    );
  });

  it('recorta el día si no existe en el mes destino (31 de enero → 28 de febrero)', () => {
    expect(make({ nextDueDate: '2026-01-31', dayOfMonth: 31 }).advanced().nextDueDate).toBe(
      '2026-02-28',
    );
  });

  it('no muta el aporte original', () => {
    const rt = make({ nextDueDate: '2026-06-08' });
    rt.advanced();
    expect(rt.nextDueDate).toBe('2026-06-08');
  });
});

describe('RecurringTransfer.withChanges', () => {
  it('cambia el monto', () => {
    expect(make({ amount: 80000 }).withChanges({ amount: 120000 }).amount).toBe(120000);
  });

  it('activa o pausa el aporte', () => {
    expect(make({ isActive: true }).withChanges({ isActive: false }).isActive).toBe(false);
  });

  it('deja intacto lo que no se cambia', () => {
    const updated = make({ amount: 80000, isActive: true }).withChanges({ amount: 120000 });
    expect(updated.isActive).toBe(true);
  });

  it('rechaza un monto cero o negativo', () => {
    expect(() => make().withChanges({ amount: 0 })).toThrow(RecurringTransferValidationError);
    expect(() => make().withChanges({ amount: -5 })).toThrow(RecurringTransferValidationError);
  });

  it('no muta el aporte original', () => {
    const rt = make({ amount: 80000 });
    rt.withChanges({ amount: 120000 });
    expect(rt.amount).toBe(80000);
  });
});
