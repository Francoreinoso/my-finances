import { request } from '@/api/http';

export interface BackupResult {
  fileName: string;
  createdAt: string;
}

export const backupClient = {
  create(): Promise<BackupResult> {
    return request<BackupResult>('/backup', { method: 'POST' });
  },
};

export type BackupClient = typeof backupClient;
