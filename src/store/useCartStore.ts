import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  total: number;
  count: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      count: 0,

      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (existing) =>
            existing.productId === item.productId &&
            existing.variantId === item.variantId &&
            existing.size === item.size &&
            existing.color === item.color
        );

        let newItems;
        if (existingIndex >= 0) {
          newItems = [...items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + 1,
          };
        } else {
          newItems = [...items, { ...item, quantity: 1 }];
        }

        const total = newItems.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);
        const count = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

        set({ items: newItems, total, count });
      },

      removeItem: (id) => {
        const items = get().items.filter((item) => item.id !== id);
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ items, total, count });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const items = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ items, total, count });
      },

      clearCart: () => {
        set({ items: [], total: 0, count: 0 });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);