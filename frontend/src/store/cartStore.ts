import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types/order';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            const newQty = existing.quantity + item.quantity;
            // Don't exceed stock
            const cappedQty = Math.min(newQty, item.stockQuantity);
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: cappedQty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId === productId) {
              const cappedQty = Math.min(quantity, i.stockQuantity);
              return { ...i, quantity: cappedQty };
            }
            return i;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    }),
    {
      name: 'mysystem-cart',
    }
  )
);
