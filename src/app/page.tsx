'use client';

import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { api, apiClient } from '@/api/api';

export default function Home() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // const res = await apiClient.get<Product[]>('/products');
      const res = await api({
        endpoint: '/products',
        method: 'GET',
      })
      return res?.data;
    }
  });

  if (isLoading) {
    return (
      <div className='min-h-[80vh] flex justify-center items-center'>
        <p className="text-center mt-10 text-gray-500">Loading products...</p>
      </div>
    );
  }

  return (
    <section>
      {products.length === 0 ? (
        <p className="text-center mt-10">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
          {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  );
}