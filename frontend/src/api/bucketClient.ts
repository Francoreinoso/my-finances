import type { Bucket } from '@/types/bucket';
import { request } from '@/api/http';

export const bucketClient = {
  list(): Promise<Bucket[]> {
    return request<Bucket[]>('/buckets');
  },
};

export type BucketClient = typeof bucketClient;
