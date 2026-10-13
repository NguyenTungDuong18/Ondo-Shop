import type { OrderRepository } from '../../domain/repositories/OrderRepository';

/** Application port; installed once by the composition root. */
let repository: OrderRepository | undefined;
export function configureOrderRepository(adapter: OrderRepository) { repository = adapter; }
function getRepository(): OrderRepository {
  if (!repository) throw new Error('Order repository has not been configured');
  return repository;
}
export const createOrderUseCases = (adapter: OrderRepository): OrderRepository => ({
  getOrders: (...args) => adapter.getOrders(...args),
  getOrderById: (...args) => adapter.getOrderById(...args),
  getMyOrders: (...args) => adapter.getMyOrders(...args),
  createOrder: (...args) => adapter.createOrder(...args),
  updateOrderStatus: (...args) => adapter.updateOrderStatus(...args),
});
export const orderService: OrderRepository = {
  getOrders: (...args) => getRepository().getOrders(...args),
  getOrderById: (...args) => getRepository().getOrderById(...args),
  getMyOrders: (...args) => getRepository().getMyOrders(...args),
  createOrder: (...args) => getRepository().createOrder(...args),
  updateOrderStatus: (...args) => getRepository().updateOrderStatus(...args),
};
