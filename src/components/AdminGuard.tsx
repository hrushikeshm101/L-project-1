'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push('/login'); return; }

    const checkRole = async () => {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists() && docSnap.data()?.role === 'admin') {
        setAuthorized(true);
      } else {
        router.push('/'); // Redirect non-admins to store
      }
    };
    checkRole();
  }, [user, loading, router]);

  if (loading || authorized === null) return <div className="p-10 text-center text-gray-500">Verifying permissions...</div>;
  if (!authorized) return null;

  return <>{children}</>;
}