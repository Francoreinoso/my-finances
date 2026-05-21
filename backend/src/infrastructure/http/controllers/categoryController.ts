import type { Request, Response } from 'express';
import type { CategoryRepository } from '@/domain/category/CategoryRepository.js';
import type { CategoryChanges } from '@/domain/category/Category.js';
import { listCategories } from '@/application/category/listCategories.js';
import { createCategory } from '@/application/category/createCategory.js';
import { updateCategory } from '@/application/category/updateCategory.js';
import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/shared/validation/categorySchemas.js';

type IdParams = { id: string };

export function makeCategoryController(categories: CategoryRepository) {
  return {
    list: async (_req: Request, res: Response): Promise<void> => {
      const result = await listCategories(categories);
      res.json(result);
    },

    create: async (req: Request, res: Response): Promise<void> => {
      const category = await createCategory(categories, req.body as CreateCategoryRequest);
      res.status(201).json(category);
    },

    update: async (req: Request<IdParams>, res: Response): Promise<void> => {
      const body = req.body as UpdateCategoryRequest;
      const changes: CategoryChanges = {};
      if (body.name !== undefined) changes.name = body.name;
      if (body.color !== undefined) changes.color = body.color;
      const category = await updateCategory(categories, req.params.id, changes);
      res.json(category);
    },
  };
}

export type CategoryController = ReturnType<typeof makeCategoryController>;
