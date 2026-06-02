import { useCallback, useEffect, useState } from 'react';
import { bucketClient } from '@/api/bucketClient';
import { accountClient } from '@/api/accountClient';
import { useToasts } from '@/stores/useToasts';
import type { Bucket, CreateBucketInput, BucketChanges } from '@/types/bucket';
import type { Account } from '@/types/account';

export type BucketsStatus = 'loading' | 'ready' | 'error';

export interface UseBuckets {
  buckets: Bucket[];
  accounts: Account[];
  status: BucketsStatus;
  error: string | null;
  create: (input: CreateBucketInput) => Promise<void>;
  update: (id: string, changes: BucketChanges) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/**
 * Carga los buckets con su progreso y las cuentas (para el selector del
 * formulario), y expone las acciones de crear y editar.
 */
export function useBuckets(): UseBuckets {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [status, setStatus] = useState<BucketsStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const notify = useToasts((state) => state.notify);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const [b, a] = await Promise.all([bucketClient.list(), accountClient.list()]);
      setBuckets(b);
      setAccounts(a);
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
  const reloadBuckets = useCallback(async () => {
    setBuckets(await bucketClient.list());
  }, []);

  const create = useCallback(
    async (input: CreateBucketInput) => {
      await bucketClient.create(input);
      await reloadBuckets();
      notify('Bucket creado');
    },
    [reloadBuckets, notify],
  );

  const update = useCallback(
    async (id: string, changes: BucketChanges) => {
      await bucketClient.update(id, changes);
      await reloadBuckets();
      notify('Bucket actualizado');
    },
    [reloadBuckets, notify],
  );

  const remove = useCallback(
    async (id: string) => {
      const result = await bucketClient.remove(id);
      await reloadBuckets();
      notify(result.mode === 'archived' ? 'Bucket archivado' : 'Bucket eliminado');
    },
    [reloadBuckets, notify],
  );

  return { buckets, accounts, status, error, create, update, remove };
}
