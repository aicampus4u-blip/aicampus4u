// /app/api/paystack/webhook/verify/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export async function POST(req: Request) {
  try {
    const { reference, userId } = await req.json();

    if (!reference || !userId) {
      return NextResponse.json(
        { error: "Missing reference or userId" },
        { status: 400 }
      );
    }

    // ✅ Verify payment with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (verifyRes.ok && verifyData.data?.status === "success") {
      // ✅ Use adminDb (server privilege)
      const subRef = adminDb.collection("subscriptions").doc(userId);

      await subRef.set(
        {
          plan: "Pro",
          status: "active",
          updatedAt: new Date().toISOString(),
          reference,
        },
        { merge: true }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Payment not verified", details: verifyData },
      { status: 400 }
    );
  } catch (error) {
    console.error("❌ Verification error:", error);
    return NextResponse.json(
      { error: "Verification failed", details: String(error) },
      { status: 500 }
    );
  }
}
