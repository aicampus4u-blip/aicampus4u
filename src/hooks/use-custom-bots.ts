'use client';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import type { CustomBot } from '@/types';
import { createCustomBot as createBotPersona } from '@/ai/flows/custom-bot-creation';
import { useToast } from './use-toast';
import { Bot as BotIcon } from 'lucide-react';
import { useAuth } from './use-auth';
import { useSubscription } from './use-subscription';
import { saveBotForUser } from '@/lib/bot-service'; // ✅ centralized service

const STORAGE_KEY = 'custom-ai-bots';

export function useCustomBots() {
  const [bots, setBots] = useState<CustomBot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { plan, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();

  // 🔹 Load bots from Firestore when user logs in
  useEffect(() => {
    async function fetchBots() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'bots'));
        const firestoreBots: CustomBot[] = snapshot.docs.map(doc => ({
          ...doc.data(),
          avatar: BotIcon,
        })) as CustomBot[];

        setBots(firestoreBots);

        // cache locally
        const storableBots = firestoreBots.map(({ avatar, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));
      } catch (error) {
        console.error('Error loading bots:', error);
        toast({
          title: 'Error',
          description: 'Could not load your bots from Firestore.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchBots();
  }, [user, toast]);

  // 🔹 Add a new bot — now uses centralized service
  const addBot = useCallback(
    async (botData: {
      name: string;
      description: string;
      type: 'field' | 'profession' | 'topic';
    }) => {
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to create a bot.',
          variant: 'destructive',
        });
        throw new Error('User not logged in');
      }

      try {
        // 1️⃣ Generate bot persona
        const personaResult = await createBotPersona({
          botType:
            botData.type.charAt(0).toUpperCase() + botData.type.slice(1) as
              | 'Field'
              | 'Profession'
              | 'Topic',
          field: botData.type === 'field' ? botData.name : undefined,
          profession:
            botData.type === 'profession' ? botData.name : undefined,
          topic: botData.type === 'topic' ? botData.name : undefined,
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

        // 2️⃣ Delegate Firestore saving + plan enforcement to service
        await saveBotForUser(user.uid, {
          ...newBot,
          avatar: undefined,
        });

        // 3️⃣ Update local state + storage
        const updatedBots = [...bots, newBot];
        setBots(updatedBots);
        const storableBots = updatedBots.map(({ avatar, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));

        toast({
          title: 'Bot Created',
          description: `${botData.name} has been created successfully!`,
        });

        return newBot;
      } catch (error: any) {
        console.error('Failed to create bot:', error);
        toast({
          title: 'Bot Creation Failed',
          description:
            error.message ||
            'There was an issue creating your bot. Please try again.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [bots, toast, user]
  );

  // 🔹 Delete bot (Firestore + local)
  const deleteBot = useCallback(
    async (botId: string) => {
      const newBots = bots.filter((bot) => bot.id !== botId);
      setBots(newBots);
      const storableBots = newBots.map(({ avatar, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));

      if (user) {
        await deleteDoc(doc(db, 'users', user.uid, 'bots', botId));
      }

      toast({
        title: 'Bot Deleted',
        description: 'Your custom bot has been successfully deleted.',
      });
    },
    [bots, toast, user]
  );

  return {
    bots,
    addBot,
    deleteBot,
    loading: loading || subscriptionLoading,
  };
}
