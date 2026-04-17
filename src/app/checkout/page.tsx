'use client';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCart } from '@/components/providers/CartProvider';
import { useRouter } from 'next/navigation';
import { fetchAuth } from '@/lib/fetcher';

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
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {items.map(i => (
        <div key={i.productId} className="flex justify-between py-2 border-b border-gray-200">
          <span>{i.title} x{i.quantity}</span>
          <span>${(i.price * i.quantity).toFixed(2)}</span>
        </div>
      ))}
      <div className="flex justify-between font-bold mt-4 text-xl">
        <span>Total</span><span>${total.toFixed(2)}</span>
      </div>
      <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-3 rounded mt-6 hover:bg-green-700">
        Place Order
      </button>
    </div>
  );
}