import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const doc = await adminDb.collection('carts').doc(user.uid).get();
  return NextResponse.json(doc.exists ? doc.data() : { items: [] });
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { items } = await req.json();
  await adminDb.collection('carts').doc(user.uid).set({ items, updatedAt: new Date() }, { merge: true });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await adminDb.collection('carts').doc(user.uid).delete();
  return NextResponse.json({ success: true });
}