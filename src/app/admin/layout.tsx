import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-[calc(95vh-4rem)] bg-gray-100 flex">
        {/* <aside className="w-54 bg-white shadow-md pt-6 px-2 hidden md:block">
          <h1 className="text-xl font-bold mb-8 text-center">Admin Panel</h1>
          <nav className="space-y-2">
            <Link href="/" className="block px-4 py-2 rounded hover:bg-gray-100 text-gray-600 mt-8">
              Back to Store
            </Link>
          </nav>
        </aside> */}
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </AdminGuard>
  );
}