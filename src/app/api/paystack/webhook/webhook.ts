// /app/api/paystack/webhook/route.ts  ✅ use route.ts for Next.js 13+/App Router

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Only process successful Paystack payments
    if (body?.event === 'charge.success') {
      const email = body?.data?.customer?.email;
      if (!email) {
        console.error('No email in webhook payload');
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      // Find user in Firestore by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn(`No user found with email: ${email}`);
      }

      for (const docSnap of snapshot.docs) {
        await updateDoc(docSnap.ref, {
          subscription: {
            plan: 'pro',
            status: 'active',
            updatedAt: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ ignored: true }); // Ignore other Paystack events
  } catch (error) {
    console.error('Paystack webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
