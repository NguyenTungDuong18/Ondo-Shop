import type { ProductRepository } from '../../domain/repositories/ProductRepository';

/** Application port; installed once by the composition root. */
let repository: ProductRepository | undefined;
export function configureProductRepository(adapter: ProductRepository) { repository = adapter; }
function getRepository(): ProductRepository {
  if (!repository) throw new Error('Product repository has not been configured');
  return repository;
}
export const createProductUseCases = (adapter: ProductRepository): ProductRepository => ({
  getProducts: (...args) => adapter.getProducts(...args),
  getProductById: (...args) => adapter.getProductById(...args),
  createProduct: (...args) => adapter.createProduct(...args),
  updateProduct: (...args) => adapter.updateProduct(...args),
  deleteProduct: (...args) => adapter.deleteProduct(...args),
  getStatistics: (...args) => adapter.getStatistics(...args),
});
export const productService: ProductRepository = {
  getProducts: (...args) => getRepository().getProducts(...args),
  getProductById: (...args) => getRepository().getProductById(...args),
  createProduct: (...args) => getRepository().createProduct(...args),
  updateProduct: (...args) => getRepository().updateProduct(...args),
  deleteProduct: (...args) => getRepository().deleteProduct(...args),
  getStatistics: (...args) => getRepository().getStatistics(...args),
};
