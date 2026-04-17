'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '@/types';
import { apiClient } from '@/api/api';
import { useEffect } from 'react';

type Ctx = { items: CartItem[]; loading: boolean; syncCart: (items: CartItem[]) => Promise<void>; clearCart: () => Promise<void> };
const CartContext = createContext<Ctx>({ items: [], loading: true, syncCart: async () => { }, clearCart: async () => { } });

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync from API on mount
  const fetchCart = async () => {
    try {
      const res = await apiClient.get('/cart');
      setItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchCart(); }, []);

  const syncCart = async (newItems: CartItem[]) => {
    try {
      await apiClient.post('/cart', { items: newItems });
      setItems(newItems);
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  const clearCart = async () => {
    try {
      await apiClient.delete('/cart');
      setItems([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  return <CartContext.Provider value={{ items, loading, syncCart, clearCart }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);