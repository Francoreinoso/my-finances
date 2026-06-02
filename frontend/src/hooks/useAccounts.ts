import { useCallback, useEffect, useState } from 'react';
import { accountClient } from '@/api/accountClient';
import { useToasts } from '@/stores/useToasts';
import type { Account, CreateAccountInput } from '@/types/account';

export type AccountsStatus = 'loading' | 'ready' | 'error';

export interface UseAccounts {
  accounts: Account[];
  status: AccountsStatus;
  error: string | null;
  create: (input: CreateAccountInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/** Carga las cuentas (con balance derivado) y expone la acción de crear. */
export function useAccounts(): UseAccounts {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [status, setStatus] = useState<AccountsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const notify = useToasts((state) => state.notify);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setAccounts(await accountClient.list());
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // El error se propaga a propósito: el modal lo muestra y se queda abierto.
  const create = useCallback(
    async (input: CreateAccountInput) => {
      await accountClient.create(input);
      setAccounts(await accountClient.list());
      notify('Cuenta creada');
    },
    [notify],
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await accountClient.remove(id);
      setAccounts(await accountClient.list());
      notify(result.mode === 'archived' ? 'Cuenta archivada' : 'Cuenta eliminada');
    },
    [notify],
  );

  return { accounts, status, error, create, remove };
}
