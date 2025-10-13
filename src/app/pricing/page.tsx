"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Info, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSubscription } from "@/hooks/use-subscription";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";
import { useAuth } from "@/hooks/use-auth";

// IMPORTANT: This is now read from your .env.local file
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

const plans = [
  {
    id: "Free",
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    description: "For individuals getting started.",
    features: ["1 Custom Bot", "Limited daily chats", "Basic AI models"],
    cta: "Current Plan",
  },
  {
    id: "Pro",
    name: "Pro",
    monthlyPrice: 15,
    annualPrice: 144, // $12/month
    description: "For power users and professionals.",
    features: [
      "Unlimited Custom Bots",
      "Unlimited daily chats",
      "Access to premium AI models",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    monthlyPriceId: "price_1PbdHkRqp3Q5sW9pA2SGyE7e",
    annualPriceId: "price_1PbdHkRqp3Q5sW9p5NfAwb6g",
  },
];

function PaystackButton({
  isAnnual,
  onSuccessfulPayment,
}: {
  isAnnual: boolean;
  onSuccessfulPayment: () => void;
}) {
  const { user } = useAuth();
  const proPlan = plans.find((p) => p.id === "Pro")!;
  const priceInDollars = isAnnual ? proPlan.annualPrice : proPlan.monthlyPrice;

  // Note: Paystack charges in the currency of your account.
  // This example assumes a Nigerian account, so we would need to convert USD to NGN.
  // For this simulation, we'll use a fixed NGN amount.
  // In a real app, you would fetch the current exchange rate.
  const priceInKobo = priceInDollars * 1500 * 100; // Example: 1 USD = 1500 NGN, and price is in kobo

  const config = {
    reference: new Date().getTime().toString(),
    email: user?.email || "",
    amount: priceInKobo,
    publicKey: PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(config);
  const { toast } = useToast();

  const handleSuccess = () => {
    onSuccessfulPayment();
  };

  const handleClose = () => {
    // User closed the popup
  };

  const handleClick = () => {
    if (!PAYSTACK_PUBLIC_KEY) {
      toast({
        title: "Configuration Error",
        description:
          "Paystack public key is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }
    initializePayment({ onSuccess: handleSuccess, onClose: handleClose });
  };

  return (
    <Button className="w-full" onClick={handleClick}>
      Upgrade to Pro
    </Button>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const { plan, setPlan, loading: subscriptionLoading } = useSubscription();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  // const handleSuccessfulPayment = async () => {
  //   setIsUpgrading(true);
  //   // Simulate a brief delay for UX
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  //   setPlan("Pro");
  //   setIsUpgrading(false);
  //   toast({
  //     title: "Upgrade Successful!",
  //     description: "You're now on the Pro plan. All features are unlocked.",
  //   });
  //   router.push("/chat/general/knowledge");
  // };
  const handleSuccessfulPayment = async (reference?: string) => {
    setIsUpgrading(true);
    try {
      // Call your verification API route
      const res = await fetch("/api/paystack/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference, // comes from Paystack
          userId: user?.uid,
        }),
      });

      if (res.ok) {
        setPlan("Pro");
        toast({
          title: "Upgrade Successful!",
          description: "Your subscription has been verified and upgraded.",
        });
        router.push("/chat/general/knowledge");
      } else {
        toast({
          title: "Verification Failed",
          description:
            "We couldn’t verify your payment. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Error",
        description: "Something went wrong verifying your payment.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const currentPlanId = plan;

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 pt-12 md:pt-20">
      <div className="mb-8 md:mb-10 max-w-2xl text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          Find the perfect plan for you
        </h1>
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          Start for free and scale up as you grow. All plans include access to
          our powerful AI chatbot platform.
        </p>
      </div>

      <div className="flex items-center justify-center space-x-2 md:space-x-3 mb-8">
        <Label
          htmlFor="billing-cycle"
          className={cn("font-medium", !isAnnual && "text-primary")}
        >
          Monthly
        </Label>
        <Switch
          id="billing-cycle"
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
        />
        <Label
          htmlFor="billing-cycle"
          className={cn("font-medium", isAnnual && "text-primary")}
        >
          Annual
        </Label>
        <div className="hidden sm:flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Info className="h-3.5 w-3.5" />
          Save 20%
        </div>
      </div>

      <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
        {plans.map((p) => {
          const isCurrent = p.id === currentPlanId;
          const isPro = p.id === "Pro";
          return (
            <Card
              key={p.id}
              className={`flex flex-col ${
                isCurrent && isPro ? "border-primary ring-2 ring-primary" : ""
              }`}
            >
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="text-4xl font-bold">
                  ${isAnnual ? p.annualPrice / 12 : p.monthlyPrice}
                  <span className="text-lg font-normal text-muted-foreground">
                    / month
                  </span>
                  {p.name === "Pro" && isAnnual && (
                    <p className="text-sm font-normal text-muted-foreground">
                      Billed as ${p.annualPrice} per year
                    </p>
                  )}
                </div>
                <ul className="space-y-2">
                  {p.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Button className="w-full" disabled variant={"outline"}>
                    Current Plan
                  </Button>
                ) : p.id === "Pro" ? (
                  isUpgrading || subscriptionLoading ? (
                    <Button className="w-full" disabled>
                      <Loader2 className="animate-spin" />
                    </Button>
                  ) : (
                    <PaystackButton
                      isAnnual={isAnnual}
                      onSuccessfulPayment={handleSuccessfulPayment}
                    />
                  )
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Have questions?{" "}
        <Link href="#" className="font-medium text-primary hover:underline">
          Contact us
        </Link>
      </p>
    </div>
  );
}
