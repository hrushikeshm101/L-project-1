'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { useQuery } from '@tanstack/react-query';

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const { data: isAuthorized, isLoading: isRoleLoading } = useQuery({
    queryKey: ['adminRole', user?.uid],
    queryFn: async () => {
      if (!user) return false;
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      return docSnap.exists() && docSnap.data()?.role === 'admin';
    },
    enabled: !!user,
  });

  const loading = authLoading || (!!user && isRoleLoading);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
    } else if (isAuthorized === false) {
      router.push('/');
    }
  }, [user, isAuthorized, loading, router]);

  return { isAuthorized: !!isAuthorized, loading };
}
