import { Receipt, PiggyBank, Repeat, ChartPie, type Icon } from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  path: string;
  enabled: boolean;
}

/** Vistas de my-finanzas. Las cuatro habilitadas (Fases 1 a 4). */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'transacciones', label: 'Transacciones', icon: Receipt, path: '/', enabled: true },
  { id: 'buckets', label: 'Buckets', icon: PiggyBank, path: '/buckets', enabled: true },
  { id: 'recurrentes', label: 'Recurrentes', icon: Repeat, path: '/recurrentes', enabled: true },
  { id: 'resumen', label: 'Resumen', icon: ChartPie, path: '/resumen', enabled: true },
] as const;
