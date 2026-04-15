'use client';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { NextResponse } from 'next/server';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) return NextResponse.json({ error: 'Failed to fetch products' }, { status: res.status });
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return (<div className=' min-h-[80vh] flex justify-center items-center'>
    <p className="text-center mt-10">
      Loading products...</p>
    </div>);

  return (
    <section>
       {(products.length === 0)
       ?
           <p className="text-center mt-10">No products available.</p>
        :
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>}
    </section>
  );
}