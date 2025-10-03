
'use client';
// This is a workaround for the fact that we can't have two 'use client' contexts in the same file that depend on each other.
// We are making a separate provider for the subscription context.
import { useSubscription } from './use-subscription';
import { ReactNode } from 'react';

// A no-op provider since the hook manages its own state via localStorage.
// We need this to ensure the hook is initialized within the component tree
// and can be used by other components.
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  useSubscription();
  return <>{children}</>;
}
