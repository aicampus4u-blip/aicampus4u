
'use client';
import { useState, useEffect, useCallback } from 'react';
import type { CustomBot } from '@/types';
import { createCustomBot as createBotPersona } from '@/ai/flows/custom-bot-creation';
import { useToast } from './use-toast';
import { Bot as BotIcon } from 'lucide-react';
import { useSubscription } from './use-subscription';

const STORAGE_KEY = 'custom-ai-bots';
const FREE_PLAN_BOT_LIMIT = 1;

export function useCustomBots() {
  const [bots, setBots] = useState<CustomBot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { plan, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    setLoading(true);
    try {
      const storedBots = localStorage.getItem(STORAGE_KEY);
      if (storedBots) {
        const parsedBots: CustomBot[] = JSON.parse(storedBots);
        // Add the avatar back in on the client
        const botsWithAvatars = parsedBots.map(b => ({ ...b, avatar: BotIcon }));
        setBots(botsWithAvatars);
      }
    } catch (error) {
      console.error('Failed to load custom bots from localStorage', error);
      toast({
        title: 'Error',
        description: 'Could not load your custom bots.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const botLimit = plan === 'Pro' ? Infinity : FREE_PLAN_BOT_LIMIT;

  const addBot = useCallback(
    async (botData: {
      name: string;
      description: string;
      type: 'field' | 'profession' | 'topic';
    }) => {
      if (bots.length >= botLimit) {
        toast({
            title: 'Upgrade to create more bots',
            description: 'You have reached the limit for the free plan.',
            variant: 'destructive'
        })
        throw new Error('Bot limit reached');
      }

      try {
        const personaResult = await createBotPersona({
          botType: botData.type.charAt(0).toUpperCase() + botData.type.slice(1) as 'Field' | 'Profession' | 'Topic',
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
          ]
        };

        const updatedBots = [...bots, newBot];
        setBots(updatedBots);
        // We need to remove the avatar component before storing in local storage
        const storableBots = updatedBots.map(({ avatar, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));
        return newBot;
      } catch (error) {
        console.error('Failed to create bot:', error);
        if ((error as Error).message !== 'Bot limit reached') {
            toast({
                title: 'Bot Creation Failed',
                description: 'There was an issue creating the bot. Please try again.',
                variant: 'destructive',
            });
        }
        throw error;
      }
    },
    [bots, botLimit, toast]
  );

  const deleteBot = useCallback(async (botId: string) => {
      const newBots = bots.filter(bot => bot.id !== botId);
      setBots(newBots);
      const storableBots = newBots.map(({ avatar, ...rest }) => rest);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storableBots));
      toast({
        title: 'Bot Deleted',
        description: 'Your custom bot has been successfully deleted.',
      });
    }, [bots, toast]
  );

  return { bots, addBot, deleteBot, loading: loading || subscriptionLoading, botLimit };
}
