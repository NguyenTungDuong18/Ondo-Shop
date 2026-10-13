import type { CategoryRepository } from '../../domain/repositories/CategoryRepository';

/** Application port; installed once by the composition root. */
let repository: CategoryRepository | undefined;
export function configureCategoryRepository(adapter: CategoryRepository) { repository = adapter; }
function getRepository(): CategoryRepository {
  if (!repository) throw new Error('Category repository has not been configured');
  return repository;
}
export const createCategoryUseCases = (adapter: CategoryRepository): CategoryRepository => ({
  getCategories: (...args) => adapter.getCategories(...args),
  getCategoryById: (...args) => adapter.getCategoryById(...args),
  createCategory: (...args) => adapter.createCategory(...args),
  updateCategory: (...args) => adapter.updateCategory(...args),
  deleteCategory: (...args) => adapter.deleteCategory(...args),
});
export const categoryService: CategoryRepository = {
  getCategories: (...args) => getRepository().getCategories(...args),
  getCategoryById: (...args) => getRepository().getCategoryById(...args),
  createCategory: (...args) => getRepository().createCategory(...args),
  updateCategory: (...args) => getRepository().updateCategory(...args),
  deleteCategory: (...args) => getRepository().deleteCategory(...args),
};
