'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from '@/types';
import { fetchAuth } from '@/lib/fetcher';
import { useEffect } from 'react';

type Ctx = { items: CartItem[]; loading: boolean; syncCart: (items: CartItem[]) => Promise<void>; clearCart: () => Promise<void> };
const CartContext = createContext<Ctx>({ items: [], loading: true, syncCart: async()=>{}, clearCart: async()=>{} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync from API on mount
  const fetchCart = async () => {
    try {
      const res = await fetchAuth('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchCart(); }, []);

  const syncCart = async (newItems: CartItem[]) => {
    await fetchAuth('/api/cart', { method: 'POST', body: JSON.stringify({ items: newItems }) });
    setItems(newItems);
  };

  const clearCart = async () => {
    await fetchAuth('/api/cart', { method: 'DELETE' });
    setItems([]);
  };

  return <CartContext.Provider value={{ items, loading, syncCart, clearCart }}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);