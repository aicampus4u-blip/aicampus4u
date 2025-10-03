
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCustomBots } from '@/hooks/use-custom-bots';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  description: z.string().min(10, 'Description is too short.').max(200),
  type: z.enum(['field', 'profession', 'topic']),
});

export function CreateBotDialog({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();
  const { bots, addBot, botLimit } = useCustomBots();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  
  const hasReachedLimit = bots.length >= botLimit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'field',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (hasReachedLimit) return;
    setIsCreating(true);
    try {
      const newBot = await addBot(values);
      toast({
        title: 'Bot Created!',
        description: `Your new bot "${newBot.name}" is ready.`,
      });
      handleOpenChange(false);
      form.reset();
      router.push(`/chat/custom/${newBot.id}`);
    } catch (error) {
      // Error toast is handled in the hook
    } finally {
      setIsCreating(false);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (onOpenChange) {
        onOpenChange(isOpen)
    } else {
        setInternalOpen(isOpen)
    }
    if (!isOpen) {
      form.reset();
    }
  }
  
  const finalOpen = open !== undefined ? open : internalOpen;

  return (
    <Dialog open={finalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Bot</DialogTitle>
          <DialogDescription>
            Design a specialized AI assistant. Give it a name, a purpose, and a
            type.
          </DialogDescription>
        </DialogHeader>
        {hasReachedLimit ? (
           <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Free Plan Limit Reached</AlertTitle>
            <AlertDescription>
              You have reached the maximum number of bots for the free plan. 
              <Link href="/pricing" onClick={() => handleOpenChange(false)} className="font-bold underline ml-1">
                Upgrade to Pro
              </Link>
               to create unlimited bots.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., The History of Rome"
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your bot's public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bot Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isCreating}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a bot type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="field">Academic Field</SelectItem>
                        <SelectItem value="profession">Profession</SelectItem>
                        <SelectItem value="topic">Topic</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Specialize in a field, career, or a specific topic.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., An expert tutor on the Roman Empire."
                        {...field}
                        disabled={isCreating}
                      />
                    </FormControl>
                    <FormDescription>
                      Briefly describe your bot's purpose.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Bot'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
