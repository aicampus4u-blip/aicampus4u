'use client';

import { useState } from 'react';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bot, Plus, Home } from 'lucide-react';
import { CreateBotDialog } from './create-bot-dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const { toggleSidebar } = useSidebar();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/chat/general/knowledge', icon: Home, label: 'Home' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/95 p-1 backdrop-blur-sm md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3">
        <Button variant="ghost" className="flex h-auto flex-col gap-1 p-2" onClick={toggleSidebar}>
          <Bot className="h-5 w-5" />
          <span className="text-xs">Bots</span>
        </Button>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="inline-flex flex-col items-center justify-center gap-1 p-2">
            <Button variant="ghost" className={cn("flex h-auto flex-col gap-1 p-2", pathname === item.href && "text-primary bg-accent")}>
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
            </Button>
        </Link>
        ))}
        <CreateBotDialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <Button variant="ghost" className="flex h-auto flex-col gap-1 p-2" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-5 w-5" />
            <span className="text-xs">New Bot</span>
          </Button>
        </CreateBotDialog>
      </div>
    </div>
  );
}
