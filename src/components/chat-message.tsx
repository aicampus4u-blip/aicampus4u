import type { Message, AnyBot } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot as BotIcon } from 'lucide-react';

export function ChatMessage({ message, bot }: { message: Message; bot: AnyBot }) {
  const isUser = message.role === 'user';
  const BotAvatar = bot.isCustom ? BotIcon : bot.avatar;

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4',
        isUser ? 'justify-end' : ''
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
            <AvatarFallback>
                <BotAvatar className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
            <AvatarFallback>
                <User className="h-5 w-5 text-muted-foreground" />
            </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
