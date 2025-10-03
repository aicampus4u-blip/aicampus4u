'use client';
import { useRef, useEffect } from 'react';
import type { Message, AnyBot } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';

interface ChatListProps {
  messages: Message[];
  bot: AnyBot;
  isLoading: boolean;
}

export function ChatList({ messages, bot, isLoading }: ChatListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);

  return (
    <ScrollArea className="h-full" ref={scrollAreaRef}>
      <div className="p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} bot={bot} />
        ))}
        {isLoading && (
            <div className="flex items-start gap-4 p-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
            </div>
        )}
      </div>
    </ScrollArea>
  );
}
