'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { CartItem } from '@/types';

export default function CartPage() {
  const { items, syncCart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [syncing, setSyncing] = useState<string | null>(null);

  // Loading state while checking auth/cart
  if (cartLoading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-500">
        <span className="animate-pulse">Loading cart...</span>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="text-center mt-16 bg-white p-12 rounded-xl shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link href="/" className="inline-block bg-neutral-600 text-white px-6 py-2.5 rounded-lg hover:bg-neutral-800 transition font-medium">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleQuantityChange = async (productId: string, delta: number) => {
    setSyncing(productId);
    const updated: CartItem[] = items.map(item =>
      item.productId === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    await syncCart(updated);
    setSyncing(null);
  };

  const handleRemove = async (productId: string) => {
    setSyncing(productId);
    const updated: CartItem[] = items.filter(item => item.productId !== productId);
    await syncCart(updated);
    setSyncing(null);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Shopping Cart ({items.length} items)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:shadow-md">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{item.title}</h3>
                <p className="text-gray-500 mt-1">${item.price.toFixed(2)} per item</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(item.productId, -1)}
                    disabled={syncing === item.productId || item.quantity <= 1}
                    className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-4 font-medium min-w-[2rem] text-center select-none">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.productId, 1)}
                    disabled={syncing === item.productId}
                    className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleRemove(item.productId)}
                  disabled={syncing === item.productId}
                  className="text-red-500 hover:text-red-700 font-medium text-sm disabled:opacity-50 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Order Summary</h2>
            <div className="space-y-3 text-gray-700">
              <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              disabled={!user || !!syncing}
              className="w-full mt-6 bg-neutral-600 text-white py-3 rounded-lg font-semibold hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {user ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>

            <div className="mt-4 text-center">
              <Link href="/" className="text-sm hover:bg-slate-600/40 px-4 py-2 rounded-lg underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}