import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export interface SubscriptionStatus {
  status: "active" | "canceled" | "past_due" | "free";
  plan?: "Pro" | "Free" | string;
}

/**
 * Retrieves the current user's subscription status.
 * Checks the Firestore document at `/subscriptions/{userId}`.
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  if (!userId) return { status: "free", plan: "Free" };

  const subRef = doc(db, "subscriptions", userId);
  const subSnap = await getDoc(subRef);

  if (!subSnap.exists()) {
    return { status: "free", plan: "Free" };
  }

  const data = subSnap.data();
  return {
    status: (data.status as SubscriptionStatus["status"]) ?? "free",
    plan: data.plan ?? "Free",
    ...data,
  };
}
