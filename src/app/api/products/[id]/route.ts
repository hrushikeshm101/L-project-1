import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  const data = await req.json();
  
  await adminDb.collection('products').doc(id).update({
    ...data,
    updatedAt: new Date().toISOString()
  });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await adminDb.collection('products').doc(id).delete();
  return NextResponse.json({ success: true });
}