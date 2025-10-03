'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { AnyBot, Message } from '@/types';
import { ChatList } from './chat-list';
import { ChatInput } from './chat-input';
import { answerGeneralKnowledgeQuestion } from '@/ai/flows/general-knowledge-bot';
import { fieldAIBot } from '@/ai/flows/field-ai-bot';
import { professionAIBot } from '@/ai/flows/profession-ai-bot';
import { topicAIBot } from '@/ai/flows/topic-ai-bot';
import { useToast } from '@/hooks/use-toast';
import { Bot as BotIcon } from 'lucide-react';

export function ChatView({ bot }: { bot: AnyBot }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let responseContent: string | undefined;

    try {
      if (bot.type === 'general') {
        const result = await answerGeneralKnowledgeQuestion({ query: content });
        responseContent = result.answer;
      } else if (bot.type === 'field') {
        const result = await fieldAIBot({ field: bot.name, query: content });
        responseContent = result.response;
      } else if (bot.type === 'profession') {
        const result = await professionAIBot({
          profession: bot.name,
          query: content,
        });
        responseContent = result.response;
      } else if (bot.type === 'topic') {
        const result = await topicAIBot({
          topic: bot.name,
          query: content,
        });
        responseContent = result.response;
      }
    } catch (e) {
      console.error(e);
      toast({
        title: 'An error occurred',
        description:
          'There was a problem communicating with the AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (responseContent) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: responseContent,
          createdAt: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    }
  };

  const startConversation = (starter: string) => {
    if (!isLoading) {
      handleSend(starter);
    }
  }

  const BotAvatar = bot.isCustom ? BotIcon : bot.avatar;

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
          {BotAvatar && <BotAvatar className="h-16 w-16 text-muted-foreground" />}
          <h2 className="text-2xl font-bold">{bot.name}</h2>
          <p className="max-w-md text-muted-foreground">{bot.description}</p>
          {bot.conversationStarters && bot.conversationStarters.length > 0 && (
             <div className="mt-8 w-full max-w-lg">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Conversation Starters</h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {bot.conversationStarters.map((starter, i) => (
                        <Card key={i} className="cursor-pointer text-left transition-colors hover:bg-muted" onClick={() => startConversation(starter)}>
                            <CardContent className="p-3">
                                <p className="text-sm">{starter}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             </div>
          )}
        </div>
      ) : (
        <ChatList messages={messages} bot={bot} isLoading={isLoading} />
      )}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
