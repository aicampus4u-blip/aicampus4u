"use client";

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenuAction,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  FEATURED_FIELD_BOTS,
  FEATURED_PROFESSION_BOTS,
  GENERAL_KNOWLEDGE_BOT,
} from "@/lib/bots";
import { Bot, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreateBotDialog } from "./create-bot-dialog";
import { useCustomBots } from "@/hooks/use-custom-bots";
import { useSubscription } from "@/hooks/use-subscription";
import type { AnyBot, CustomBot } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";

import { useAuth } from "@/hooks/use-auth";

function BotLink({ bot }: { bot: AnyBot }) {
  const pathname = usePathname();
  const url = bot.isCustom
    ? `/chat/custom/${bot.id}`
    : `/chat/${bot.type}/${bot.id}`;
  const isActive = pathname === url;

  const { deleteBot } = useCustomBots();

  const AvatarComponent = bot.isCustom ? Bot : bot.avatar;

  return (
    <SidebarMenuItem>
      <Link href={url} className="block w-full">
        <SidebarMenuButton isActive={isActive}>
          <AvatarComponent className="h-4 w-4" />
          <span>{bot.name}</span>
        </SidebarMenuButton>
      </Link>
      {bot.isCustom && (
        <SidebarMenuAction
          showOnHover
          onClick={() => deleteBot((bot as CustomBot).id)}
        >
          <Trash2 />
        </SidebarMenuAction>
      )}
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { bots: customBots, loading } = useCustomBots();
  const { plan, status, loading: subscriptionLoading } = useSubscription();
  const { user } = useAuth();

  if (subscriptionLoading) {
    return <div className="p-6 text-sm">Loading subscription...</div>;
  }

  return (
    <>
      <SidebarContent className="p-2">
        <div className="mb-4 p-3 border rounded-lg bg-muted">
          <p className="text-sm">
            <strong>Current Plan:</strong> {plan}
          </p>
          <p className="text-sm">
            <strong>Status:</strong> {status}
          </p>
        </div>

        <p className="text-xs px-2">
          Logged in as: {user?.email || "No user logged in"}
        </p>

        <SidebarHeader className="p-0">
          <CreateBotDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Bot
            </Button>
          </CreateBotDialog>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            <BotLink bot={GENERAL_KNOWLEDGE_BOT} />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Fields</SidebarGroupLabel>
          <SidebarMenu>
            {FEATURED_FIELD_BOTS.map((bot) => (
              <BotLink key={bot.id} bot={bot} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Professions</SidebarGroupLabel>
          <SidebarMenu>
            {FEATURED_PROFESSION_BOTS.map((bot) => (
              <BotLink key={bot.id} bot={bot} />
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>My Bots</SidebarGroupLabel>
          <SidebarMenu>
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))
            ) : customBots.length > 0 ? (
              customBots.map((bot) => <BotLink key={bot.id} bot={bot} />)
            ) : (
              <p className="px-2 text-sm text-muted-foreground">
                You haven't created any bots yet.
              </p>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <p className="text-xs text-muted-foreground">© 2024 CampusAI Pro</p>
      </SidebarFooter>
    </>
  );
}
