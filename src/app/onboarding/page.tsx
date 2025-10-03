
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BrainCircuit, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CarouselApi } from '@/components/ui/carousel';

const onboardingSteps = [
  {
    icon: BrainCircuit,
    title: 'Welcome to CampusAI Pro',
    description: 'Your new hub for specialized AI assistants. Get ready to supercharge your learning and productivity.',
    image: 'https://picsum.photos/seed/welcome/800/600',
    hint: 'welcome robot'
  },
  {
    icon: Bot,
    title: 'Create Your Own Custom Bots',
    description: 'Tailor AI assistants to your specific needs. Create bots for any academic field or profession you can imagine.',
    image: 'https://picsum.photos/seed/create/800/600',
    hint: 'robot assembly'
  },
  {
    icon: Sparkles,
    title: 'Unlock Your Full Potential',
    description: 'Start exploring our pre-built bots or create your own. Upgrade to Pro for unlimited access and premium features.',
    image: 'https://picsum.photos/seed/unlock/800/600',
    hint: 'glowing brain'
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const handleComplete = () => {
    try {
      localStorage.setItem('onboardingComplete', 'true');
    } catch (e) {
      console.error("Failed to set onboarding completion flag in localStorage", e);
    }
    router.replace('/chat/general/knowledge');
  };
  
  useState(() => {
    if (!api) {
      return
    }
 
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  })

  const isLastStep = current === onboardingSteps.length;

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-4xl flex-col items-center">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {onboardingSteps.map((step, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <CardContent className="grid gap-8 p-0 md:grid-cols-2">
                       <div className="relative h-64 w-full md:h-full">
                         <Image 
                           src={step.image} 
                           alt={step.title}
                           fill
                           style={{ objectFit: 'cover' }}
                           data-ai-hint={step.hint}
                         />
                       </div>
                       <div className="flex flex-col items-start justify-center p-8">
                          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <step.icon className="h-6 w-6" />
                          </div>
                          <h2 className="mb-2 text-2xl font-bold">{step.title}</h2>
                          <p className="text-muted-foreground">{step.description}</p>
                       </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
        <div className="mt-6 flex w-full items-center justify-between">
            <div className="flex gap-2">
                {onboardingSteps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => api?.scrollTo(index)}
                        className={cn(
                            "h-2 w-2 rounded-full bg-muted transition-all",
                            current - 1 === index && "w-6 bg-primary"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            <Button onClick={handleComplete} size="lg">
              {isLastStep ? "Get Started" : "Skip"}
            </Button>
        </div>
      </div>
    </div>
  );
}
