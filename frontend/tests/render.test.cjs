require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToString } = require('react-dom/server');
const { MemoryRouter, Routes, Route } = require('react-router-dom');
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
const storage = new Map();
global.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
global.document = { documentElement: { classList: { add() {}, remove() {} } } };
const { useAuthStore } = require('../src/presentation/state/authStore.ts');
const { useCartStore } = require('../src/presentation/state/cartStore.ts');
const user = { id: 'u1', username: 'member', fullName: 'Test Member', email: 'member@example.test', role: 'Customer', createdAt: '2026-01-01' };
useAuthStore.setState({ user, isAuthenticated: true, isInitializing: false });
// SSR normally reads Zustand's creation snapshot. Supply explicit test state to controllers.
require('../src/presentation/state/authStore.ts').useAuthStore = selector => selector ? selector(useAuthStore.getState()) : useAuthStore.getState();
require('../src/presentation/state/cartStore.ts').useCartStore = selector => selector ? selector(useCartStore.getState()) : useCartStore.getState();
const product = { id: 'p1', sku: 'ABC', name: 'Test Object', description: 'Sample product', price: 100000, stockQuantity: 10, category: 'General', status: 'Active', createdAt: '2026-01-01' };
const order = { id: 'o1', orderNumber: 'ORDER-1', status: 'Pending', shippingName: 'Test Member', shippingPhone: '0901234567', shippingAddress: 'Test Street', totalAmount: 130000, shippingFee: 30000, discountAmount: 0, items: [{ id: 'i1', productName: product.name, productSku: product.sku, quantity: 1, unitPrice: product.price, subtotal: product.price }], createdAt: '2026-01-01' };
const pageFeatures = { Home: 'catalog', Shop: 'catalog', ProductDetail: 'catalog', Products: 'inventory', Dashboard: 'dashboard', Login: 'auth', Register: 'auth', VerifyOTP: 'auth', Profile: 'profile', Checkout: 'checkout', MyOrders: 'orders', OrderDetail: 'orders', ChatTest: 'chat', NotFound: 'errors' };
function createClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } } });
  const response = data => ({ success: true, data });
  const products = response({ items: [product], totalCount: 1, totalPages: 1, pageIndex: 1, pageSize: 8 });
  for (const params of [
    { pageIndex: 1, pageSize: 8, sortBy: 'createdAt', sortOrder: 'desc' },
    { pageIndex: 1, pageSize: 8, category: undefined, search: undefined, sortBy: 'createdAt', sortOrder: 'desc' },
    { search: undefined, category: undefined, pageIndex: 1, pageSize: 8 },
    { pageIndex: 1, pageSize: 50 },
  ]) client.setQueryData(['products', 'list', params], products);
  client.setQueryData(['categories', 'list', true], response([{ id: 'c1', name: 'General', slug: 'general', isActive: true }]));
  client.setQueryData(['products', 'detail', 'p1'], response(product));
  client.setQueryData(['orders', 'detail', 'o1'], response(order));
  client.setQueryData(['orders', 'my-orders', { pageIndex: 1, pageSize: 10 }], response({ items: [order], totalPages: 1, totalCount: 1 }));
  return client;
}
function renderPage(Page, name, client = createClient()) {
  const url = name === 'ProductDetail' ? '/product/p1' : name === 'OrderDetail' ? '/order/o1' : name === 'VerifyOTP' ? '/verify-otp?email=member@example.test' : '/';
  const route = name === 'ProductDetail' ? '/product/:id' : name === 'OrderDetail' ? '/order/:id' : '*';
  return renderToString(React.createElement(QueryClientProvider, { client }, React.createElement(MemoryRouter, { initialEntries: [url] }, React.createElement(Routes, null, React.createElement(Route, { path: route, element: React.createElement(Page) })))));
}
for (const [name, feature] of Object.entries(pageFeatures)) {
  test(`${name} page renders with its controller and representative cached data`, () => {
    const Page = require(`../src/presentation/features/${feature}/pages/${name}Page.tsx`)[name + 'Page'];
    const html = renderPage(Page, name);
    assert.ok(html.length > 100, `${name} rendered no content`);
    if (name === 'ProductDetail') assert.match(html, /Test Object/);
    if (name === 'OrderDetail') assert.match(html, /ORDER-1/);
    if (name === 'Profile') assert.match(html, /Test Member/);
    if (name === 'Login') assert.doesNotMatch(html, /Admin@123/);
  });
}
test('checkout renders shipping and totals for a populated cart', () => {
  useCartStore.setState({ items: [{ productId: product.id, productName: product.name, productSku: product.sku, unitPrice: product.price, quantity: 2, stockQuantity: 10 }] });
  const { CheckoutPage } = require('../src/presentation/features/checkout/pages/CheckoutPage.tsx');
  const html = renderPage(CheckoutPage, 'Checkout');
  assert.match(html, /SHIPPING INFORMATION/);
  assert.match(html, /Test Object/);
  assert.match(html, /230[.,]000/);
  useCartStore.setState({ items: [] });
});
test('product and order missing-data guards remain renderable', () => {
  for (const [name, feature] of [['ProductDetail', 'catalog'], ['OrderDetail', 'orders']]) {
    const client = createClient();
    client.setQueryData([name === 'ProductDetail' ? 'products' : 'orders', 'detail', name === 'ProductDetail' ? 'p1' : 'o1'], { success: false, data: null });
    const Page = require(`../src/presentation/features/${feature}/pages/${name}Page.tsx`)[name + 'Page'];
    assert.match(renderPage(Page, name, client), name === 'ProductDetail' ? /Nothing here yet/ : /ORDER NOT FOUND/);
  }
});

module.exports = { renderPage, pageFeatures, user };
