// /app/api/paystack/webhook/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !PAYSTACK_SECRET) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    // ✅ Verify the signature to ensure it's from Paystack
    const hash = crypto.createHmac("sha512", PAYSTACK_SECRET).update(rawBody).digest("hex");
    if (hash !== signature) {
      console.warn("Invalid Paystack webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log("✅ Paystack webhook event:", event.event);

    // ⚙️ Handle only successful payments
    if (event.event === "charge.success") {
      const email = event.data.customer.email;
      const userId = event.data.metadata?.userId; // Include this when initializing payment

      if (!userId) {
        console.warn("⚠️ Webhook received without userId in metadata");
        return NextResponse.json({ message: "Missing userId" }, { status: 200 });
      }

      const subRef = doc(db, "subscriptions", userId);
      await setDoc(
        subRef,
        {
          plan: "Pro",
          status: "active",
          updatedAt: new Date().toISOString(),
          reference: event.data.reference,
          amount: event.data.amount,
          email,
        },
        { merge: true }
      );

      console.log(`✅ Subscription upgraded for user ${userId}`);
    }

    // ✅ Respond to Paystack that we received the webhook
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error handling Paystack webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
