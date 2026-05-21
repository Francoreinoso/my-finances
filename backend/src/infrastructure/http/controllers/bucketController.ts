import type { Request, Response } from 'express';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import { listBucketsWithProgress } from '@/application/bucket/listBucketsWithProgress.js';

export function makeBucketController(buckets: BucketRepository, accounts: AccountRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listBucketsWithProgress(buckets, accounts);
      res.json(result);
    },
  };
}

export type BucketController = ReturnType<typeof makeBucketController>;
