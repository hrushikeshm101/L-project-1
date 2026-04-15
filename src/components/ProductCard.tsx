'use client';
import { useCart } from '@/components/CartProvider';
import { Product, CartItem } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  const { items, syncCart } = useCart();

  const addToCart = () => {
    const existing = items.find(i => i.productId === product.id);
    const newItems: CartItem[] = existing
      ? items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...items, { productId: product.id, title: product.title, price: product.price, quantity: 1 }];
    syncCart(newItems);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
      <img src={"https://placehold.net/600x800.png"} alt={product.title} className="w-full h-36 object-cover rounded mb-3" />
      <div className='flex justify-between pr-3 items-baseline'>
        <h3 className="font-semibold text-lg">{product.title}</h3>
        <span className="bg-neutral-400/40 text-neutral-800 text-xs font-medium px-3.5 py-1 rounded-xl ">{product.category}</span>
      </div>
      <p className="text-gray-700 mt-2 truncate">{product.description}</p>
      <div className="flex justify-between items-center mt-4">
        <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
        <button onClick={addToCart} className="bg-neutral-600 text-white px-3 py-1 rounded hover:bg-neutral-800">
          Add to Cart
        </button>
      </div>
    </div>
  );
}