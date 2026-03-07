'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

export interface CartItem {
  id: string;
  title: string;
  price: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // Dynamic key to tie carts to specific users so they persist securely
  const getStorageKey = () => user ? `imdb_cart_${user.id}` : 'imdb_cart_guest';

  // Load initial cart from local storage when user state evaluates
  useEffect(() => {
    const savedCart = localStorage.getItem(getStorageKey());
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart([]);
    }
  }, [user]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      // Prevent duplicates
      if (prev.find(i => i.id === item.id)) return prev;
      const newCart = [...prev, item];
      localStorage.setItem(getStorageKey(), JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const newCart = prev.filter(i => i.id !== id);
      localStorage.setItem(getStorageKey(), JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(getStorageKey());
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
