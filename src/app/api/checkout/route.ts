import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const cartRef = adminDb.collection('carts').doc(user.uid);
  const cartDoc = await cartRef.get();

  if (!cartDoc.exists || !cartDoc.data()?.items?.length) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
  }

  const items = cartDoc.data()?.items;
  const total = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);

  const orderRef = adminDb.collection('orders').doc();

  try {
    await adminDb.runTransaction(async (t) => {
      t.set(orderRef, {
        userId: user.uid,
        items,
        total,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      t.delete(cartRef);
    });
    return NextResponse.json({ success: true, orderId: orderRef.id });
  } catch (err) {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}