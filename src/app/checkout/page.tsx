'use client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useRouter } from 'next/navigation';
import { fetchAuth } from '@/lib/fetcher';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, clearCart } = useCart();
  const router = useRouter();

  if (authLoading) return <p>Loading...</p>;
  if (!user) return <p className="text-center mt-10 text-red-500">Please log in to checkout.</p>;

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleCheckout = async () => {
    const res = await fetchAuth('/api/checkout', { method: 'POST' });
    if (res.ok) {
      await clearCart();
      alert('Order placed successfully!');
      router.push('/');
    } else {
      alert('Checkout failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          {items.map(i => (
            <div key={i.productId} className="flex justify-between py-2 last:border-0 mb-2">
              <span>{i.title} <span className="text-muted-foreground">x{i.quantity}</span></span>
              <span>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-6 text-xl border-t pt-4">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-lg font-bold h-12">
            Place Order
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}