import { Receipt, PiggyBank, Repeat, ChartPie, type Icon } from '@phosphor-icons/react';

export interface NavItem {
  id: string;
  label: string;
  icon: Icon;
  path: string;
  enabled: boolean;
}

/**
 * Vistas de my-finanzas. Transacciones y Buckets están habilitadas (Fases 1 y 2);
 * Recurrentes y Resumen se muestran como "(pronto)" hasta sus fases.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'transacciones', label: 'Transacciones', icon: Receipt, path: '/', enabled: true },
  { id: 'buckets', label: 'Buckets', icon: PiggyBank, path: '/buckets', enabled: true },
  { id: 'recurrentes', label: 'Recurrentes', icon: Repeat, path: '/recurrentes', enabled: false },
  { id: 'resumen', label: 'Resumen', icon: ChartPie, path: '/resumen', enabled: false },
] as const;
