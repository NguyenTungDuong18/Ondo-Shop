require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { addCartItem, setCartQuantity, cartQuantity, cartSubtotal } = require('../src/domain/policies/cart.ts');
const { calculateShippingFee } = require('../src/domain/policies/shipping.ts');
const { createTokenRefresher } = require('../src/infrastructure/auth/createTokenRefresher.ts');
const { createChatStreamParser } = require('../src/infrastructure/chat/streamParser.ts');
const { loginSchema } = require('../src/application/validation/loginSchema.ts');
const { productSchema } = require('../src/application/validation/productSchema.ts');

test('cart adds and merges within stock without mutating existing state', () => {
  const item = { productId: 'a', quantity: 2, stockQuantity: 3, unitPrice: 200000 };
  const original = [item];
  const merged = addCartItem(original, { ...item, quantity: 20 });
  assert.equal(merged[0].quantity, 3);
  assert.equal(original[0].quantity, 2);
  assert.equal(addCartItem([], { ...item, quantity: 20 })[0].quantity, 3);
  assert.deepEqual(addCartItem([], { ...item, stockQuantity: 0 }), []);
  assert.equal(cartQuantity(merged), 3);
  assert.equal(cartSubtotal(merged), 600000);
  assert.equal(setCartQuantity(merged, 'a', 10)[0].quantity, 3);
  assert.deepEqual(setCartQuantity(merged, 'a', 0), []);
});

test('shipping changes at the configured threshold', () => {
  const policy = { freeShippingThreshold: 500000, standardFee: 30000 };
  assert.equal(calculateShippingFee(499999, policy), 30000);
  assert.equal(calculateShippingFee(500000, policy), 0);
  assert.equal(calculateShippingFee(1, { freeShippingThreshold: 10, standardFee: 2 }), 2);
});

test('concurrent requests share refresh and can retry after rejection', async () => {
  let calls = 0, token = 'expired', shouldFail = true;
  const refresh = createTokenRefresher(async () => { calls++; if (shouldFail) throw new Error('expired cookie'); return 'new-token'; }, {
    getToken: () => token, setToken: next => { token = next; }, clearToken: () => { token = null; },
  });
  const first = refresh(), second = refresh();
  assert.equal(first, second);
  const results = await Promise.allSettled([first, second]);
  assert.ok(results.every(result => result.status === 'rejected'));
  assert.equal(calls, 1);
  assert.equal(token, null);
  shouldFail = false;
  assert.deepEqual(await Promise.all([refresh(), refresh()]), ['new-token', 'new-token']);
  assert.equal(calls, 2);
  assert.equal(token, 'new-token');
});

test('missing refresh token rejects all callers and clears stale session', async () => {
  let cleared = false;
  const refresh = createTokenRefresher(async () => '', { getToken: () => 'old', setToken: () => assert.fail(), clearToken: () => { cleared = true; } });
  await assert.rejects(refresh(), /did not contain/);
  assert.ok(cleared);
});

test('AI stream handles split lines, CRLF, malformed products and final unterminated data', () => {
  const text = [], products = [];
  const parser = createChatStreamParser({ onText: value => text.push(value), onProducts: value => products.push(value) });
  parser.push('data: Hel');
  parser.push('lo\r\ndata: [PRODUCTS]:[{"id":"a"}]\ndata: [PRODUCTS]:oops\n');
  parser.push('data: [DONE]\ndata: world');
  parser.finish();
  assert.deepEqual(text, ['Hello', 'world']);
  assert.deepEqual(products, [[{ id: 'a' }]]);
});

test('extracted form validation rejects blank credentials and negative prices', () => {
  assert.equal(loginSchema.safeParse({ usernameOrEmail: '', password: '' }).success, false);
  assert.equal(loginSchema.safeParse({ usernameOrEmail: 'member', password: 'secret' }).success, true);
  assert.equal(productSchema.safeParse({ sku: 'ABC', name: 'Product', description: 'Description', price: -1, stockQuantity: 1, category: 'General', status: 'Active' }).success, false);
});
