'use client';
import { useCart } from '@/components/providers/CartProvider';
import { Product, CartItem } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProductCard({ product }: { product: Product }) {
  const { items, syncCart } = useCart();

  const addToCart = () => {
    const existing = items.find(i => i.productId === product.id);
    const newItems: CartItem[] = existing
      ? items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...items, { productId: product.id, title: product.title, price: product.price, quantity: 1, }];
    syncCart(newItems);
  };

  return (
    <Card className="hover:shadow-md transition overflow-hidden">
      <CardHeader className="p-0 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={"https://placehold.net/600x800.png"} alt={product.title} className="w-full h-36 object-cover" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className='flex justify-between items-baseline mb-2'>
          <h3 className="font-semibold text-lg truncate max-w-[70%]">{product.title}</h3>
          <span className="bg-neutral-100 text-neutral-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{product.category}</span>
        </div>
        <p className="text-muted-foreground mt-1 truncate text-sm">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <span className="text-xl font-bold">${product.price.toFixed(2)}</span>
        <Button onClick={addToCart} size="sm" className="bg-neutral-900/80">
          Add to Cart
        </Button>
      </CardFooter>
    </Card >
  );
}