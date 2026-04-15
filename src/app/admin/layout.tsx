import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-[calc(95vh-4rem)] bg-gray-100 flex">
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </AdminGuard>
  );
}