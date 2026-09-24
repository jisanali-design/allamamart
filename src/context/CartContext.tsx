import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem } from '../types';
import { soundFx } from '../utils/sound';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: FoodItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  getItemQuantity: (itemId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('allama_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('allama_cart', JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const addToCart = (item: FoodItem, qty: number = 1) => {
    if (item.inStock === false) {
      return;
    }
    setItems(prev => {
      const existingIndex = prev.findIndex(i => i.item.id === item.id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      } else {
        return [...prev, { item, quantity: qty }];
      }
    });
    soundFx.playPop();
  };

  const removeFromCart = (itemId: string) => {
    setItems(prev => prev.filter(i => i.item.id !== itemId));
    soundFx.playPop();
  };

  const updateQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems(prev => prev.map(i => i.item.id === itemId ? { ...i, quantity: qty } : i));
    soundFx.playPop();
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string): number => {
    const found = items.find(i => i.item.id === itemId);
    return found ? found.quantity : 0;
  };

  const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      isCartDrawerOpen,
      setIsCartDrawerOpen,
      isCheckoutModalOpen,
      setIsCheckoutModalOpen,
      getItemQuantity,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
