import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // firebase file location
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

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
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

  return {
    plan: subscription?.plan ?? "Free",
    status: subscription?.status ?? "inactive",
    loading,
  };
}
