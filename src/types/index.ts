import type { ComponentType } from "react";
import { Bot as BotIcon } from "lucide-react";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: Date;
  userId: string;
  botId: string;
}

export type Bot = {
  id: string;
  name: string;
  description: string;
  type: "field" | "profession" | "general";
  avatar: ComponentType<{ className?: string }>;
  conversationStarters?: string[];
  isCustom: false;
};

export type CustomBot = {
  id: string;
  name: string;
  description: string;
  type: "field" | "profession" | "topic";
  isCustom: true;
  // persona: string;
  persona: string | Record<string, any>;
  createdAt: string;
  avatar: ComponentType<{ className?: string }>;
  conversationStarters?: string[];
};

export type AnyBot = Bot | CustomBot;
