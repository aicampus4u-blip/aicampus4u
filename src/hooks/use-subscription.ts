import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";

export interface SubscriptionData {
  plan: "Free" | "Pro";
  status: "active" | "inactive";
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription({ plan: "Free", status: "inactive" });
        setLoading(false);
        return;
      }

      try {
        const subRef = doc(db, "subscriptions", user.uid);
        const subSnap = await getDoc(subRef);

        if (subSnap.exists()) {
          setSubscription(subSnap.data() as SubscriptionData);
        } else {
          setSubscription({ plan: "Free", status: "inactive" });
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription({ plan: "Free", status: "inactive" });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // ✅ Add this function to allow plan updates (locally + Firestore)
  const setPlan = async (newPlan: "Free" | "Pro") => {
    if (!user) return;

    const newData: SubscriptionData = {
      plan: newPlan,
      status: newPlan === "Pro" ? "active" : "inactive",
      startDate: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, "subscriptions", user.uid), newData, { merge: true });
      setSubscription(newData);
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  return {
    plan: subscription?.plan ?? "Free",
    status: subscription?.status ?? "inactive",
    loading,
    setPlan, // ✅ now available in your component
  };
}
