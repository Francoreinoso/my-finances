import { useCallback, useEffect, useState } from 'react';
import { reportClient } from '@/api/reportClient';
import type { MonthlySummary } from '@/types/report';
import { todayISO } from '@/lib/format';

export type SummaryStatus = 'loading' | 'ready' | 'error';

export interface UseMonthlySummary {
  month: string;
  summary: MonthlySummary | null;
  status: SummaryStatus;
  error: string | null;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/** Mueve un mes (YYYY-MM) delta meses, manejando el salto de año. */
function shiftMonth(month: string, delta: number): string {
  const year = Number(month.slice(0, 4));
  const monthNumber = Number(month.slice(5, 7));
  const absolute = year * 12 + (monthNumber - 1) + delta;
  const newYear = Math.floor(absolute / 12);
  const newMonth = (absolute % 12) + 1;
  return `${String(newYear)}-${String(newMonth).padStart(2, '0')}`;
}

/**
 * Carga el resumen del mes y permite navegar a meses anteriores/siguientes.
 * Cambiar de mes vuelve a pedir el resumen automáticamente.
 */
export function useMonthlySummary(): UseMonthlySummary {
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [status, setStatus] = useState<SummaryStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setSummary(await reportClient.monthly(month));
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, [month]);

  useEffect(() => {
    void load();
  }, [load]);

  const goToPreviousMonth = useCallback(() => {
    setMonth((m) => shiftMonth(m, -1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setMonth((m) => shiftMonth(m, 1));
  }, []);

  return { month, summary, status, error, goToPreviousMonth, goToNextMonth };
}
