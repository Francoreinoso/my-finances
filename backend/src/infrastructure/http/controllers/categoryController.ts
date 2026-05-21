import type { Request, Response } from 'express';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import { listCategories } from '@/application/category/listCategories.js';

export function makeCategoryController(categories: CategoryRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listCategories(categories);
      res.json(result);
    },
  };
}

export type CategoryController = ReturnType<typeof makeCategoryController>;
