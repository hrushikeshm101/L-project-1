import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  const snapshot = await adminDb.collection('products').orderBy('createdAt', 'desc').get();
  return NextResponse.json(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  const ref = adminDb.collection('products').doc();
  await ref.set({ ...data, id: ref.id, createdAt: new Date().toISOString() });
  return NextResponse.json({ id: ref.id, ...data }, { status: 201 });
}