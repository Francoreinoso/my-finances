import {
  accounts,
  buckets,
  categories,
  recurringTransfers,
  type NewAccountRow,
  type NewBucketRow,
  type NewCategoryRow,
  type NewRecurringTransferRow,
} from './schema.js';
import type { DB } from './db.js';

/**
 * Datos iniciales de my-finanzas. Reflejan el plan financiero real:
 * 4 cuentas, 3 buckets de ahorro y los 3 aportes recurrentes de la Fase 1
 * (sueldo de $250.000). Cuando el sueldo suba, los montos se editan desde
 * la app, no acá.
 *
 * Los ids son fijos y legibles a propósito: así el seed es idempotente y los
 * aportes recurrentes pueden referenciar cuentas/buckets por id conocido.
 * Las entidades creadas en runtime usan crypto.randomUUID().
 */

const NOW = new Date().toISOString();

const SEED_ACCOUNTS: NewAccountRow[] = [
  { id: 'acc_santander', name: 'Santander Débito', type: 'checking', currency: 'CLP', createdAt: NOW },
  { id: 'acc_risky', name: 'Fintual Risky Norris', type: 'investment', currency: 'CLP', createdAt: NOW },
  { id: 'acc_streep', name: 'Fintual Very Conservative Streep', type: 'savings', currency: 'CLP', createdAt: NOW },
  { id: 'acc_dap', name: 'DAP Santander', type: 'savings', currency: 'CLP', createdAt: NOW },
];

const SEED_CATEGORIES: NewCategoryRow[] = [
  { id: 'cat_sueldo', name: 'Sueldo', type: 'income', color: '#10b981' },
  { id: 'cat_otros_in', name: 'Otros ingresos', type: 'income', color: '#06b6d4' },
  { id: 'cat_comida', name: 'Comida', type: 'expense', color: '#f59e0b' },
  { id: 'cat_transporte', name: 'Transporte', type: 'expense', color: '#3b82f6' },
  { id: 'cat_entretenimiento', name: 'Entretenimiento', type: 'expense', color: '#a855f7' },
  { id: 'cat_salud', name: 'Salud', type: 'expense', color: '#ef4444' },
  { id: 'cat_personal', name: 'Personal', type: 'expense', color: '#ec4899' },
  { id: 'cat_otros_ex', name: 'Otros', type: 'expense', color: '#6b7280' },
];

const SEED_BUCKETS: NewBucketRow[] = [
  { id: 'bk_mudanza', name: 'Mudanza', targetAmount: 1_500_000, targetDate: '2027-07-01', accountId: 'acc_dap' },
  { id: 'bk_emergencia', name: 'Emergencia', targetAmount: 2_100_000, targetDate: null, accountId: 'acc_streep' },
  { id: 'bk_largoplazo', name: 'Largo Plazo', targetAmount: null, targetDate: null, accountId: 'acc_risky' },
];

// Fase 1: sueldo $250.000 → $80K mudanza + $30K emergencia + $30K largo plazo.
// dayOfMonth = 5 es una ASUNCIÓN (día de pago). Editable desde la app.
const SEED_RECURRING: NewRecurringTransferRow[] = [
  {
    id: 'rec_mudanza',
    name: 'Aporte Mudanza',
    fromAccountId: 'acc_santander',
    toAccountId: 'acc_dap',
    amount: 80_000,
    bucketId: 'bk_mudanza',
    dayOfMonth: 5,
    nextDueDate: '2026-06-05',
    isActive: true,
  },
  {
    id: 'rec_emergencia',
    name: 'Aporte Emergencia',
    fromAccountId: 'acc_santander',
    toAccountId: 'acc_streep',
    amount: 30_000,
    bucketId: 'bk_emergencia',
    dayOfMonth: 5,
    nextDueDate: '2026-06-05',
    isActive: true,
  },
  {
    id: 'rec_largoplazo',
    name: 'Aporte Largo Plazo',
    fromAccountId: 'acc_santander',
    toAccountId: 'acc_risky',
    amount: 30_000,
    bucketId: 'bk_largoplazo',
    dayOfMonth: 5,
    nextDueDate: '2026-06-05',
    isActive: true,
  },
];

/**
 * Siembra los datos iniciales si la base está vacía. Idempotente: si ya hay
 * cuentas no hace nada. Las inserciones van en una transacción para que el
 * orden (cuentas → buckets → recurrentes, por los foreign keys) sea atómico.
 *
 * Devuelve true si sembró, false si la base ya tenía datos.
 */
export function seedIfEmpty(db: DB): boolean {
  const existing = db.select({ id: accounts.id }).from(accounts).limit(1).all();
  if (existing.length > 0) return false;

  db.transaction((tx) => {
    tx.insert(accounts).values(SEED_ACCOUNTS).run();
    tx.insert(categories).values(SEED_CATEGORIES).run();
    tx.insert(buckets).values(SEED_BUCKETS).run();
    tx.insert(recurringTransfers).values(SEED_RECURRING).run();
  });

  return true;
}
