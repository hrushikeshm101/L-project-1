'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/providers/CartProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { CartItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <div className="flex justify-center mt-16 px-4">
        <Card className="w-full max-w-2xl text-center border-none shadow-sm py-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Your cart is empty</CardTitle>
            <p className="text-muted-foreground mt-2">Looks like you haven't added anything yet.</p>
          </CardHeader>
          <CardContent>
            <Link href="/" className="inline-block mt-4">
              <Button size="lg">Continue Shopping</Button>
            </Link>
          </CardContent>
        </Card>
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
        <div className="lg:col-span-2 space-y-2">
          {items.map((item) => (
            <Card key={item.productId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between transition hover:shadow-md shadow-sm border-gray-100">
              <CardContent className="flex-1 p-4 sm:p-3 shrink-0 min-w-[50%]">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{item.title}</h3>
                <p className="text-muted-foreground mt-1">${item.price.toFixed(2)} per item</p>
              </CardContent>

              <div className="flex items-center gap-4 p-4 sm:p-6 pt-2 sm:pl-0 w-full sm:w-auto sm:justify-end">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden shrink-0">
                  <button
                    onClick={() => handleQuantityChange(item.productId, -1)}
                    disabled={syncing === item.productId || item.quantity <= 1}
                    className="px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition "
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

                <Button
                  variant="ghost"
                  onClick={() => handleRemove(item.productId)}
                  disabled={syncing === item.productId}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="border-t pt-3 flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                onClick={() => router.push('/checkout')}
                disabled={!user || !!syncing}
                className="w-full"
                size="lg"
              >
                {user ? 'Proceed to Checkout' : 'Login to Checkout'}
              </Button>

              <Link href="/" className="text-sm text-center hover:opacity-80 underline underline-offset-4">
                Continue Shopping
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}