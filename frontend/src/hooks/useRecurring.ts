import { useCallback, useEffect, useState } from 'react';
import { recurringClient } from '@/api/recurringClient';
import type { RecurringTransfer, RecurringTransferChanges } from '@/types/recurring';

export type RecurringStatus = 'loading' | 'ready' | 'error';

export interface UseRecurring {
  recurring: RecurringTransfer[];
  status: RecurringStatus;
  error: string | null;
  confirm: (id: string) => Promise<void>;
  update: (id: string, changes: RecurringTransferChanges) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/** Carga los aportes recurrentes y expone las acciones de confirmar y editar. */
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

  // confirm y update propagan el error a propósito: la card lo muestra.
  const confirm = useCallback(async (id: string) => {
    await recurringClient.confirm(id);
    setRecurring(await recurringClient.list());
  }, []);

  const update = useCallback(async (id: string, changes: RecurringTransferChanges) => {
    await recurringClient.update(id, changes);
    setRecurring(await recurringClient.list());
  }, []);

  return { recurring, status, error, confirm, update };
}
