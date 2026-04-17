'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, loading } = useAdminAuth();

  if (loading) return <div className="p-10 text-center text-gray-500">Verifying permissions...</div>;
  if (!isAuthorized) return null;

  return (
    <div className="min-h-[calc(95vh-4rem)] bg-gray-100/80 w-full">
      <main className="flex-1 p-6 md:px-45">{children}</main>
    </div>
  );
}