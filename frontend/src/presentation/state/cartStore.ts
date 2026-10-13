import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../../domain/models/order';
import { addCartItem, cartQuantity, cartSubtotal, setCartQuantity } from '../../domain/policies/cart';

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

      addItem: item => set(state => ({ items: addCartItem(state.items, item) })),

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => set(state => ({ items: setCartQuantity(state.items, productId, quantity) })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      totalItems: () => cartQuantity(get().items),
      totalAmount: () => cartSubtotal(get().items),
    }),
    {
      name: 'mysystem-cart',
    }
  )
);
