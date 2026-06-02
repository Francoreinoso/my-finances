import {
  Receipt,
  PiggyBank,
  Repeat,
  ChartPie,
  Tag,
  Database,
  Wallet,
  type Icon,
} from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  path: string;
  enabled: boolean;
}

/** Vistas de my-finanzas. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'transacciones', label: 'Transacciones', icon: Receipt, path: '/', enabled: true },
  { id: 'buckets', label: 'Buckets', icon: PiggyBank, path: '/buckets', enabled: true },
  { id: 'recurrentes', label: 'Recurrentes', icon: Repeat, path: '/recurrentes', enabled: true },
  { id: 'cuentas', label: 'Cuentas', icon: Wallet, path: '/cuentas', enabled: true },
  { id: 'categorias', label: 'Categorías', icon: Tag, path: '/categorias', enabled: true },
  { id: 'resumen', label: 'Resumen', icon: ChartPie, path: '/resumen', enabled: true },
  { id: 'datos', label: 'Datos', icon: Database, path: '/datos', enabled: true },
] as const;
