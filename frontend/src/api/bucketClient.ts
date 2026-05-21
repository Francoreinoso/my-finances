import type { Bucket, CreateBucketInput, BucketChanges } from '@/types/bucket';
import { request } from '@/api/http';

export const bucketClient = {
  list(): Promise<Bucket[]> {
    return request<Bucket[]>('/buckets');
  },
  create(input: CreateBucketInput): Promise<void> {
    return request<void>('/buckets', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: string, changes: BucketChanges): Promise<void> {
    return request<void>(`/buckets/${id}`, { method: 'PATCH', body: JSON.stringify(changes) });
  },
};

export type BucketClient = typeof bucketClient;
