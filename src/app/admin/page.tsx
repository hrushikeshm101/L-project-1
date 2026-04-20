'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiClient } from '@/api/api';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type ProductFormData = {
  title: string;
  price: number;
  description: string;
  category: string;
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<ProductFormData>();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await apiClient.get<Product[]>('/products');
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: ProductFormData) => {
      if (editingId) {
        // return apiClient.put(`/products/${editingId}`, payload);
        return api({
          endpoint: `/products/${editingId}`,
          method: 'PUT',
          data: payload
        });
      }
      // return apiClient.post('/products', payload);
      return api({
        endpoint: '/products',
        method: 'POST',
        data: payload
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setEditingId(null);
      reset();
    },
    onError: () => alert('Failed to save product'),
  });

  const deleteMutation = useMutation({
    // mutationFn: async (id: string) => apiClient.delete(`/products/${id}`),
    mutationFn: async (id: string) => api({
      endpoint: `/products/${id}`,
      method: 'DELETE',
    }),
    onError: () => alert('Failed to delete product'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setProductToDelete(null);
    },
  });

  const onSubmit = (data: ProductFormData) => {
    saveMutation.mutate({ ...data, price: parseFloat(data.price.toString()) });
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setValue('title', p.title);
    setValue('price', p.price);
    setValue('description', p.description);
    setValue('category', p.category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete);
    }
  };

  const handleOpenAddModal = () => {
    setIsModalOpen(true);
    setEditingId(null);
    reset({ title: '', price: 0, description: '', category: '' });
  };

  return (
    <div className="w-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <Button onClick={handleOpenAddModal}>
          Add Product
        </Button>
      </div>

      {isLoading ? <p className="text-gray-500">Loading products...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden md:w-full w-[89vw]">
          <ScrollArea className="rounded-md border h-auto w-full">
          <Table>
            <TableHeader>
              <TableRow className='p-4'>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-6">No products found</TableCell></TableRow>
              ) : products.map((p: Product) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="text-gray-600"><Badge className='bg-gray-600'>{p.category}</Badge></TableCell>
                  <TableCell>${p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-gray-500">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="space-x-3 flex">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
              </ScrollArea>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input required placeholder="Product Title" {...register('title', { required: true })} />
            <div className="grid grid-cols-2 gap-4">
              <Input required type="number" step="0.50" placeholder="Price" min="0" {...register('price', { required: true, min: 0, valueAsNumber: true })} />
              <Input required placeholder="Category" {...register('category', { required: true })} />
            </div>
            <textarea required placeholder="Description" rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...register('description', { required: true })} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="py-4 text-gray-600">Are you sure you want to delete this product? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductToDelete(null)} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}