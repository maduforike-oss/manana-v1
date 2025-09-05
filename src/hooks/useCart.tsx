import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  designId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  garmentType: string;
  creator: string;
  listingType: 'design-only' | 'print-design' | 'print-only';
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export function useCart() {
  const [cart, setCart] = useState<Cart>(() => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        total: parsed.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0),
        itemCount: parsed.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
      };
    }
    return { items: [], total: 0, itemCount: 0 };
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existingIndex = prev.items.findIndex(
        existing => existing.designId === item.designId && 
                   existing.size === item.size && 
                   existing.color === item.color
      );

      let newItems;
      if (existingIndex >= 0) {
        newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1
        };
      } else {
        newItems = [...prev.items, { ...item, quantity: 1 }];
      }

      const total = newItems.reduce((sum, cartItem) => sum + (cartItem.price * cartItem.quantity), 0);
      const itemCount = newItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);

      return { items: newItems, total, itemCount };
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const newItems = prev.items.filter(item => item.id !== id);
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return { items: newItems, total, itemCount };
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prev => {
      const newItems = prev.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      const total = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
      return { items: newItems, total, itemCount };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0, itemCount: 0 });
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };
}