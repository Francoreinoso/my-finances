import { useCallback, useEffect, useState } from 'react';
import { recurringClient } from '@/api/recurringClient';
import { accountClient } from '@/api/accountClient';
import { bucketClient } from '@/api/bucketClient';
import { useToasts } from '@/stores/useToasts';
import type {
  CreateRecurringTransferInput,
  RecurringTransfer,
  RecurringTransferChanges,
} from '@/types/recurring';
import type { Account } from '@/types/account';
import type { Bucket } from '@/types/bucket';

export type RecurringStatus = 'loading' | 'ready' | 'error';

export interface UseRecurring {
  recurring: RecurringTransfer[];
  accounts: Account[];
  buckets: Bucket[];
  status: RecurringStatus;
  error: string | null;
  create: (input: CreateRecurringTransferInput) => Promise<void>;
  confirm: (id: string) => Promise<void>;
  update: (id: string, changes: RecurringTransferChanges) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/**
 * Carga aportes recurrentes + cuentas + buckets (los dos últimos los necesita
 * el formulario de creación) y expone las acciones de crear, confirmar y editar.
 */
export function useRecurring(): UseRecurring {
  const [recurring, setRecurring] = useState<RecurringTransfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [status, setStatus] = useState<RecurringStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const notify = useToasts((state) => state.notify);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const [r, a, b] = await Promise.all([
        recurringClient.list(),
        accountClient.list(),
        bucketClient.list(),
      ]);
      setRecurring(r);
      setAccounts(a);
      setBuckets(b);
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Acciones propagan errores a propósito: la card/modal los muestra.
  const reloadRecurring = useCallback(async () => {
    setRecurring(await recurringClient.list());
  }, []);

  const create = useCallback(
    async (input: CreateRecurringTransferInput) => {
      await recurringClient.create(input);
      await reloadRecurring();
      notify('Aporte creado');
    },
    [reloadRecurring, notify],
  );

  const confirm = useCallback(
    async (id: string) => {
      await recurringClient.confirm(id);
      await reloadRecurring();
      notify('Aporte confirmado');
    },
    [reloadRecurring, notify],
  );

  const update = useCallback(
    async (id: string, changes: RecurringTransferChanges) => {
      await recurringClient.update(id, changes);
      await reloadRecurring();
      notify('Aporte actualizado');
    },
    [reloadRecurring, notify],
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await recurringClient.remove(id);
      await reloadRecurring();
      notify(result.mode === 'archived' ? 'Aporte archivado' : 'Aporte eliminado');
    },
    [reloadRecurring, notify],
  );

  return { recurring, accounts, buckets, status, error, create, confirm, update, remove };
}
