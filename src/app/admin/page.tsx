'use client';
import { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { fetchAuth } from '@/lib/fetcher';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', price: '', description: '', category: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, price: parseFloat(formData.price) };

    let res;
    if (editingId) {
      res = await fetchAuth(`/api/products/${editingId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      res = await fetchAuth('/api/products', { method: 'POST', body: JSON.stringify(payload) });
    }

    if (res.ok) {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ title: '', price: '', description: '', category: '' });
      fetchProducts();
    } else {
      alert('Failed to save product');
    }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setFormData({ title: p.title, price: p.price.toString(), description: p.description, category: p.category });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    const res = await fetchAuth(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) fetchProducts();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData({ title: '', price: '', description: '', category: '' }); }}
          className="bg-neutral-600 text-white px-2 py-1 rounded hover:bg-neutral-700 transition shadow">
          Add Product
        </button>
      </div>

      {loading ? <p className="text-gray-500">Loading products...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-medium text-gray-600">Title</th>
                  <th className="p-4 font-medium text-gray-600">Category</th>
                  <th className="p-4 font-medium text-gray-600">Price</th>
                  <th className="p-4 font-medium text-gray-600">Added</th>
                  <th className="p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className='p-3'>
                {products.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">No products found</td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-200/50  ">
                    <td className="p-4 font-medium">{p.title}</td>
                    <td className="p-4 text-gray-600">{p.category}</td>
                    <td className="p-4">${p.price.toFixed(2)}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4  space-x-3 flex ">
                      <button onClick={() => handleEdit(p)} className="text-neutral-600 hover:text-neutral-800 font-medium px-2.5 py-1 rounded-lg bg-neutral-200"><Pencil className='h-5 w-5' /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-800 hover:text-red-600 font-medium px-2.5 py-1 rounded-lg bg-neutral-200"><Trash2 className='w-5 h-6'/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Product Title" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-neutral-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" step="0.01" placeholder="Price" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-neutral-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <input required placeholder="Category" className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-neutral-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <textarea required placeholder="Description" rows={3} className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-neutral-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}