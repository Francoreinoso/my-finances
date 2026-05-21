import { useCallback, useEffect, useState } from 'react';
import { recurringClient } from '@/api/recurringClient';
import type { RecurringTransfer } from '@/types/recurring';

export type RecurringStatus = 'loading' | 'ready' | 'error';

export interface UseRecurring {
  recurring: RecurringTransfer[];
  status: RecurringStatus;
  error: string | null;
  confirm: (id: string) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/** Carga los aportes recurrentes y expone la acción de confirmar. */
export function useRecurring(): UseRecurring {
  const [recurring, setRecurring] = useState<RecurringTransfer[]>([]);
  const [status, setStatus] = useState<RecurringStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setRecurring(await recurringClient.list());
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirm = useCallback(async (id: string) => {
    // El error se propaga a propósito: la página lo muestra.
    await recurringClient.confirm(id);
    setRecurring(await recurringClient.list());
  }, []);

  return { recurring, status, error, confirm };
}
