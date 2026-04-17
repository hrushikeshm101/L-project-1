import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic'; // Ensures fresh data per request, or we can use revalidation.

export default async function Home() {
  let products: Product[] = [];
  
  try {
    const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
    products = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
  } catch (err) {
    console.error('Failed to fetch products from Firestore:', err);
  }

  return (
    <section>
       {products.length === 0 ? (
           <p className="text-center mt-10">No products available.</p>
       ) : (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
           {products.map(p => <ProductCard key={p.id} product={p} />)}
         </div>
       )}
    </section>
  );
}