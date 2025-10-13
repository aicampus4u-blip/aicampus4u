"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/firebase";
import { getDocs, collection, deleteDoc, doc } from "firebase/firestore";
import type { CustomBot } from "@/types";
import { createCustomBot as createBotPersona } from "@/ai/flows/custom-bot-creation";
import { useToast } from "./use-toast";
import { Bot as BotIcon } from "lucide-react";
import { useAuth } from "./use-auth";
import { useSubscription } from "./use-subscription";
import { saveBotForUser } from "@/lib/bot-service"; // ✅ centralized service

import { useRouter } from "next/navigation";
import { onSnapshot } from "firebase/firestore";

const STORAGE_KEY = "custom-ai-bots";

export function useCustomBots() {
  const [bots, setBots] = useState<CustomBot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { plan, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();

  const router = useRouter();

  // // 🔹 Load bots from Firestore when user logs in
  // useEffect(() => {
  //   async function fetchBots() {
  //     if (!user) {
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const snapshot = await getDocs(collection(db, 'users', user.uid, 'bots'));
  //       const firestoreBots: CustomBot[] = snapshot.docs.map(doc => ({
  //         ...doc.data(),
  //         avatar: BotIcon,
  //       })) as CustomBot[];

  //       setBots(firestoreBots);

  //       // cache locally
  //       const storableBots = firestoreBots.map(({ avatar, ...rest }) => rest);
  //       localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));
  //     } catch (error) {
  //       console.error('Error loading bots:', error);
  //       toast({
  //         title: 'Error',
  //         description: 'Could not load your bots from Firestore.',
  //         variant: 'destructive',
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   fetchBots();
  // }, [user, toast]);

  // 🔹 Real-time sync with Firestore
  useEffect(() => {
    if (!user) {
      setBots([]);
      setLoading(false);
      return;
    }

    const botsRef = collection(db, "users", user.uid, "bots");

    const unsubscribe = onSnapshot(
      botsRef,
      (snapshot) => {
        const firestoreBots: CustomBot[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Partial<CustomBot>;
          return {
            id: doc.id,
            name: data.name || "Unnamed Bot",
            description: data.description || "",
            type: data.type || "field",
            isCustom: data.isCustom ?? true,
            createdAt: data.createdAt || new Date().toISOString(),
            persona: typeof data.persona === "string" ? data.persona : "",
            conversationStarters: data.conversationStarters || [],
            avatar: BotIcon,
          };
        });

        setBots(firestoreBots);

        // Cache locally
        const storableBots = firestoreBots.map(({ avatar, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));

        setLoading(false);
      },
      (error) => {
        console.error("Error syncing bots:", error);
        toast({
          title: "Error",
          description: "Could not sync your bots from Firestore.",
          variant: "destructive",
        });
        setLoading(false);
      }
    );

    // Cleanup listener when user logs out or component unmounts
    return () => unsubscribe();
  }, [user, toast]);

  // 🔹 Add a new bot
  const addBot = useCallback(
    async (botData: {
      name: string;
      description: string;
      type: "field" | "profession" | "topic";
    }) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a bot.",
          variant: "destructive",
        });
        throw new Error("User not logged in");
      }

      try {
        // 1️⃣ Generate bot persona
        const personaResult = await createBotPersona({
          botType: (botData.type.charAt(0).toUpperCase() +
            botData.type.slice(1)) as "Field" | "Profession" | "Topic",
          field: botData.type === "field" ? botData.name : undefined,
          profession: botData.type === "profession" ? botData.name : undefined,
          topic: botData.type === "topic" ? botData.name : undefined,
          description: botData.description,
        });

        const newBot: CustomBot = {
          id: crypto.randomUUID(),
          ...botData,
          isCustom: true,
          createdAt: new Date().toISOString(),
          persona: personaResult.persona,
          avatar: BotIcon,
          conversationStarters: [
            `Let's get started with ${botData.name}.`,
            `Tell me something interesting about ${botData.name}.`,
            `How does ${botData.name} relate to other fields?`,
          ],
        };

        // 2️⃣ Save to Firestore
        const { avatar, ...storableBot } = newBot;
        await saveBotForUser(user.uid, storableBot);

        // 3️⃣ Re-fetch bots from Firestore (authoritative source)
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "bots")
        );
        const refreshedBots: CustomBot[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
          avatar: BotIcon,
        }));

        // 4️⃣ Update local state + cache
        setBots(refreshedBots);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(refreshedBots.map(({ avatar, ...rest }) => rest))
        );

        toast({
          title: "Bot Created",
          description: `${botData.name} has been created successfully!`,
        });

        // ✅ Navigate to the new bot’s chat page (adjust path if needed)
        router.push(`/chat/${newBot.id}`);

        return newBot;
      } catch (error: any) {
        console.error("Failed to create bot:", error);
        toast({
          title: "Bot Creation Failed",
          description:
            error.message ||
            "There was an issue creating your bot. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    [bots, toast, user]
  );

  // 🔹 Delete bot
  const deleteBot = useCallback(
    async (botId: string) => {
      if (!user) return;

      try {
        await deleteDoc(doc(db, "users", user.uid, "bots", botId));

        // ✅ Re-fetch bots from Firestore again
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "bots")
        );
        const refreshedBots: CustomBot[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
          avatar: BotIcon,
        }));

        setBots(refreshedBots);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(refreshedBots.map(({ avatar, ...rest }) => rest))
        );

        toast({
          title: "Bot Deleted",
          description: "Your custom bot has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting bot:", error);
        toast({
          title: "Error",
          description: "Failed to delete bot. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, toast]
  );

  return {
    bots,
    addBot,
    deleteBot,
    loading: loading || subscriptionLoading,
  };
}
