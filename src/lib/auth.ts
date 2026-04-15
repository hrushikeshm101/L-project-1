import { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function verifyAuth(req: NextRequest) {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try { return await adminAuth.verifyIdToken(header.split(' ')[1]); } catch { return null; }
}

export async function verifyAdmin(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return null;

  // Check Firestore user profile for admin role
  const userDoc = await adminDb.collection('users').doc(user.uid).get();
  if (!userDoc.exists || userDoc.data()?.role !== 'admin') return null;
  return user;
}