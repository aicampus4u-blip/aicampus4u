'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChatView } from '@/components/chat-view';
import { useCustomBots } from '@/hooks/use-custom-bots';
import {
  ALL_FEATURED_BOTS,
  GENERAL_KNOWLEDGE_BOT,
} from '@/lib/bots';
import type { AnyBot } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

function BotLoadingSkeleton() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-80" />
            <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    )
}


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string[] | undefined;
  const { bots: customBots, loading: customBotsLoading } = useCustomBots();
  const [currentBot, setCurrentBot] = useState<AnyBot | null | undefined>(
    undefined
  );

  useEffect(() => {
    const [type, id] = slug || [];
    let bot: AnyBot | undefined;
    
    if (customBotsLoading) return;
    
    if (!type) {
      bot = GENERAL_KNOWLEDGE_BOT;
    } else if (type === 'custom') {
      bot = customBots.find((b) => b.id === id);
    } else {
      const searchId = slug?.length === 1 ? type : id;
      const searchType = slug?.length === 1 ? 'general' : type;

      if(searchId === 'knowledge' && searchType === 'general') {
        bot = GENERAL_KNOWLEDGE_BOT
      } else {
        bot = ALL_FEATURED_BOTS.find((b) => b.type === searchType && b.id === searchId);
      }
    }
    
    if (slug && !bot) {
      // If a slug was provided but no bot was found, redirect to default
      router.replace('/chat/general/knowledge');
    } else {
      setCurrentBot(bot);
    }
  }, [slug, customBots, customBotsLoading, router]);

  if (currentBot === undefined || customBotsLoading) {
    return <BotLoadingSkeleton />;
  }

  if (!currentBot) {
    // This case should be handled by the redirect, but as a fallback
    return <div>Bot not found.</div>;
  }

  return <ChatView bot={currentBot} />;
}
