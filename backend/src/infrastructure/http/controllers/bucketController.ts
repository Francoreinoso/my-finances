import type { Request, Response } from 'express';
import type { BucketRepository } from '@/domain/bucket/BucketRepository.js';
import type { AccountRepository } from '@/domain/account/AccountRepository.js';
import type { BucketChanges } from '@/domain/bucket/Bucket.js';
import { listBucketsWithProgress } from '@/application/bucket/listBucketsWithProgress.js';
import { createBucket } from '@/application/bucket/createBucket.js';
import { updateBucket } from '@/application/bucket/updateBucket.js';
import { deleteBucket } from '@/application/bucket/deleteBucket.js';
import type {
  CreateBucketRequest,
  UpdateBucketRequest,
} from '@/shared/validation/bucketSchemas.js';

type IdParams = { id: string };

export function makeBucketController(buckets: BucketRepository, accounts: AccountRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listBucketsWithProgress(buckets, accounts);
      res.json(result);
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const bucket = await createBucket(buckets, req.body as CreateBucketRequest);
      res.status(201).json(bucket);
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateBucketRequest;
      const changes: BucketChanges = {};
      if (body.name !== undefined) changes.name = body.name;
      if (body.targetAmount !== undefined) changes.targetAmount = body.targetAmount;
      if (body.targetDate !== undefined) changes.targetDate = body.targetDate;
      if (body.accountId !== undefined) changes.accountId = body.accountId;
      const bucket = await updateBucket(buckets, req.params.id, changes);
      res.json(bucket);
    },

    remove: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const result = await deleteBucket(buckets, req.params.id);
      res.json(result);
    },
  };
}

export type BucketController = ReturnType<typeof makeBucketController>;
