import { useCallback, useEffect, useState } from 'react';
import { bucketClient } from '@/api/bucketClient';
import type { Bucket } from '@/types/bucket';

export type BucketsStatus = 'loading' | 'ready' | 'error';

export interface UseBuckets {
  buckets: Bucket[];
  status: BucketsStatus;
  error: string | null;
}

function toMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Error desconocido';
}

/** Carga los buckets con su progreso. Vista de solo lectura: no hay acciones. */
export function useBuckets(): UseBuckets {
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [status, setStatus] = useState<BucketsStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      setBuckets(await bucketClient.list());
      setStatus('ready');
    } catch (e) {
      setError(toMessage(e));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { buckets, status, error };
}
