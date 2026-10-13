import type { CartItem } from '../models/order';
export const cartQuantity = (items: CartItem[]): number => items.reduce((sum, item) => sum + item.quantity, 0);
export const cartSubtotal = (items: CartItem[]): number => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
export function addCartItem(items: CartItem[], item: CartItem): CartItem[] {
  const existing = items.find(entry => entry.productId === item.productId);
  const quantity = Math.min((existing?.quantity ?? 0) + item.quantity, item.stockQuantity);
  if (quantity <= 0) return items;
  return existing ? items.map(entry => entry.productId === item.productId ? { ...entry, quantity } : entry) : [...items, { ...item, quantity }];
}
export function setCartQuantity(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return items.filter(item => item.productId !== productId);
  return items.map(item => item.productId === productId ? { ...item, quantity: Math.min(quantity, item.stockQuantity) } : item);
}
